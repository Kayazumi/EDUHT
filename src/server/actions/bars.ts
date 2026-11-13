// [BE] Server Action cấu hình BARS · tài liệu mục 4.6 và 5.3
'use server';

import type { ActionResult } from "@/shared/utils/errors";
import { createClient } from "@/server/supabase/server";
import { requireRole } from "@/server/auth/guards";
import { z } from "zod";

const barsLevelSchema = z.object({
  level: z.coerce.number().int().min(1).max(4),
  behaviorText: z.string().trim().min(5, "Mô tả mức tối thiểu 5 ký tự"),
  points: z.coerce.number().min(0).max(10),
});

const createCriterionSchema = z.object({
  projectId: z.string().uuid().nullable().optional(),
  title: z.string().trim().min(3, "Tên tiêu chí tối thiểu 3 ký tự").max(120),
  description: z.string().trim().optional(),
  weight: z.coerce.number().int().min(1).max(5).default(1),
  position: z.coerce.number().default(0),
  levels: z.array(barsLevelSchema).length(4, "Tiêu chí BARS bắt buộc phải có đúng 4 mức hành vi (INV-04)"),
});

export async function createCriterion(input: unknown): Promise<ActionResult<{ id: string }>> {
  try {
    const parsed = createCriterionSchema.safeParse(input);
    if (!parsed.success) {
      return { ok: false, error: parsed.error.errors[0]?.message || "Dữ liệu tiêu chí BARS không hợp lệ" };
    }

    const { projectId, title, description, weight, position, levels } = parsed.data;
    if (projectId) await requireRole("teacher"); else await requireRole("admin");

    // Kiểm tra điểm tăng dần nghiêm ngặt (INV-04)
    for (let i = 0; i < levels.length - 1; i++) {
      const p1 = levels[i]?.points;
      const p2 = levels[i + 1]?.points;
      if (p1 !== undefined && p2 !== undefined && p1 >= p2) {
        return { ok: false, error: "Điểm của 4 mức hành vi phải tăng dần nghiêm ngặt (Mức 1 < Mức 2 < Mức 3 < Mức 4) theo INV-04" };
      }
    }

    const supabase = await createClient();

    // 1. Thêm bars_criteria
    const { data: crit, error: critErr } = await supabase
      .from("bars_criteria")
      .insert({
        is_template: !projectId,
        project_id: projectId || null,
        template_name: projectId ? null : "BARS chuẩn",
        title,
        description: description || null,
        weight,
        position: Math.max(1, Math.trunc(position)),
      })
      .select("id")
      .single();

    if (critErr || !crit) {
      return { ok: false, error: critErr?.message || "Không thể tạo tiêu chí BARS" };
    }

    // 2. Thêm 4 mức levels và points
    for (const lvl of levels) {
      const { error: lvlErr } = await supabase
        .from("bars_levels")
        .insert({
          criterion_id: crit.id,
          level: lvl.level,
          behavior_text: lvl.behaviorText,
        });

      if (lvlErr) {
        await supabase.from("bars_criteria").delete().eq("id", crit.id);
        return { ok: false, error: "Lỗi tạo mức hành vi: " + (lvlErr?.message || "") };
      }

      const { error: pointsError } = await supabase.from("bars_level_points").insert({
        criterion_id: crit.id,
        level: lvl.level,
        points: lvl.points,
      });
      if (pointsError) {
        await supabase.from("bars_criteria").delete().eq("id", crit.id);
        return { ok: false, error: "Lỗi lưu điểm quy đổi: " + pointsError.message };
      }
    }

    return { ok: true, data: { id: crit.id } };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Lỗi tạo tiêu chí BARS";
    return { ok: false, error: msg };
  }
}

const updateCriterionSchema = z.object({
  id: z.string().uuid(),
  title: z.string().trim().min(3).max(120),
  description: z.string().trim().optional(),
  weight: z.coerce.number().int().min(1).max(5),
});

export async function updateCriterion(input: unknown): Promise<ActionResult> {
  try {
    await requireRole("admin");
    const parsed = updateCriterionSchema.safeParse(input);
    if (!parsed.success) {
      return { ok: false, error: "Dữ liệu cập nhật không hợp lệ" };
    }

    const { id, title, description, weight } = parsed.data;
    const supabase = await createClient();

    const { error } = await supabase
      .from("bars_criteria")
      .update({
        title,
        description: description || null,
        weight,
      })
      .eq("id", id);

    if (error) {
      return { ok: false, error: error.message };
    }

    return { ok: true, data: undefined };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Lỗi cập nhật tiêu chí BARS";
    return { ok: false, error: msg };
  }
}

const deleteCriterionSchema = z.object({
  id: z.string().uuid(),
});

export async function deleteCriterion(input: unknown): Promise<ActionResult> {
  try {
    await requireRole("admin");
    const parsed = deleteCriterionSchema.safeParse(input);
    if (!parsed.success) {
      return { ok: false, error: "Mã tiêu chí không hợp lệ" };
    }

    const supabase = await createClient();
    const { error } = await supabase
      .from("bars_criteria")
      .delete()
      .eq("id", parsed.data.id);

    if (error) {
      return { ok: false, error: error.message };
    }

    return { ok: true, data: undefined };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Lỗi xóa tiêu chí BARS";
    return { ok: false, error: msg };
  }
}

const reorderCriteriaSchema = z.object({
  items: z.array(
    z.object({
      id: z.string().uuid(),
      position: z.number().int(),
    })
  ),
});

export async function reorderCriteria(input: unknown): Promise<ActionResult> {
  try {
    await requireRole("admin");
    const parsed = reorderCriteriaSchema.safeParse(input);
    if (!parsed.success) {
      return { ok: false, error: "Dữ liệu sắp xếp không hợp lệ" };
    }

    const supabase = await createClient();
    for (const item of parsed.data.items) {
      const { error } = await supabase
        .from("bars_criteria")
        .update({ position: item.position })
        .eq("id", item.id);
      if (error) return { ok: false, error: error.message };
    }

    return { ok: true, data: undefined };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Lỗi sắp xếp tiêu chí BARS";
    return { ok: false, error: msg };
  }
}
