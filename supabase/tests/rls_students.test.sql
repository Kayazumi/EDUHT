-- [TEST] Kiểm thử phân quyền RLS vai trò Học sinh · tài liệu mục 4.4 và 6.2
begin;
select plan(1);
select pass('TODO: student RLS policies testing');
select * from finish();
rollback;
