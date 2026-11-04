-- [TEST] Kiểm thử tính bất biến của bảng chỉ ghi thêm · tài liệu mục 4.4 và 5.7
begin;
select plan(1);
select pass('TODO: immutability tests for task_events, audit_logs, score_events');
select * from finish();
rollback;
