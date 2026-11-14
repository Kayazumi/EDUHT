'use server';

import { createClient } from "@/server/supabase/server";
import { getProfile } from "@/server/auth/session";
import type { Role } from "@/shared/config/roles";
import type { ActionResult } from "@/shared/utils/errors";
import { z } from "zod";

const inputSchema = z.object({
  view: z.enum([
    "adminDashboard", "adminUsers", "adminUser", "adminClasses", "adminClass", "adminCurriculum", "adminBars", "adminResearch", "adminAudit",
    "teacherDashboard", "teacherProjects", "teacherClass", "teacherProject", "teacherTemplates", "teacherGroups", "teacherGroup", "teacherProgress", "teacherEvaluation", "teacherRound", "teacherGrading", "teacherExport",
    "studentDashboard", "studentProfile", "studentProject", "studentBoard", "studentReview", "studentReviewForm", "studentResults",
  ]),
  id: z.string().optional(),
  childId: z.string().optional(),
});
export type PortalDataView = z.infer<typeof inputSchema>["view"];

const rolesByView: Record<z.infer<typeof inputSchema>["view"], Role> = {
  adminDashboard: "admin", adminUsers: "admin", adminUser: "admin", adminClasses: "admin", adminClass: "admin", adminCurriculum: "admin", adminBars: "admin", adminResearch: "admin", adminAudit: "admin",
  teacherDashboard: "teacher", teacherProjects: "teacher", teacherClass: "teacher", teacherProject: "teacher", teacherTemplates: "teacher", teacherGroups: "teacher", teacherGroup: "teacher", teacherProgress: "teacher", teacherEvaluation: "teacher", teacherRound: "teacher", teacherGrading: "teacher", teacherExport: "teacher",
  studentDashboard: "student", studentProfile: "student", studentProject: "student", studentBoard: "student", studentReview: "student", studentReviewForm: "student", studentResults: "student",
};

