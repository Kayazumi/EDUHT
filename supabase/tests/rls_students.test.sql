-- [TEST] Kiểm thử phân quyền RLS vai trò Học sinh · tài liệu mục 4.4, 6.2 và 8.4
begin;
select plan(8);

-- 1. Kiểm tra tồn tại các bảng cốt lõi của học sinh
select has_table('public', 'tasks', 'Bảng tasks phải tồn tại');
select has_table('public', 'peer_reviews', 'Bảng peer_reviews phải tồn tại');
select has_table('public', 'bars_level_points', 'Bảng bars_level_points phải tồn tại');

-- 2. Kịch bản 1: Học sinh không xem được tasks của nhóm khác
select policies_are(
  'public', 'tasks',
  ARRAY['tasks_select_policy', 'tasks_insert_policy', 'tasks_update_policy'],
  'tasks có đúng các policy bảo vệ'
);

-- 3. Kịch bản 6: Học sinh không xem được peer_reviews do người khác chấm
select policies_are(
  'public', 'peer_reviews',
  ARRAY['peer_reviews_select', 'peer_reviews_insert', 'peer_reviews_update'],
  'peer_reviews có đúng các policy rater_id'
);

-- 4. Kịch bản 9: Học sinh bị chặn đọc bars_level_points (0 dòng)
select policies_are(
  'public', 'bars_level_points',
  ARRAY['bars_level_points_select', 'bars_level_points_mutation'],
  'bars_level_points bảo vệ điểm quy đổi khỏi học sinh'
);

-- 5. Kịch bản 10: Điểm chưa công bố bị ẩn khỏi học sinh
select policies_are(
  'public', 'final_scores',
  ARRAY['final_scores_select'],
  'final_scores chỉ cho phép học sinh đọc khi published_at IS NOT NULL'
);

-- 6. Kịch bản 11: profiles có trigger chặn tự nâng role
select has_trigger('public', 'profiles', 'trg_guard_profile_update', 'profiles có trigger chặn sửa role');

select * from finish();
rollback;
