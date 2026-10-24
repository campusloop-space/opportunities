# Drizzle ORM Schema & Migrations

This directory contains versioned SQL migrations for the CampusLoop Opportunities application on Neon PostgreSQL.

## Database Architecture

1. **`opportunities`**:
   - `id`: UUID primary key
   - `slug`: Unique stable canonical identifier
   - `title`, `summary`, `description`: Grounded listing information
   - `category`: `internships`, `hackathons`, `scholarships`, `fellowships`, `research`, `competitions`, `student_programs`
   - `tags`: JSONB array of normalized tags
   - `organizer_name`, `organizer_website`, `source_url`, `application_url`
   - `location`, `delivery_mode`: `remote`, `in_person`, `hybrid`, `unknown`
   - `eligibility_summary`, `eligible_degrees`, `eligible_years`, `eligible_fields`, `eligible_countries`
   - `benefits_summary`, `stipend_amount`, `stipend_currency`
   - `application_opens_at`, `deadline_at`, `deadline_timezone`, `rolling_deadline`
   - `status`: `draft`, `published`, `closed`, `expired`, `rejected`
   - `source_checked_at`, `published_at`, `last_seen_at`, `closed_reason`
   - `source_method`: `official`, `organizer_submitted`, `editorial`, `imported`
   - `content_hash`, `created_by`, `updated_by`, `metadata`

2. **`users`**:
   - Stores authenticated CampusLoop users keyed by `sub` (pairwise OpenID Connect subject identifier).
   - Tracks `student_verified` (boolean), verified college details, branch, degree, and year.

3. **`saved_opportunities`**:
   - User bookmarks linking `user_sub` to `opportunity_id` with a unique constraint on `(user_sub, opportunity_id)`.

4. **`opportunity_audit_logs`**:
   - Audit trail capturing AI Agent and maintainer modifications (`create`, `update`, `publish`, `close`, `expire`, `delete`).

5. **`reports`**:
   - User submissions reporting expired listings, broken links, outdated information, or suspicious opportunities.

## Commands

- **Generate migrations**:
  ```bash
  pnpm db:generate
  ```

- **Run migrations against Neon**:
  ```bash
  pnpm db:migrate
  ```

- **Inspect database**:
  ```bash
  pnpm drizzle-kit studio
  ```
