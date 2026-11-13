// [BE] Server Action kho nhiệm vụ mẫu · tài liệu mục 4.6 và 5.3
'use server';

import type { ActionResult } from "@/shared/utils/errors";
import { createClient } from "@/server/supabase/server";
import { requireRole } from "@/server/auth/guards";
import { z } from "zod";

const createTemplateSchema = z.object({
  projectId: z.string().uuid("Mã dự án không hợp lệ"),
  title: z.string().trim().min(3, "Tiêu đề nhiệm vụ tối thiểu 3 ký tự").max(150),
  description: z.string().trim().optional(),
  suggestedDurationDays: z.coerce.number().int().min(1).max(180).optional(),
  position: z.coerce.number().default(0),
  requirementCodes: z.array(z.string()).default([]),
});

export async function createTemplate(input: unknown): Promise<ActionResult<{ id: string }>> {
  try {
    await requireRole("teacher");
    const parsed = createTemplateSchema.safeParse(input);
    if (!parsed.success) {
      return { ok: false, error: parsed.error.errors[0]?.message || "Dữ liệu nhiệm vụ mẫu không hợp lệ" };
    }

    const { projectId, title, description, suggestedDurationDays, position, requirementCodes } = parsed.data;
    const supabase = await createClient();

    const { data: template, error: tmplErr } = await supabase
      .from("task_templates")
      .insert({
        project_id: projectId,
        title,
        description: description || null,
        default_due_on: suggestedDurationDays
          ? new Date(Date.now() + suggestedDurationDays * 86_400_000).toISOString().slice(0, 10)
          : null,
        position,
      })
      .select("id")
      .single();

    if (tmplErr || !template) {
      return { ok: false, error: tmplErr?.message || "Không thể tạo nhiệm vụ mẫu" };
    }

    // Gắn các mã YCCĐ nếu có
    if (requirementCodes.length > 0) {
      const { data: requirements, error: requirementError } = await supabase
        .from("learning_requirements")
        .select("id,code")
        .in("code", requirementCodes);
      if (requirementError || (requirements?.length ?? 0) !== requirementCodes.length) {
        await supabase.from("task_templates").delete().eq("id", template.id);
        return { ok: false, error: requirementError?.message || "Một hoặc nhiều mã YCCĐ không tồn tại" };
      }
      const rows = (requirements ?? []).map((requirement) => ({
        template_id: template.id,
        requirement_id: requirement.id,
      }));
      const { error: attachError } = await supabase.from("task_template_requirements").insert(rows);
      if (attachError) {
        await supabase.from("task_templates").delete().eq("id", template.id);
        return { ok: false, error: attachError.message };
      }
    }

    return { ok: true, data: { id: template.id } };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Lỗi tạo nhiệm vụ mẫu";
    return { ok: false, error: msg };
  }
}

const updateTemplateSchema = z.object({
  id: z.string().uuid(),
  title: z.string().trim().min(3).max(150),
  description: z.string().trim().optional(),
  suggestedDurationDays: z.coerce.number().int().min(1).max(180).optional(),
});

export async function updateTemplate(input: unknown): Promise<ActionResult> {
  try {
    await requireRole("teacher");
    const parsed = updateTemplateSchema.safeParse(input);
    if (!parsed.success) {
      return { ok: false, error: "Dữ liệu cập nhật không hợp lệ" };
    }

    const { id, title, description, suggestedDurationDays } = parsed.data;
    const supabase = await createClient();

    const { error } = await supabase
      .from("task_templates")
      .update({
        title,
        description: description || null,
        default_due_on: suggestedDurationDays
          ? new Date(Date.now() + suggestedDurationDays * 86_400_000).toISOString().slice(0, 10)
          : null,
      })
      .eq("id", id);

    if (error) {
      return { ok: false, error: error.message };
    }

    return { ok: true, data: undefined };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Lỗi cập nhật nhiệm vụ mẫu";
    return { ok: false, error: msg };
  }
}

const templateIdSchema = z.object({
  id: z.string().uuid(),
});

export async function deleteTemplate(input: unknown): Promise<ActionResult> {
  try {
    await requireRole("teacher");
    const parsed = templateIdSchema.safeParse(input);
    if (!parsed.success) {
      return { ok: false, error: "Mã nhiệm vụ mẫu không hợp lệ" };
    }

    const supabase = await createClient();
    const { error } = await supabase
      .from("task_templates")
      .delete()
      .eq("id", parsed.data.id);

    if (error) {
      return { ok: false, error: error.message };
    }

    return { ok: true, data: undefined };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Lỗi xóa nhiệm vụ mẫu";
    return { ok: false, error: msg };
  }
}

const attachStandardSchema = z.object({
  templateId: z.string().uuid(),
  requirementCode: z.string().trim(),
});

export async function attachStandard(input: unknown): Promise<ActionResult> {
  try {
    await requireRole("teacher");
    const parsed = attachStandardSchema.safeParse(input);
    if (!parsed.success) {
      return { ok: false, error: "Dữ liệu gắn YCCĐ không hợp lệ" };
    }

    const { templateId, requirementCode } = parsed.data;
    const supabase = await createClient();

    const { data: requirement, error: requirementError } = await supabase
      .from("learning_requirements")
      .select("id")
      .eq("code", requirementCode)
      .maybeSingle();
    if (requirementError || !requirement) return { ok: false, error: "Không tìm thấy mã YCCĐ" };
    const { error } = await supabase
      .from("task_template_requirements")
      .insert({
        template_id: templateId,
        requirement_id: requirement.id,
      });

    if (error) {
      return { ok: false, error: error.message };
    }

    return { ok: true, data: undefined };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Lỗi gắn YCCĐ vào nhiệm vụ";
    return { ok: false, error: msg };
  }
}

export async function detachStandard(input: unknown): Promise<ActionResult> {
  try {
    await requireRole("teacher");
    const parsed = attachStandardSchema.safeParse(input);
    if (!parsed.success) {
      return { ok: false, error: "Dữ liệu gỡ YCCĐ không hợp lệ" };
    }

    const { templateId, requirementCode } = parsed.data;
    const supabase = await createClient();

    const { data: requirement, error: requirementError } = await supabase
      .from("learning_requirements")
      .select("id")
      .eq("code", requirementCode)
      .maybeSingle();
    if (requirementError || !requirement) return { ok: false, error: "Không tìm thấy mã YCCĐ" };
    const { error } = await supabase
      .from("task_template_requirements")
      .delete()
      .eq("template_id", templateId)
      .eq("requirement_id", requirement.id);

    if (error) {
      return { ok: false, error: error.message };
    }

    return { ok: true, data: undefined };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Lỗi gỡ YCCĐ khỏi nhiệm vụ";
    return { ok: false, error: msg };
  }
}
