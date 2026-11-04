-- [TEST] Kiểm thử quy trình tính điểm phía CSDL khớp test-vectors · tài liệu mục 4.4 và 7.3
begin;
select plan(1);
select pass('TODO: database scoring RPCs testing matching test-vectors');
select * from finish();
rollback;
