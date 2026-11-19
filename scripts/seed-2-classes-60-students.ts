import { loadEnvConfig } from "@next/env";
import { createClient } from "@supabase/supabase-js";

loadEnvConfig(process.cwd());

const DEFAULT_PASSWORD = process.env.ADMIN_SHARED_INITIAL_PASSWORD || "Abc_1111";

const CLASS_1_ID = "4a8f83b8-0c4a-4c21-b05a-3dc7d0504e61"; // 10C4
const CLASS_2_ID = "5b9f94c9-1d5b-5d32-c16b-4ed8e1615f72"; // 10C5
const PROJECT_1_ID = "6a74f351-5e59-465a-a4d9-712e38a5ef37";
const PROJECT_2_ID = "7b85e462-6f6a-576b-b2e0-823f49b6fa48";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceKey) {
  console.error("Thiếu Supabase URL hoặc SERVICE_ROLE_KEY trong .env.local");
  process.exit(1);
}

const supabase = createClient(url, serviceKey, { auth: { autoRefreshToken: false, persistSession: false } });

async function main() {
  console.log("=== Bắt đầu đồng bộ 2 lớp học và 60 học sinh vào Database ===");

  // 1. Tìm hoặc xác thực tài khoản giáo viên gv01
  const { data: gvProfile, error: gvError } = await supabase
    .from("profiles")
    .select("id, username")
    .eq("username", "gv01")
    .maybeSingle();

  if (gvError || !gvProfile) {
    throw new Error(`Không tìm thấy hồ sơ giáo viên gv01: ${gvError?.message}`);
  }
  const teacherId = gvProfile.id;
  console.log(`Tìm thấy giáo viên gv01: ${teacherId}`);

  // 2. Tạo hoặc cập nhật 2 Lớp học: 10C4 và 10C5
  const { error: c1Error } = await supabase.from("classes").upsert({
    id: CLASS_1_ID,
    name: "10C4",
    grade: 10,
    school_year: "2026-2027",
    teacher_id: teacherId,
    archived_at: null,
  }, { onConflict: "id" });
  if (c1Error) throw new Error(`Lỗi tạo lớp 10C4: ${c1Error.message}`);

  const { error: c2Error } = await supabase.from("classes").upsert({
    id: CLASS_2_ID,
    name: "10C5",
    grade: 10,
    school_year: "2026-2027",
    teacher_id: teacherId,
    archived_at: null,
  }, { onConflict: "id" });
  if (c2Error) throw new Error(`Lỗi tạo lớp 10C5: ${c2Error.message}`);

  // Lưu ý xóa hoặc archive các lớp cũ nếu có để chỉ còn đúng 2 lớp 10C4 và 10C5
  const { error: archiveOldError } = await supabase
    .from("classes")
    .delete()
    .not("id", "in", `(${CLASS_1_ID},${CLASS_2_ID})`);
  if (archiveOldError) {
    console.warn("Không thể xóa lớp cũ (có thể có ràng buộc FK), tiến hành archive:", archiveOldError.message);
    await supabase.from("classes").update({ archived_at: new Date().toISOString() }).not("id", "in", `(${CLASS_1_ID},${CLASS_2_ID})`);
  }
  console.log("Đã cấu hình chính xác 2 lớp: 10C4 và 10C5 phụ trách bởi gv01.");

  // 3. Chuẩn bị 60 học sinh: spt01 -> spt60
  // Lớp 10C4: spt01 -> spt30
  // Lớp 10C5: spt31 -> spt60
  const studentUserIds = new Map<string, string>();

  // Lấy danh sách user auth hiện có
  const { data: listedUsers, error: listError } = await supabase.auth.admin.listUsers({ page: 1, perPage: 1000 });
  if (listError) throw new Error(`Lỗi listUsers: ${listError.message}`);
  const userByUsername = new Map(listedUsers.users.map(u => [(u.user_metadata?.username || u.email?.split("@")[0])?.toLowerCase(), u]));

  for (let i = 1; i <= 60; i++) {
    const numStr = String(i).padStart(2, "0");
    const code = `SPT${numStr}`;
    const username = `spt${numStr}`;
    const fullName = `Học sinh ${numStr}`;
    const email = `${username}@example.invalid`.toLowerCase();
    const classId = i <= 30 ? CLASS_1_ID : CLASS_2_ID;

    let authUser = userByUsername.get(username.toLowerCase());
    if (!authUser) {
      const { data: created, error: createError } = await supabase.auth.admin.createUser({
        email,
        password: DEFAULT_PASSWORD,
        email_confirm: true,
        app_metadata: { role: "student", must_change_password: false },
        user_metadata: { role: "student", username, full_name: fullName, must_change_password: false },
      });
      if (createError || !created.user) {
        throw new Error(`Không thể tạo auth user ${username}: ${createError?.message}`);
      }
      authUser = created.user;
      console.log(`Đã tạo mới tài khoản Auth: ${username} (${code})`);
    } else {
      // Đảm bảo mật khẩu và quyền chuẩn
      await supabase.auth.admin.updateUserById(authUser.id, {
        password: DEFAULT_PASSWORD,
        app_metadata: { role: "student", must_change_password: false },
        user_metadata: { role: "student", username, full_name: fullName, must_change_password: false },
      });
    }

    studentUserIds.set(code, authUser.id);

    // Upsert profile
    const { error: profError } = await supabase.from("profiles").upsert({
      id: authUser.id,
      role: "student",
      username,
      full_name: fullName,
      student_code: code,
      is_active: true,
      must_change_password: false,
    }, { onConflict: "id" });
    if (profError) throw new Error(`Lỗi upsert profile ${username}: ${profError.message}`);

    // Ghi danh vào lớp
    const { error: csError } = await supabase.from("class_students").upsert({
      class_id: classId,
      student_id: authUser.id,
    }, { onConflict: "class_id,student_id" });
    if (csError) throw new Error(`Lỗi ghi danh ${username} vào lớp: ${csError.message}`);

    // Ghi nhận đồng ý nghiên cứu (Research Consent)
    await supabase.from("research_consents").upsert({
      student_id: authUser.id,
      class_id: classId,
      consent_form_version: "v1.0",
      is_consented: true,
      consented_at: new Date().toISOString(),
    }, { onConflict: "student_id,class_id" });
  }
  console.log("Đã cập nhật đầy đủ 60 học sinh vào profiles, class_students và research_consents.");

  // 4. Cấu hình Dự án 1 (10C4) - Chuyển sang status 'active'
  const { error: p1Error } = await supabase.from("projects").upsert({
    id: PROJECT_1_ID,
    class_id: CLASS_1_ID,
    title: "Thiết kế bài thuyết trình số về an toàn thông tin cá nhân",
    description: "Dự án mẫu cho lớp 10C4. Sản phẩm: bộ slide PowerPoint 8–10 trang kèm nguồn tham khảo; trình bày một tình huống rò rỉ dữ liệu và đề xuất cách bảo vệ tài khoản.",
    status: "active",
    starts_on: "2026-11-12",
    due_on: "2026-12-15",
    group_size_min: 5,
    group_size_max: 5,
    weight_group: 0.60,
    allow_custom_tasks: true,
    created_by: teacherId,
  }, { onConflict: "id" });
  if (p1Error) throw new Error(`Lỗi cập nhật dự án 1: ${p1Error.message}`);

  // Đảm bảo 30 học sinh lớp 10C4 được xếp nhóm trong Dự án 1
  const groups1 = Array.from({ length: 6 }, (_, i) => `00000000-0000-4000-8000-${String(i + 1).padStart(12, "0")}`);
  for (let g = 0; g < 6; g++) {
    const groupId = groups1[g];
    const groupName = `Nhóm ${String(g + 1).padStart(2, "0")} — Thuyết trình PPT`;
    await supabase.from("groups").upsert({
      id: groupId,
      project_id: PROJECT_1_ID,
      name: groupName,
    }, { onConflict: "id" });

    // 5 học sinh mỗi nhóm
    for (let s = 0; s < 5; s++) {
      const studentIndex = g * 5 + s + 1;
      const code = `SPT${String(studentIndex).padStart(2, "0")}`;
      const sId = studentUserIds.get(code)!;
      await supabase.from("group_members").upsert({
        group_id: groupId,
        student_id: sId,
        project_id: PROJECT_1_ID,
        class_id: CLASS_1_ID,
      }, { onConflict: "project_id,student_id" });
    }
  }

  // 5. Cấu hình Dự án 2 (10C5) - Hoạt động cho spt31 -> spt60
  const { error: p2Error } = await supabase.from("projects").upsert({
    id: PROJECT_2_ID,
    class_id: CLASS_2_ID,
    title: "Xây dựng cẩm nang số và infographic về Trí tuệ nhân tạo có trách nhiệm",
    description: "Dự án học tập Tin học 10 cho lớp 10C5. Sản phẩm: Bộ cẩm nang số tương tác và ấn phẩm infographic về ứng dụng AI an toàn, đạo đức và phòng chống tin giả.",
    status: "active",
    starts_on: "2026-11-15",
    due_on: "2026-12-20",
    group_size_min: 5,
    group_size_max: 5,
    weight_group: 0.60,
    allow_custom_tasks: true,
    created_by: teacherId,
  }, { onConflict: "id" });
  if (p2Error) throw new Error(`Lỗi cập nhật dự án 2: ${p2Error.message}`);

  // Tạo 6 nhóm cho Dự án 2 (10C5)
  const groupNames2 = [
    "Nhóm 01 — AI và An toàn thông tin",
    "Nhóm 02 — Phòng chống Deepfake & Tin giả",
    "Nhóm 03 — Quyền tác giả và Đạo đức AI",
    "Nhóm 04 — Bảo vệ dữ liệu cá nhân trên mạng",
    "Nhóm 05 — Ứng xử số văn minh trong trường học",
    "Nhóm 06 — Pháp luật An ninh mạng THPT",
  ];

  const groups2 = Array.from({ length: 6 }, (_, i) => `00000000-0000-5000-8000-${String(i + 1).padStart(12, "0")}`);
  const taskTitles2 = [
    "Khảo sát và xác định chủ đề cẩm nang",
    "Thu thập và kiểm chứng dữ liệu tình huống",
    "Thiết kế bản vẽ sơ đồ Infographic số",
    "Biên tập cẩm nang và thử nghiệm người dùng",
  ];
  const taskDescriptions2 = [
    "Thực hiện phiếu khảo sát ý kiến học sinh về việc dùng AI trong học tập.",
    "Thu thập 3 tình huống thực tế và các nguồn khuyến cáo từ cơ quan chức năng.",
    "Thiết kế bố cục trực quan trên Canva/Figma, tuân thủ bảng màu học đường.",
    "Tập hợp nội dung, lấy phản hồi từ giáo viên và hoàn thiện sản phẩm số.",
  ];
  const dueDates2 = [
    "2026-11-20T16:00:00+07:00",
    "2026-11-28T16:00:00+07:00",
    "2026-12-08T16:00:00+07:00",
    "2026-12-18T16:00:00+07:00",
  ];
  const statuses: ("todo" | "doing" | "done")[] = ["done", "doing", "todo", "todo"];

  for (let g = 0; g < 6; g++) {
    const groupId = groups2[g];
    const groupName = groupNames2[g];
    await supabase.from("groups").upsert({
      id: groupId,
      project_id: PROJECT_2_ID,
      name: groupName,
    }, { onConflict: "id" });

    // 5 học sinh mỗi nhóm từ spt31 -> spt60
    for (let s = 0; s < 5; s++) {
      const studentIndex = 30 + g * 5 + s + 1; // 31..60
      const code = `SPT${String(studentIndex).padStart(2, "0")}`;
      const sId = studentUserIds.get(code)!;
      await supabase.from("group_members").upsert({
        group_id: groupId,
        student_id: sId,
        project_id: PROJECT_2_ID,
        class_id: CLASS_2_ID,
      }, { onConflict: "project_id,student_id" });
    }

    // Tạo 4 nhiệm vụ cho mỗi nhóm
    for (let t = 0; t < 4; t++) {
      const taskId = `00000000-0000-5000-9000-${String(g * 4 + t + 1).padStart(12, "0")}`;
      const assigneeCode = `SPT${String(30 + g * 5 + (t % 5) + 1).padStart(2, "0")}`;
      const assigneeId = studentUserIds.get(assigneeCode)!;

      await supabase.from("tasks").upsert({
        id: taskId,
        group_id: groupId,
        title: taskTitles2[t],
        description: taskDescriptions2[t],
        status: statuses[t],
        assignee_id: assigneeId,
        due_at: dueDates2[t],
        position: t + 1,
        created_by: teacherId,
      }, { onConflict: "id" });
    }
  }

  // 6. Tạo đợt đánh giá BARS mẫu mở cho cả 2 dự án
  const ROUND_1_ID = "00000000-0000-4000-a000-000000000001";
  const ROUND_2_ID = "00000000-0000-5000-a000-000000000001";
  await supabase.from("evaluation_rounds").upsert([
    {
      id: ROUND_1_ID,
      project_id: PROJECT_1_ID,
      title: "Đợt 1: Đánh giá quá trình lập kế hoạch và phân công",
      status: "open",
      opens_at: "2026-11-15T08:00:00+07:00",
      closes_at: "2026-11-25T23:59:59+07:00",
      allow_feedback: true,
      created_by: teacherId,
    },
    {
      id: ROUND_2_ID,
      project_id: PROJECT_2_ID,
      title: "Đợt 1: Đánh giá kỹ năng thu thập tài liệu và làm việc nhóm",
      status: "open",
      opens_at: "2026-11-18T08:00:00+07:00",
      closes_at: "2026-11-28T23:59:59+07:00",
      allow_feedback: true,
      created_by: teacherId,
    },
  ], { onConflict: "id" });

  console.log("=== HOÀN TẤT ĐỒNG BỘ CSDL THÀNH CÔNG ===");
  console.log("- 2 Lớp học: 10C4 (30 HS) và 10C5 (30 HS)");
  console.log("- Tổng cộng 60 học sinh từ spt01 đến spt60 (mật khẩu Abc_1111)");
  console.log("- Cả 2 dự án đều ở trạng thái 'active', có đầy đủ nhóm, thẻ việc Kanban và đợt đánh giá BARS");
}

main().catch((err) => {
  console.error("Lỗi đồng bộ CSDL:", err);
  process.exit(1);
});
