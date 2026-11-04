-- [TEST] Kiểm thử tính bất biến và toàn vẹn dữ liệu xuyên bảng · tài liệu mục 4.4, 5.7 và 8.4
begin;
select plan(8);

-- 1. Kịch bản 5: Trigger forbid_mutation trên các bảng chỉ ghi thêm
select has_trigger('public', 'task_events', 'trg_forbid_mutation_task_events', 'task_events có trigger forbid_mutation');
select has_trigger('public', 'score_events', 'trg_forbid_mutation_score_events', 'score_events có trigger forbid_mutation');
select has_trigger('public', 'research_consent_events', 'trg_forbid_mutation_research_consent_events', 'research_consent_events có trigger forbid_mutation');
select has_trigger('public', 'research_exports', 'trg_forbid_mutation_research_exports', 'research_exports có trigger forbid_mutation');
select has_trigger('public', 'audit_logs', 'trg_forbid_mutation_audit_logs', 'audit_logs có trigger forbid_mutation');

-- 2. Kịch bản 16: INV-05 Bốn FK phức hợp trên final_scores bảo đảm cùng ngữ cảnh
select col_is_fk('public', 'final_scores', ARRAY['project_id', 'student_id'], 'final_scores có FK phức hợp (project_id, student_id)');
select col_is_fk('public', 'final_scores', ARRAY['group_id', 'project_id'], 'final_scores có FK phức hợp (group_id, project_id)');

-- 3. Kịch bản 17: INV-06 Trigger chặn sửa group_scores sau khi đã công bố
select has_trigger('public', 'group_scores', 'trg_guard_group_score_update', 'group_scores có trigger guard_group_score_update');

select * from finish();
rollback;
