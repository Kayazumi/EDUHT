-- [DB] Khởi tạo extension và các kiểu enum · tài liệu mục 4.4 và 5.1

-- Extensions
create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

-- Enum: user_role
create type user_role as enum ('admin', 'teacher', 'student');

-- Enum: project_status
create type project_status as enum ('draft', 'active', 'closed');

-- Enum: task_status
create type task_status as enum ('todo', 'doing', 'done');

-- Enum: task_event_type
create type task_event_type as enum (
  'created',
  'assigned',
  'reassigned',
  'status_changed',
  'due_changed',
  'due_date_changed',
  'edited',
  'title_or_desc_changed',
  'archived'
);

-- Enum: round_status
create type round_status as enum ('draft', 'open', 'closed');

-- Enum: rater_visibility
create type rater_visibility as enum ('teacher_only', 'ratee_after_publish');

-- Enum: curriculum_strand
create type curriculum_strand as enum ('dl', 'ict', 'cs');

-- Enum: consent_status
create type consent_status as enum ('pending', 'granted', 'declined', 'revoked');

-- Enum: consent_party
create type consent_party as enum ('student', 'guardian', 'both');

-- Enum: score_event_type
create type score_event_type as enum (
  'computed',
  'adjusted',
  'published',
  'unpublished'
);
