-- [TEST] Kiểm thử phân quyền RLS vai trò Giáo viên · tài liệu mục 4.4 và 6.2
begin;
select plan(1);
select pass('TODO: teacher RLS policies testing');
select * from finish();
rollback;
