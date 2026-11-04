// [BE] Server Action đồng ý nghiên cứu · tài liệu mục 4.6, 5.3 và 7.10
'use server';

import type { ActionResult } from "@/shared/utils/errors";
import { createClient } from "@/server/supabase/server";
import { z } from "zod";

const recordConsentSchema = z.object({
  studentId: z.string().uuid("Mã học sinh không hợp lệ"),
  status: z.enum(["granted", "denied", "revoked"]).default("granted"),
  consentedBy: z.enum(["student", "parent", "both"]).default("student"),
  formVersion: z.string().min(1).default("v1.0"),
  note: z.string().trim().optional(),
});

export async function recordConsent(input: unknown): Promise<ActionResult> {
  try {
    const parsed = recordConsentSchema.safeParse(input);
    if (!parsed.success) {
      return { ok: false, error: parsed.error.errors[0]?.message || "Dữ liệu đồng ý nghiên cứu không hợp lệ" };
    }

    const { studentId, status, consentedBy, formVersion, note } = parsed.data;
    const supabase = await createClient();

    // Gọi RPC record_consent
    const { error } = await supabase.rpc("record_consent", {
      p_student_id: studentId,
      p_status: status,
      p_consented_by: consentedBy,
      p_form_version: formVersion,
      p_note: note || null,
    });

    if (error) {
      return { ok: false, error: error.message };
    }

    return { ok: true, data: undefined };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Lỗi ghi nhận đồng ý nghiên cứu";
    return { ok: false, error: msg };
  }
}

const revokeConsentSchema = z.object({
  studentId: z.string().uuid("Mã học sinh không hợp lệ"),
  note: z.string().trim().optional(),
});

export async function revokeConsent(input: unknown): Promise<ActionResult> {
  try {
    const parsed = revokeConsentSchema.safeParse(input);
    if (!parsed.success) {
      return { ok: false, error: "Dữ liệu rút lại không hợp lệ" };
    }

    const { studentId, note } = parsed.data;
    const supabase = await createClient();

    const { error } = await supabase.rpc("record_consent", {
      p_student_id: studentId,
      p_status: "revoked",
      p_consented_by: "student",
      p_form_version: "v1.0",
      p_note: note || "Học sinh/phụ huynh yêu cầu rút lại sự đồng ý",
    });

    if (error) {
      return { ok: false, error: error.message };
    }

    return { ok: true, data: undefined };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Lỗi rút lại sự đồng ý";
    return { ok: false, error: msg };
  }
}
