import { loadEnvConfig } from "@next/env";
import { createClient } from "@supabase/supabase-js";

loadEnvConfig(process.cwd());

const BATCH = "hi-10c4-ppt-demo-v1";
const domain = process.env.STUDENT_EMAIL_DOMAIN ?? "hs.pbl.example";
const initialPasswords = {
  admin: process.env.ADMIN_INITIAL_PASSWORD,
  teacher: process.env.TEACHER_INITIAL_PASSWORD,
  student: process.env.STUDENT_INITIAL_PASSWORD,
};
const admin = { code: "ADMIN", username: "admin", fullName: "Admin", role: "admin" as const };
const teacher = { code: "GV01", username: "gv01", fullName: "Giáo viên mẫu", role: "teacher" as const };
const students = Array.from({ length: 30 }, (_, index) => {
  const number = String(index + 1).padStart(2, "0");
  return { code: `SPT${number}`, username: `spt${number}`, fullName: `Học sinh ${number}`, role: "student" as const };
});
const accounts = [admin, teacher, ...students];

const ids = {
  class: "4a8f83b8-0c4a-4c21-b05a-3dc7d0504e61",
  project: "6a74f351-5e59-465a-a4d9-712e38a5ef37",
  groups: Array.from({ length: 6 }, (_, i) => `00000000-0000-4000-8000-${String(i + 1).padStart(12, "0")}`),
  templates: [
    "145eaf20-a26c-49a3-9f8b-d385c335f01f",
    "4716c210-23bc-4874-8ab9-5f22a3e0c2d7",
    "92201885-c3d3-4474-bec1-ebd50f153416",
    "d765cc56-5265-44d9-a314-ec13d60488c5",
  ],
};

function assertNoError(error: { message: string } | null, operation: string): void {
  if (error) throw new Error(`${operation}: ${error.message}`);
}

