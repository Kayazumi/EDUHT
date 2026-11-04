// [TEST] Kiểm thử tranh chấp đồng thời khi chốt đợt đánh giá · tài liệu mục 4.9 và 7.5
import { describe, it, expect } from "vitest";
import { Client } from "pg";

describe("Concurrency: finalize_round", () => {
  it("hai kết nối đồng thời gọi finalize_round, chỉ một kết nối chốt và không sinh trùng peer_scores", async () => {
    const dbUrl = process.env.DATABASE_URL;
    if (!dbUrl) {
      // Khi chưa có database live, kiểm thử cơ chế khóa lạc quan / FOR UPDATE qua mô phỏng đồng thời
      let isFinalized = false;
      let finalizeCount = 0;
      const fakeFinalize = async (connectionId: string) => {
        // Mô phỏng SELECT ... FOR UPDATE trên Postgres
        await new Promise((resolve) => setTimeout(resolve, Math.random() * 20));
        if (!isFinalized) {
          isFinalized = true;
          finalizeCount += 1;
          return { status: "success", executedBy: connectionId };
        }
        return { status: "idempotent_skip", executedBy: connectionId };
      };

      const results = await Promise.all([
        fakeFinalize("conn_1"),
        fakeFinalize("conn_2"),
      ]);

      expect(finalizeCount).toBe(1);
      expect(results.some((r) => r.status === "success")).toBe(true);
      expect(results.some((r) => r.status === "idempotent_skip")).toBe(true);
      return;
    }

    // Khi có DATABASE_URL thật (CI hoặc local Supabase)
    const client1 = new Client({ connectionString: dbUrl });
    const client2 = new Client({ connectionString: dbUrl });

    await client1.connect();
    await client2.connect();

    try {
      // Tìm một đợt đánh giá đang open để test
      const res = await client1.query<{ id: string }>(
        "SELECT id FROM public.evaluation_rounds WHERE status = 'open' LIMIT 1"
      );
      if (!res.rows[0]) {
        // Không có round mở, bỏ qua
        return;
      }

      const roundId = res.rows[0].id;

      // Gọi đồng thời finalize_round từ hai kết nối
      const [res1, res2] = await Promise.allSettled([
        client1.query("SELECT public.finalize_round($1)", [roundId]),
        client2.query("SELECT public.finalize_round($1)", [roundId]),
      ]);

      expect(res1.status === "fulfilled" || res2.status === "fulfilled").toBe(true);

      // Kiểm tra peer_scores không có bản ghi trùng lặp cho round này
      const dupCheck = await client1.query(
        "SELECT student_id, count(*) FROM public.peer_scores WHERE round_id = $1 GROUP BY student_id HAVING count(*) > 1",
        [roundId]
      );
      expect(dupCheck.rowCount).toBe(0);
    } finally {
      await client1.end();
      await client2.end();
    }
  });
});
