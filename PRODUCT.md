# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

- Admins manage accounts, classes, curriculum, and assessment configuration.
- High school Informatics teachers organize project-based learning, classes, groups, tasks, assessments, grades, and result publication.
- High school students view projects and tasks, update their Kanban work, submit peer assessments, and view published results.

## Product Purpose

EDUHT supports project-based learning (PBL) in high school Informatics courses. It helps teachers coordinate project work and assessment while giving students a place to manage tasks, assess peers, and see published outcomes. Specific success measures have not been established in the available project materials.

## Positioning

The product brings project organization, Kanban task tracking, BARS-based peer assessment, teacher progress monitoring, and result publication into one workflow for high school Informatics PBL. This description reflects the current project materials; no comparative market claim has been established.

## Operating Context

- Used by a student team developing the application for high school Informatics education.
- Deployed as a web application on Vercel and connected to hosted Supabase for authentication and PostgreSQL data.
- Admins, teachers, and students have distinct roles and access paths.

## Capabilities and Constraints

- Supports classes, projects, groups, tasks, curriculum requirements, peer assessment, grading, dashboards, and research data export.
- Some screens may use preview or sample data; the team should confirm data readiness before classroom use.
- Student data concerns minors. Research consent, pseudonymized exports, access control, and secret handling are part of the project constraints.
- Keep privileged Supabase service-role credentials server-side. Access to shared production data and database changes requires care as described in the project README.

## Open Decisions

- Product-specific success measures are not documented.
- The project materials do not establish a comparative positioning claim beyond the combined workflow listed above.
