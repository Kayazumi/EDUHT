// [CHUNG] Kiểu miền nghiệp vụ · tài liệu mục 7.4

export type TaskStatus = "todo" | "doing" | "done";

export type ProjectStatus = "draft" | "active" | "closed";

export type RoundStatus = "draft" | "open" | "closed";

export type RaterVisibility = "teacher_only" | "ratee_after_publish";

export type ConsentStatus = "pending" | "granted" | "declined" | "revoked";

export type ConsentParty = "student" | "guardian" | "both";

export type ScoreEventType = "computed" | "adjusted" | "published" | "unpublished";

export type CurriculumStrand = "dl" | "ict" | "cs";

export type TaskEventType =
  | "created"
  | "assigned"
  | "status_changed"
  | "due_changed"
  | "edited"
  | "archived";
