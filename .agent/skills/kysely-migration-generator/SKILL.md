---
name: kysely-migration-generator
description: "Use when asked to generate a database migration, Kysely migration, or SQL schema from an ERD, Mermaid diagram, or data model in docs/architecture/. Reads the compiled Mermaid ERD and writes a type-safe Kysely migration into src/db/migrations/."
---

# Kysely Migration Generator

Translate a Mermaid ERD into a production-ready Kysely migration.

## Inputs and outputs

- Input: the Mermaid ERD at `docs/architecture/schema.mmd` (if the user names another `.mmd` file in `docs/architecture/`, use that one).
- Output: one new migration file in `src/db/migrations/`.

## Workflow

1. **Read the ERD.** Open the `.mmd` file in `docs/architecture/`. If it does not exist, stop and tell the user to run the `erd-generator` skill first. Do not invent a schema.

2. **Study the existing style.** Read `src/db/migrations/001_initial_schema.ts` and list the files in `src/db/migrations/`. Match the existing import style, function signatures, and naming conventions. This project uses ES modules.

3. **Map the ERD to tables.**
   - Each entity becomes a table. Use lowercase snake_case plural names (for example `MEMBERS` becomes `members`).
   - Each attribute becomes a column. Map types: `int` to integer, `string` to varchar or text, `float` to real or numeric, `boolean` to boolean, and date-like names (`*_date`, `*_at`) to date or timestamp.
   - `PK` marks the primary key.
   - `FK` marks a foreign key. Use `.references('<table>.<column>')` and, where the ERD implies it, `.onDelete(...)`.
   - Use the relationship lines (`||--o{` and so on) to decide which table holds the foreign key and whether it is nullable.
   - Add `notNull()` to columns that are required.
   - Add `.unique()` to columns that are natural identifiers (such as `email`, `card_number`, `isbn`, `username`), matching the starter migration's unique `email`.

4. **Write the migration.** Create the next numbered file in `src/db/migrations/`, one higher than the highest existing number, with a descriptive name (for example `002_library_schema.ts`). Never edit or overwrite an existing migration. The file must:
   - export `async function up(db: Kysely<any>): Promise<void>` that creates the tables with `db.schema.createTable(...)`,
   - export `async function down(db: Kysely<any>): Promise<void>` that drops the tables,
   - create parent tables before child tables in `up`, and drop child tables before parent tables in `down`, so foreign keys never block either direction.

5. **Verify.** From the repository root, run `npm run build`. If it reports TypeScript errors, fix the migration and run it again, up to 3 retries. Then report whether the build passed.

6. **Final output.** Tell the user the migration file path, list the tables created, and suggest running `npm run migrate:up`.

## Constraints

- Generate only what the ERD describes. Do not add tables or columns that are not in it.
- Do not modify `docs/architecture/` files. That is the `erd-generator` skill's job.