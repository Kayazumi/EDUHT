// [BE] Server Action chấm và công bố điểm · tài liệu mục 4.6, 5.3, 7.3 và 7.4
'use server';

import type { ActionResult } from "@/shared/utils/errors";
import { createClient } from "@/server/supabase/server";
import { requireRole } from "@/server/auth/guards";
import { z } from "zod";

const setGroupScoreSchema = z.object({
  groupId: z.string().uuid("Mã nhóm không hợp lệ"),
  projectId: z.string().uuid("Mã dự án không hợp lệ"),
  score: z.coerce.number().min(0, "Điểm phải >= 0.0").max(10, "Điểm phải <= 10.0"),
});

export async function setGroupScore(input: unknown): Promise<ActionResult> {
  try {
    const parsed = setGroupScoreSchema.safeParse(input);
    if (!parsed.success) {
      return { ok: false, error: parsed.error.errors[0]?.message || "Điểm nhóm không hợp lệ" };
    }

    const { groupId, score } = parsed.data;
    const profile = await requireRole("teacher");
    const supabase = await createClient();

    const { error } = await supabase.from("group_scores").upsert(
      {
        group_id: groupId,
        score,
        graded_by: profile.id,
        graded_at: new Date().toISOString(),
      },
      { onConflict: "group_id" }
    );

    if (error) {
      return { ok: false, error: error.message };
    }

    return { ok: true, data: undefined };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Lỗi lưu điểm nhóm";
    return { ok: false, error: msg };
  }
}

const computeScoresSchema = z.object({
  projectId: z.string().uuid("Mã dự án không hợp lệ"),
  roundId: z.string().uuid("Mã đợt đánh giá không hợp lệ"),
});

export async function computeFinalScores(input: unknown): Promise<ActionResult> {
  try {
    await requireRole("teacher");
    const parsed = computeScoresSchema.safeParse(input);
    if (!parsed.success) {
      return { ok: false, error: "Dữ liệu tính điểm không hợp lệ" };
    }

    const { projectId, roundId } = parsed.data;
    const supabase = await createClient();

    // Gọi RPC compute_final_scores
    const { error } = await supabase.rpc("compute_final_scores", {
      p_project_id: projectId,
      p_round_id: roundId,
    });

    if (error) {
      return { ok: false, error: error.message };
    }

    return { ok: true, data: undefined };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Lỗi tính điểm cá nhân";
    return { ok: false, error: msg };
  }
}

const adjustScoreSchema = z.object({
  projectId: z.string().uuid("Mã dự án không hợp lệ"),
  studentId: z.string().uuid("Mã học sinh không hợp lệ"),
  adjustedScore: z.coerce.number().min(0).max(10, "Điểm điều chỉnh phải từ 0.0 đến 10.0"),
  reason: z.string().trim().min(10, "Lý do điều chỉnh là bắt buộc và phải có ít nhất 10 ký tự (INV-08)"),
});

export async function adjustFinalScore(input: unknown): Promise<ActionResult> {
  try {
    await requireRole("teacher");
    const parsed = adjustScoreSchema.safeParse(input);
    if (!parsed.success) {
      return { ok: false, error: parsed.error.errors[0]?.message || "Dữ liệu điều chỉnh điểm không hợp lệ" };
    }

    const { projectId, studentId, adjustedScore, reason } = parsed.data;
    const supabase = await createClient();

    // Gọi RPC adjust_final_score (kiểm tra quyền GV, cập nhật điểm, tăng result_version, ghi score_events)
    const { error } = await supabase.rpc("adjust_final_score", {
      p_project_id: projectId,
      p_student_id: studentId,
      p_adjusted_score: adjustedScore,
      p_reason: reason,
    });

    if (error) {
      return { ok: false, error: error.message };
    }

    return { ok: true, data: undefined };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Lỗi điều chỉnh điểm cá nhân";
    return { ok: false, error: msg };
  }
}

const publishSchema = z.object({
  projectId: z.string().uuid("Mã dự án không hợp lệ"),
});

export async function publishResults(input: unknown): Promise<ActionResult> {
  try {
    await requireRole("teacher");
    const parsed = publishSchema.safeParse(input);
    if (!parsed.success) {
      return { ok: false, error: "Mã dự án không hợp lệ" };
    }

    const supabase = await createClient();
    // Gọi RPC publish_results
    const { error } = await supabase.rpc("publish_results", {
      p_project_id: parsed.data.projectId,
    });

    if (error) {
      return { ok: false, error: error.message };
    }

    return { ok: true, data: undefined };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Lỗi công bố điểm";
    return { ok: false, error: msg };
  }
}

const unpublishSchema = z.object({
  projectId: z.string().uuid("Mã dự án không hợp lệ"),
  reason: z.string().trim().min(5, "Lý do rút lại công bố tối thiểu 5 ký tự").default("Giáo viên rà soát lại kết quả"),
});

export async function unpublishResults(input: unknown): Promise<ActionResult> {
  try {
    await requireRole("teacher");
    const parsed = unpublishSchema.safeParse(input);
    if (!parsed.success) {
      return { ok: false, error: "Dữ liệu rút lại công bố không hợp lệ" };
    }

    const { projectId, reason } = parsed.data;
    const supabase = await createClient();

    // Gọi RPC unpublish_results
    const { error } = await supabase.rpc("unpublish_results", {
      p_project_id: projectId,
      p_reason: reason,
    });

    if (error) {
      return { ok: false, error: error.message };
    }

    return { ok: true, data: undefined };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Lỗi rút lại công bố điểm";
    return { ok: false, error: msg };
  }
}
