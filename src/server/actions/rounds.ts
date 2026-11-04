// [BE] Server Action quản lý đợt đánh giá · tài liệu mục 4.6, 5.3 và 7.3
'use server';

import type { ActionResult } from "@/shared/utils/errors";
import { createClient } from "@/server/supabase/server";
import { z } from "zod";

const createRoundSchema = z
  .object({
    projectId: z.string().uuid("Mã dự án không hợp lệ"),
    name: z.string().trim().min(3, "Tên đợt tối thiểu 3 ký tự").max(100),
    opensAt: z.string().datetime({ offset: true, message: "Thời gian mở không hợp lệ" }).or(z.string().min(10)),
    closesAt: z.string().datetime({ offset: true, message: "Hạn chót đóng không hợp lệ" }).or(z.string().min(10)),
  })
  .refine((data) => new Date(data.closesAt) > new Date(data.opensAt), {
    message: "Hạn chót đóng phải diễn ra sau thời gian mở đợt",
    path: ["closesAt"],
  });

export async function createRound(input: unknown): Promise<ActionResult<{ id: string }>> {
  try {
    const parsed = createRoundSchema.safeParse(input);
    if (!parsed.success) {
      return { ok: false, error: parsed.error.errors[0]?.message || "Dữ liệu đợt đánh giá không hợp lệ" };
    }

    const { projectId, name, opensAt, closesAt } = parsed.data;
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("evaluation_rounds")
      .insert({
        project_id: projectId,
        name,
        opens_at: new Date(opensAt).toISOString(),
        closes_at: new Date(closesAt).toISOString(),
        status: "draft",
      })
      .select("id")
      .single();

    if (error || !data) {
      return { ok: false, error: error?.message || "Không thể tạo đợt đánh giá" };
    }

    return { ok: true, data: { id: data.id } };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Lỗi tạo đợt đánh giá";
    return { ok: false, error: msg };
  }
}

const roundIdSchema = z.object({
  roundId: z.string().uuid("Mã đợt đánh giá không hợp lệ"),
});

export async function openRound(input: unknown): Promise<ActionResult> {
  try {
    const parsed = roundIdSchema.safeParse(input);
    if (!parsed.success) {
      return { ok: false, error: "Mã đợt đánh giá không hợp lệ" };
    }

    const supabase = await createClient();
    // Gọi RPC open_round kiểm tra nhóm đã khóa, tiêu chí BARS hợp lệ và sinh phiếu đánh giá
    const { error } = await supabase.rpc("open_round", {
      p_round_id: parsed.data.roundId,
    });

    if (error) {
      return { ok: false, error: error.message };
    }

    return { ok: true, data: undefined };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Lỗi mở đợt đánh giá";
    return { ok: false, error: msg };
  }
}

export async function finalizeRound(input: unknown): Promise<ActionResult> {
  try {
    const parsed = roundIdSchema.safeParse(input);
    if (!parsed.success) {
      return { ok: false, error: "Mã đợt đánh giá không hợp lệ" };
    }

    const supabase = await createClient();
    // Gọi RPC finalize_round tính toán điểm trung bình BARS và đóng đợt
    const { error } = await supabase.rpc("finalize_round", {
      p_round_id: parsed.data.roundId,
    });

    if (error) {
      return { ok: false, error: error.message };
    }

    return { ok: true, data: undefined };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Lỗi chốt đợt đánh giá";
    return { ok: false, error: msg };
  }
}

const extendRoundSchema = z.object({
  roundId: z.string().uuid("Mã đợt đánh giá không hợp lệ"),
  newClosesAt: z.string().min(10, "Thời gian hạn chót mới không hợp lệ"),
});

export async function extendRound(input: unknown): Promise<ActionResult> {
  try {
    const parsed = extendRoundSchema.safeParse(input);
    if (!parsed.success) {
      return { ok: false, error: "Dữ liệu gia hạn không hợp lệ" };
    }

    const { roundId, newClosesAt } = parsed.data;
    const supabase = await createClient();

    const { error } = await supabase
      .from("evaluation_rounds")
      .update({ closes_at: new Date(newClosesAt).toISOString() })
      .eq("id", roundId);

    if (error) {
      return { ok: false, error: error.message };
    }

    return { ok: true, data: undefined };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Lỗi gia hạn đợt đánh giá";
    return { ok: false, error: msg };
  }
}
