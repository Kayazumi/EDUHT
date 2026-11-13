// [BE] Server Action đánh giá đồng đẳng · tài liệu mục 4.6, 5.3 và 7.3
'use server';

import type { ActionResult } from "@/shared/utils/errors";
import { createClient } from "@/server/supabase/server";
import { requireRole } from "@/server/auth/guards";
import { z } from "zod";

const reviewAnswerSchema = z.object({
  criterionId: z.string().uuid("Mã tiêu chí không hợp lệ"),
  level: z.coerce.number().int().min(1).max(4),
});

const reviewInputSchema = z.object({
  roundId: z.string().uuid("Mã đợt không hợp lệ"),
  rateeId: z.string().uuid("Mã bạn được chấm không hợp lệ"),
  answers: z.array(reviewAnswerSchema).min(1, "Cần chọn ít nhất một tiêu chí"),
  comment: z.string().trim().optional(),
});

export async function saveDraftReview(input: unknown): Promise<ActionResult<{ reviewId: string }>> {
  try {
    await requireRole("student");
    const parsed = reviewInputSchema.safeParse(input);
    if (!parsed.success) {
      return { ok: false, error: parsed.error.errors[0]?.message || "Dữ liệu đánh giá không hợp lệ" };
    }

    const { roundId, rateeId, answers, comment } = parsed.data;
    const supabase = await createClient();

    // Lấy thông tin phiên đăng nhập của rater
    const { data: userData } = await supabase.auth.getUser();
    if (!userData?.user) {
      return { ok: false, error: "Chưa đăng nhập" };
    }
    const raterId = userData.user.id;

    if (raterId === rateeId) {
      return { ok: false, error: "Học sinh không thể tự đánh giá chính mình" };
    }

    // 1. Tìm hoặc lấy peer_reviews
    const { data: review, error: revErr } = await supabase
      .from("peer_reviews")
      .select("id, submitted_at")
      .eq("round_id", roundId)
      .eq("rater_id", raterId)
      .eq("ratee_id", rateeId)
      .single();

    if (revErr || !review) {
      return { ok: false, error: "Không tìm thấy phiếu đánh giá trong đợt này" };
    }

    if (review.submitted_at) {
      return { ok: false, error: "Phiếu đánh giá đã nộp, không thể chỉnh sửa" };
    }

    // 2. Cập nhật nhận xét
    const { error: commentError } = await supabase
      .from("peer_reviews")
      .update({ comment: comment || null })
      .eq("id", review.id);
    if (commentError) return { ok: false, error: commentError.message };

    // 3. Upsert câu trả lời vào peer_review_answers
    for (const ans of answers) {
      const { error: answerError } = await supabase.from("peer_review_answers").upsert(
        {
          review_id: review.id,
          criterion_id: ans.criterionId,
          level: ans.level,
        },
        { onConflict: "review_id,criterion_id" }
      );
      if (answerError) return { ok: false, error: answerError.message };
    }

    return { ok: true, data: { reviewId: review.id } };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Lỗi lưu nháp phiếu đánh giá";
    return { ok: false, error: msg };
  }
}

export async function submitReview(input: unknown): Promise<ActionResult> {
  try {
    // 1. Lưu câu trả lời trước
    const saveRes = await saveDraftReview(input);
    if (!saveRes.ok) {
      return saveRes;
    }

    const supabase = await createClient();
    // 2. Gọi RPC submit_review để kiểm tra đầy đủ mọi tiêu chí và khóa phiếu vĩnh viễn
    const { error: rpcErr } = await supabase.rpc("submit_review", {
      p_review_id: saveRes.data.reviewId,
    });

    if (rpcErr) {
      return { ok: false, error: rpcErr.message };
    }

    return { ok: true, data: undefined };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Lỗi nộp phiếu đánh giá";
    return { ok: false, error: msg };
  }
}
