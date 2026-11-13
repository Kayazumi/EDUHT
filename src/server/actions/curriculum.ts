// [BE] Server Action danh mục YCCĐ · tài liệu mục 4.6 và 5.3
'use server';

import type { ActionResult } from "@/shared/utils/errors";
import { createClient } from "@/server/supabase/server";
import { requireAuthenticatedRole } from "@/server/auth/guards";
import { z } from "zod";

const createStandardSchema = z.object({
  code: z.string().trim().min(2).max(30),
  grade: z.coerce.number().int().refine((g) => [10, 11, 12].includes(g), "Khối phải là 10, 11 hoặc 12"),
  strand: z.enum(["CS", "ICT", "DL"], { message: "Mạch kiến thức phải là CS, ICT hoặc DL" }),
  content: z.string().trim().min(5, "Nội dung YCCĐ tối thiểu 5 ký tự"),
});

export async function createStandard(input: unknown): Promise<ActionResult<{ code: string }>> {
  try {
    await requireAuthenticatedRole("admin");
    const parsed = createStandardSchema.safeParse(input);
    if (!parsed.success) {
      return { ok: false, error: parsed.error.errors[0]?.message || "Dữ liệu YCCĐ không hợp lệ" };
    }

    const { code, grade, strand, content } = parsed.data;
    const supabase = await createClient();

    const { error } = await supabase
      .from("learning_requirements")
      .insert({
        code,
        grade,
        strand: strand.toLowerCase() as "cs" | "ict" | "dl",
        content,
      });

    if (error) {
      return { ok: false, error: error.message };
    }

    return { ok: true, data: { code } };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Lỗi thêm YCCĐ";
    return { ok: false, error: msg };
  }
}

const updateStandardSchema = z.object({
  code: z.string().trim().min(2),
  content: z.string().trim().min(5, "Nội dung YCCĐ tối thiểu 5 ký tự"),
});

export async function updateStandard(input: unknown): Promise<ActionResult> {
  try {
    await requireAuthenticatedRole("admin");
    const parsed = updateStandardSchema.safeParse(input);
    if (!parsed.success) {
      return { ok: false, error: "Dữ liệu cập nhật không hợp lệ" };
    }

    const { code, content } = parsed.data;
    const supabase = await createClient();

    const { error } = await supabase
      .from("learning_requirements")
      .update({ content })
      .eq("code", code);

    if (error) {
      return { ok: false, error: error.message };
    }

    return { ok: true, data: undefined };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Lỗi cập nhật YCCĐ";
    return { ok: false, error: msg };
  }
}

const deleteStandardSchema = z.object({
  code: z.string().trim().min(2),
});

export async function deleteStandard(input: unknown): Promise<ActionResult> {
  try {
    await requireAuthenticatedRole("admin");
    const parsed = deleteStandardSchema.safeParse(input);
    if (!parsed.success) {
      return { ok: false, error: "Mã YCCĐ không hợp lệ" };
    }

    const supabase = await createClient();
    const { error } = await supabase
      .from("learning_requirements")
      .delete()
      .eq("code", parsed.data.code);

    if (error) {
      return { ok: false, error: error.message };
    }

    return { ok: true, data: undefined };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Lỗi xóa YCCĐ";
    return { ok: false, error: msg };
  }
}