async function seed(): Promise<void> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) {
    throw new Error("Thiếu NEXT_PUBLIC_SUPABASE_URL và/hoặc SUPABASE_SERVICE_ROLE_KEY. Hãy cấu hình trong .env.local trước khi chạy.");
  }

  const supabase = createClient(url, serviceKey, { auth: { autoRefreshToken: false, persistSession: false } });
  const createdCredentials: { username: string; password: string; role: string }[] = [];
  const userIds = new Map<string, string>();

  for (const account of accounts) {
    const email = `${account.username}@${domain}`;
    const defaultPassword = initialPasswords[account.role];
    if (!defaultPassword) {
      throw new Error(`Thiếu mật khẩu ban đầu trong .env.local cho vai trò ${account.role}.`);
    }
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password: defaultPassword,
      email_confirm: true,
      app_metadata: { role: account.role, must_change_password: true, pbl_seed_batch: BATCH },
      user_metadata: { username: account.username, full_name: account.fullName, role: account.role, must_change_password: true },
    });

    let user = data.user;
    let mustChangePassword = true;
    if (error || !user) {
      const { data: listed, error: listError } = await supabase.auth.admin.listUsers({ page: 1, perPage: 1000 });
      assertNoError(listError, `Tra cứu tài khoản ${account.code}`);
      user = listed.users.find((candidate) => candidate.email?.toLowerCase() === email.toLowerCase()) ?? null;
      if (!user) throw new Error(`Không thể tạo tài khoản ${account.code}: ${error?.message ?? "không có user trả về"}`);
      const { data: existingProfile, error: existingProfileError } = await supabase.from("profiles")
        .select("username,role,student_code,staff_code,must_change_password")
        .eq("id", user.id).maybeSingle();
      assertNoError(existingProfileError, `Kiểm tra hồ sơ ${account.code}`);
      const profileMatches = existingProfile && existingProfile.username === account.username && existingProfile.role === account.role &&
        (account.role === "student" ? existingProfile.student_code === account.code : existingProfile.staff_code === account.code);
      if (user.app_metadata?.pbl_seed_batch !== BATCH && existingProfile && !profileMatches) {
        throw new Error(`Email ${email} đã thuộc hồ sơ khác; seed dừng để không đổi mật khẩu hoặc quyền nhầm người.`);
      }
      if (user.app_metadata?.pbl_seed_batch !== BATCH) {
        const { error: resetError } = await supabase.auth.admin.updateUserById(user.id, { password: defaultPassword });
        assertNoError(resetError, `Đặt mật khẩu mặc định cho ${account.code}`);
        createdCredentials.push({ username: account.code, password: defaultPassword, role: account.role });
      } else {
        mustChangePassword = existingProfile?.must_change_password ?? !!user.app_metadata?.must_change_password;
      }
    } else {
      createdCredentials.push({ username: account.code, password: defaultPassword, role: account.role });
    }

    const { error: authUpdateError } = await supabase.auth.admin.updateUserById(user.id, {
      app_metadata: { role: account.role, must_change_password: mustChangePassword, pbl_seed_batch: BATCH },
      user_metadata: { username: account.username, full_name: account.fullName, role: account.role, must_change_password: mustChangePassword },
    });
    assertNoError(authUpdateError, `Cập nhật quyền ${account.code}`);

    const profile: Record<string, unknown> = {
      role: account.role,
      is_active: true,
      username: account.username,
      full_name: account.fullName,
      must_change_password: mustChangePassword,
      student_code: account.role === "student" ? account.code : null,
      staff_code: account.role === "teacher" ? account.code : null,
    };
    if (account.role === "teacher") {
      profile.department = "Sư phạm Tin học";
      profile.subject_area = "Tin học";
    }
    const { data: savedProfile, error: profileError } = await supabase.from("profiles")
      .update(profile)
      .eq("id", user.id)
      .select("id")
      .maybeSingle();
    assertNoError(profileError, `Lưu hồ sơ ${account.code}`);
    if (!savedProfile) throw new Error(`Không tìm thấy hồ sơ do Supabase Auth tạo cho ${account.code}`);
    userIds.set(account.code, user.id);
  }

  const teacherId = userIds.get("GV01")!;
  const studentIds = students.map((student) => userIds.get(student.code)!);

  const { error: classError } = await supabase.from("classes").upsert({
    id: ids.class, name: "10C4", grade: 10, school_year: "2026-2027", teacher_id: teacherId,
  }, { onConflict: "id" });
  assertNoError(classError, "Tạo lớp 10C4");

  const { error: enrollmentError } = await supabase.from("class_students").upsert(
    studentIds.map((student_id) => ({ class_id: ids.class, student_id })),
    { onConflict: "class_id,student_id" },
  );
  assertNoError(enrollmentError, "Ghi danh 30 học sinh");

  const { error: projectError } = await supabase.from("projects").upsert({
    id: ids.project,
    class_id: ids.class,
    title: "Thiết kế bài thuyết trình số về an toàn thông tin cá nhân",
    description: "Dự án mẫu cho lớp 10C4. Sản phẩm: bộ slide PowerPoint 8–10 trang kèm nguồn tham khảo; trình bày một tình huống rò rỉ dữ liệu và đề xuất cách bảo vệ tài khoản.",
    status: "draft",
    starts_on: "2026-11-12",
    due_on: "2026-12-10",
    group_size_min: 5,
    group_size_max: 5,
    weight_group: 0.60,
    allow_custom_tasks: true,
    created_by: teacherId,
  }, { onConflict: "id" });
  assertNoError(projectError, "Tạo dự án mẫu");

  const groupRows = ids.groups.map((id, index) => ({
    id,
    project_id: ids.project,
    name: `Nhóm ${String(index + 1).padStart(2, "0")} — Thiết kế PPT`,
  }));
  const { error: groupsError } = await supabase.from("groups").upsert(groupRows, { onConflict: "id" });
  assertNoError(groupsError, "Tạo 6 nhóm");

  const memberships = studentIds.map((student_id, index) => ({
    group_id: ids.groups[Math.floor(index / 5)],
    project_id: ids.project,
    class_id: ids.class,
    student_id,
  }));
  const { error: membersError } = await supabase.from("group_members").upsert(memberships, { onConflict: "project_id,student_id" });
  assertNoError(membersError, "Xếp 30 học sinh vào 6 nhóm");

  const templateRows = [
    { title: "Chọn thông điệp và người nghe", description: "Xác định đối tượng, mục tiêu và câu chuyện chính của bài thuyết trình.", position: 0, default_due_on: "2026-11-18" },
    { title: "Tìm và kiểm chứng thông tin", description: "Thu thập nguồn đáng tin cậy về mật khẩu, lừa đảo và quyền riêng tư số.", position: 1, default_due_on: "2026-11-23" },
    { title: "Thiết kế bộ slide PowerPoint", description: "Dùng bố cục dễ đọc, hình ảnh có nguồn, mỗi slide một ý chính.", position: 2, default_due_on: "2026-12-02" },
    { title: "Tập trình bày và góp ý", description: "Thử trình bày, nhận góp ý từ bạn học và chỉnh sửa bản cuối.", position: 3, default_due_on: "2026-12-08" },
  ];
  const { error: templatesError } = await supabase.from("task_templates").upsert(
    templateRows.map((row, index) => ({ ...row, id: ids.templates[index], project_id: ids.project })),
    { onConflict: "id" },
  );
  assertNoError(templatesError, "Tạo kho nhiệm vụ mẫu");

  const dueDates = ["2026-11-18T16:00:00+07:00", "2026-11-23T16:00:00+07:00", "2026-12-02T16:00:00+07:00", "2026-12-08T16:00:00+07:00"];
  const taskTitles = [
    "Viết thông điệp và dàn ý 8–10 slide",
    "Tìm ba nguồn tin đáng tin cậy",
    "Thiết kế bản PowerPoint đầu tiên",
    "Tập nói, nhận góp ý và hoàn thiện slide",
  ];
  const taskDescriptions = [
    "Chốt đối tượng nghe, mục tiêu và mạch kể chuyện.",
    "Ghi tên tổ chức, tiêu đề tài liệu và đường dẫn nguồn.",
    "Dùng template chung của nhóm; bảo đảm chữ và hình dễ đọc.",
    "Mỗi thành viên góp ý một điểm; sửa nội dung và ghi nguồn.",
  ];
  const taskRows = ids.groups.flatMap((group_id, groupIndex) => taskTitles.map((title, taskIndex) => {
    const index = groupIndex * 4 + taskIndex;
    return {
      id: `00000000-0000-4000-9000-${String(index + 1).padStart(12, "0")}`,
      group_id,
      template_id: ids.templates[taskIndex],
      title,
      description: taskDescriptions[taskIndex],
      status: "todo" as const,
      assignee_id: studentIds[groupIndex * 5 + (taskIndex % 5)],
      due_at: dueDates[taskIndex],
      position: taskIndex + 1,
      created_by: teacherId,
    };
  }));
  const { error: tasksError } = await supabase.from("tasks").upsert(taskRows, { onConflict: "id" });
  assertNoError(tasksError, "Tạo thẻ công việc cho 6 nhóm");

  console.log("Đã seed dữ liệu thật vào Supabase; tên học sinh là nhãn mẫu và có thể thay bằng danh sách thật.");
  console.log(`Lớp 10C4: 30 học sinh (SPT01–SPT30), giáo viên GV01, 6 nhóm, 1 dự án và 24 thẻ việc.`);
  console.log(`Đăng nhập: http://localhost:3000/login — tài khoản dạng MÃ, email nội bộ dùng @${domain}.`);
  if (createdCredentials.length) {
    console.log("Tài khoản mới được tạo và cần đổi mật khẩu sau lần đăng nhập đầu:");
    for (const credential of createdCredentials) console.log(`${credential.username}\t${credential.role}`);
  } else {
    console.log("Tài khoản đã seed được giữ nguyên mật khẩu hiện tại.");
  }
  console.log(`Dự án: /teacher/projects/${ids.project}`);
}

seed().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