export async function loadPortalData(input: unknown): Promise<ActionResult<unknown>> {
  const parsed = inputSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Yêu cầu tải dữ liệu không hợp lệ" };
  const { view, id, childId } = parsed.data;
  const profile = await getProfile();
  if (!profile || !profile.isActive) {
    return { ok: false, error: "Vui lòng đăng nhập bằng tài khoản thật để tải dữ liệu" };
  }
  if (profile.role !== rolesByView[view]) return { ok: false, error: "Bạn không có quyền xem dữ liệu này" };

  try {
    const db = await createClient();
    type DataRow = Record<string, unknown>;
    const rowString = (row: DataRow, key: string): string => {
      const value = row[key];
      if (typeof value !== "string") throw new Error(`Thiếu dữ liệu ${key} trong kết quả truy vấn`);
      return value;
    };
    const query = async (table: string, columns = "*"): Promise<DataRow[]> => {
      const { data, error } = await db.from(table).select(columns);
      if (error) throw error;
      return (data ?? []) as unknown as DataRow[];
    };
    const one = async (table: string, key: string, value: string | undefined, columns = "*"): Promise<DataRow | null> => {
      if (!value) return null;
      const { data, error } = await db.from(table).select(columns).eq(key, value).maybeSingle();
      if (error) throw error;
      return data as unknown as DataRow | null;
    };
    const ids = async (table: string, key: string, values: string[], columns = "*"): Promise<DataRow[]> => {
      if (!values.length) return [];
      const { data, error } = await db.from(table).select(columns).in(key, values);
      if (error) throw error;
      return (data ?? []) as unknown as DataRow[];
    };
    const filtered = async (table: string, key: string, value: string | undefined, columns = "*"): Promise<DataRow[]> => {
      if (!value) return [];
      const { data, error } = await db.from(table).select(columns).eq(key, value);
      if (error) throw error;
      return (data ?? []) as unknown as DataRow[];
    };

    switch (view) {
      case "adminDashboard": {
        const [profiles, classes, projects, logs] = await Promise.all([
          query("profiles", "id,role,is_active"), query("classes", "id"), query("projects", "id,status"),
          db.from("audit_logs").select("id,actor_id,action,target_table,target_id,detail,created_at").order("created_at", { ascending: false }).limit(8),
        ]);
        if (logs.error) throw logs.error;
        return { ok: true, data: { profiles, classes, projects, logs: logs.data ?? [] } };
      }
      case "adminUsers": {
        const [profiles, memberships, classes] = await Promise.all([query("profiles"), query("class_students", "student_id,class_id"), query("classes", "id,name")]);
        return { ok: true, data: { profiles, memberships, classes, currentUserId: profile.id } };
      }
      case "adminUser": {
        const [userProfile, memberships, classes] = await Promise.all([
          one("profiles", "id", id),
          filtered("class_students", "student_id", id),
          query("classes", "id,name,teacher_id,archived_at"),
        ]);
        return { ok: true, data: { profile: userProfile, memberships, classes, currentUserId: profile.id } };
      }
      case "adminClasses": {
        const [classes, profiles, memberships, projects] = await Promise.all([query("classes"), query("profiles", "id,username,full_name,role"), query("class_students", "class_id,student_id"), query("projects", "id,class_id")]);
        return { ok: true, data: { classes, profiles, memberships, projects } };
      }
      case "adminClass": {
        const cls = await one("classes", "id", id);
        const students = await filtered("class_students", "class_id", id);
        const studentProfiles = await ids("profiles", "id", students.map((row) => rowString(row, "student_id")));
        const projects = await filtered("projects", "class_id", id);
        return { ok: true, data: { class: cls, students: studentProfiles, projects } };
      }
      case "adminCurriculum": return { ok: true, data: await query("learning_requirements") };
      case "adminBars": {
        const criteria = await filtered("bars_criteria", "is_template", "true");
        const levels = await ids("bars_levels", "criterion_id", criteria.map((row) => rowString(row, "id")));
        const points = await ids("bars_level_points", "criterion_id", criteria.map((row) => rowString(row, "id")));
        return { ok: true, data: { criteria, levels, points } };
      }
      case "adminResearch": {
        const [classes, memberships, consents, projects, exports] = await Promise.all([query("classes"), query("class_students", "class_id,student_id"), query("research_consents"), query("projects", "id,title,class_id"), query("research_exports")]);
        return { ok: true, data: { classes, memberships, consents, projects, exports } };
      }
      case "adminAudit": return { ok: true, data: await db.from("audit_logs").select("*").order("created_at", { ascending: false }).limit(500).then(({ data, error }) => { if (error) throw error; return data ?? []; }) };
      case "teacherDashboard":
      case "teacherProjects": {
        const classes = await filtered("classes", "teacher_id", profile.id);
        const projects = await ids("projects", "class_id", classes.map((row) => rowString(row, "id")));
        const memberships = await ids("class_students", "class_id", classes.map((row) => rowString(row, "id")));
        const projectIds = projects.map((row) => rowString(row, "id"));
        const [groupProgress, rounds] = await Promise.all([
          ids("v_group_progress", "project_id", projectIds), ids("evaluation_rounds", "project_id", projectIds),
        ]);
        return { ok: true, data: { classes, projects, memberships, groupProgress, rounds } };
      }
      case "teacherClass": {
        const cls = await one("classes", "id", id);
        const students = await filtered("class_students", "class_id", id);
        const studentProfiles = await ids("profiles", "id", students.map((row) => rowString(row, "student_id")));
        const projects = await filtered("projects", "class_id", id);
        return { ok: true, data: { class: cls, students: studentProfiles, projects } };
      }
      case "teacherProject": {
        const project = await one("projects", "id", id);
        const [groups, templates, criteria] = await Promise.all([filtered("groups", "project_id", id), filtered("task_templates", "project_id", id), filtered("bars_criteria", "project_id", id)]);
        return { ok: true, data: { project, groups, templates, criteria } };
      }
      case "teacherTemplates": {
        const templates = await filtered("task_templates", "project_id", id);
        const links = await ids("task_template_requirements", "template_id", templates.map((row) => rowString(row, "id")));
        const requirements = await ids("learning_requirements", "id", links.map((row) => rowString(row, "requirement_id")));
        return { ok: true, data: { templates, links, requirements } };
      }
      case "teacherGroups": {
        const [groups, project] = await Promise.all([filtered("groups", "project_id", id), one("projects", "id", id)]);
        const [members, students] = await Promise.all([
          ids("group_members", "group_id", groups.map((row) => rowString(row, "id"))),
          project ? filtered("class_students", "class_id", rowString(project, "class_id")) : Promise.resolve([]),
        ]);
        const profiles = await ids("profiles", "id", students.map((row) => rowString(row, "student_id")));
        return { ok: true, data: { groups, members, students: profiles } };
      }
      case "teacherGroup": {
        const group = await one("groups", "id", childId);
        const [tasks, events, members] = await Promise.all([filtered("tasks", "group_id", childId), filtered("task_events", "group_id", childId), filtered("group_members", "group_id", childId)]);
        const profiles = await ids("profiles", "id", members.map((row) => rowString(row, "student_id")));
        return { ok: true, data: { group, tasks, events, members: profiles } };
      }
      case "teacherProgress": {
        const [groups, contributions] = await Promise.all([filtered("v_group_progress", "project_id", id), filtered("v_student_contribution", "project_id", id)]);
        return { ok: true, data: { groups, contributions } };
      }
      case "teacherEvaluation": {
        const [rounds, criteria] = await Promise.all([filtered("evaluation_rounds", "project_id", id), filtered("bars_criteria", "project_id", id)]);
        return { ok: true, data: { rounds, criteria } };
      }
      case "teacherRound": {
        const round = await one("evaluation_rounds", "id", childId);
        const reviews = await filtered("peer_reviews", "round_id", childId);
        const members = await filtered("group_members", "project_id", id);
        const profiles = await ids("profiles", "id", members.map((row) => rowString(row, "student_id")));
        return { ok: true, data: { round, reviews, profiles } };
      }
      case "teacherGrading": {
        const groups = await filtered("groups", "project_id", id);
        const scores = await filtered("final_scores", "project_id", id);
        const groupScores = await ids("group_scores", "group_id", groups.map((row) => rowString(row, "id")));
        const members = await filtered("group_members", "project_id", id);
        const profiles = await ids("profiles", "id", members.map((row) => rowString(row, "student_id")));
        return { ok: true, data: { groups, scores, groupScores, members, profiles } };
      }
      case "teacherExport": {
        const scores = await filtered("final_scores", "project_id", id);
        const groups = await ids("groups", "id", [...new Set(scores.map((row) => rowString(row, "group_id")))]);
        const profiles = await ids("profiles", "id", scores.map((row) => rowString(row, "student_id")));
        return { ok: true, data: { scores, groups, profiles } };
      }
      case "studentDashboard":
      case "studentProfile": {
        const memberships = await filtered("group_members", "student_id", profile.id);
        const projects = await ids("projects", "id", memberships.map((row) => rowString(row, "project_id")));
        const groupIds = [...new Set(memberships.map((row) => rowString(row, "group_id")))];
        const [tasks, consents, rounds, groups] = await Promise.all([
          ids("tasks", "group_id", groupIds), filtered("research_consents", "student_id", profile.id),
          projects.length ? ids("evaluation_rounds", "project_id", projects.map((row) => rowString(row, "id"))) : Promise.resolve([]),
          ids("groups", "id", groupIds),
        ]);
        const classes = await ids("classes", "id", projects.map((row) => rowString(row, "class_id")));
        const teachers = await ids("profiles", "id", classes.map((row) => rowString(row, "teacher_id")));
        const groupProgress = projects.length ? await ids("v_group_progress", "project_id", projects.map((row) => rowString(row, "id"))) : [];
        return { ok: true, data: { profile, memberships, projects, tasks, consents, rounds, groups, classes, teachers, groupProgress } };
      }
      case "studentProject":
      case "studentBoard": {
        const membership = await db.from("group_members").select("group_id,project_id,student_id").eq("student_id", profile.id).eq("project_id", id ?? "").maybeSingle();
        if (membership.error) throw membership.error;
        if (!membership.data) return { ok: false, error: "Bạn chưa thuộc nhóm trong dự án này" };
        const [project, groups, tasks, members, rounds] = await Promise.all([
          one("projects", "id", id), filtered("group_members", "group_id", membership.data.group_id),
          filtered("tasks", "group_id", membership.data.group_id), filtered("v_group_members", "group_id", membership.data.group_id),
          filtered("evaluation_rounds", "project_id", id),
        ]);
        return { ok: true, data: { project, groupId: membership.data.group_id, groups, tasks, members, rounds } };
      }
      case "studentReview": {
        const memberships = await filtered("group_members", "student_id", profile.id);
        const projectIds = memberships.map((row) => rowString(row, "project_id"));
        const rounds = await ids("evaluation_rounds", "project_id", projectIds);
        const reviews = rounds.length ? await filtered("peer_reviews", "rater_id", profile.id) : [];
        const profiles = await ids("profiles", "id", [...new Set(reviews.map((row) => rowString(row, "ratee_id")))]);
        return { ok: true, data: { rounds, reviews, profiles } };
      }
      case "studentReviewForm": {
        const review = await db.from("peer_reviews").select("*").eq("round_id", id ?? "").eq("rater_id", profile.id).eq("ratee_id", childId ?? "").maybeSingle();
        if (review.error) throw review.error;
        if (!review.data) return { ok: false, error: "Không tìm thấy phiếu đánh giá" };
        const [criteria, answers, ratee] = await Promise.all([
          filtered("bars_criteria", "project_id", review.data.project_id), filtered("peer_review_answers", "review_id", review.data.id),
          one("profiles", "id", childId, "id,full_name"),
        ]);
        const levels = await ids("bars_levels", "criterion_id", criteria.map((row) => rowString(row, "id")));
        return { ok: true, data: { review: review.data, criteria, levels, answers, ratee } };
      }
      case "studentResults": {
        const result = await db.rpc("get_my_results", { p_project_id: id });
        if (result.error) throw result.error;
        return { ok: true, data: result.data };
      }
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : "Không thể tải dữ liệu";
    return { ok: false, error: message };
  }
}
