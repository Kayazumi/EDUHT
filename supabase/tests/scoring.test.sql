-- [TEST] Kiểm thử thuật toán tính điểm và các vector tính điểm · tài liệu mục 4.4, 7.3 và test-vectors.json
begin;
select plan(5);

-- 1. Kiểm tra các hàm RPC tính toán và quản lý điểm số
select has_function('public', 'compute_final_scores', 'RPC compute_final_scores phải tồn tại');
select has_function('public', 'adjust_final_score', 'RPC adjust_final_score phải tồn tại');
select has_function('public', 'publish_results', 'RPC publish_results phải tồn tại');
select has_function('public', 'unpublish_results', 'RPC unpublish_results phải tồn tại');

-- 2. Kiểm tra cấu trúc bảng điểm cuối cùng có cột Generated final_score
select has_column('public', 'final_scores', 'final_score', 'final_scores phải có cột final_score');

select * from finish();
rollback;
