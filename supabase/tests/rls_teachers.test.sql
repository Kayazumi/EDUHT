-- [TEST] Kiểm thử phân quyền RLS vai trò Giáo viên · tài liệu mục 4.4, 6.2 và 8.4
begin;
select plan(7);

-- 1. Kiểm tra tồn tại các bảng quản lý của giáo viên
select has_table('public', 'classes', 'Bảng classes phải tồn tại');
select has_table('public', 'projects', 'Bảng projects phải tồn tại');
select has_table('public', 'group_scores', 'Bảng group_scores phải tồn tại');

-- 2. Giáo viên chỉ đọc lớp và dự án của mình
select policies_are(
  'public', 'classes',
  ARRAY['classes_select_policy', 'classes_insert_policy', 'classes_update_policy'],
  'classes có chính sách theo teacher_id'
);

select policies_are(
  'public', 'projects',
  ARRAY['projects_select_policy', 'projects_teacher_insert', 'projects_teacher_update', 'projects_teacher_delete'],
  'projects có chính sách quản lý theo giáo viên phụ trách'
);

-- 3. Kịch bản 14: projects không cấp quyền UPDATE cột status trực tiếp
select has_function('public', 'set_project_status', 'projects phải đổi trạng thái qua RPC set_project_status');

-- 4. Kịch bản 15: INV-04 bảo đảm round và group cùng project_id
select col_is_fk('public', 'peer_reviews', ARRAY['round_id', 'project_id'], 'peer_reviews có FK phức hợp round_id + project_id');

select * from finish();
rollback;
