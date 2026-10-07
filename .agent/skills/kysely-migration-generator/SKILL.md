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

2. **Study the existing migrations.** List the files in `src/db/migrations/` and read ALL of them, including `001_initial_schema.ts`. Match the existing import style and function signatures. This project uses ES modules. The filename follows step 4, not the existing numbering.

3. **Map the ERD to tables.**
   - Each entity becomes a table, except entities that already have a table in an existing migration (such as `users`). Do NOT create those again; only reference them in foreign keys.
   - Use lowercase snake_case plural names (for example `MEMBERS` becomes `members`).
   - Each attribute becomes a column. Map types: `int` to integer, `string` to varchar or text, `float` to real or numeric, `boolean` to boolean, and date-like names (`*_date`, `*_at`) to date or timestamp.
   - `PK` marks the primary key. Use an auto-generating `serial` id, matching the starter migration.
   - `FK` marks a foreign key. Every FK uses `.references('<table>.<column>').onDelete('cascade')`.
   - One-to-many (`||--o{`): put the FK on the "many" side.
   - One-to-one (`||--o|`): put the FK on the "o|" side and also add `.unique()`.
   - Many-to-many: use the join table that the ERD defines, with two FKs.
   - Add `notNull()` to columns that are required.
   - Add `.unique()` to columns that are natural identifiers (such as `email`, `card_number`, `isbn`, `username`), matching the starter migration's unique `email`.

4. **Write the migration.** Write the file to `src/db/migrations/<timestamp>_<migration_name>.ts`, where `<timestamp>` is the current UTC time as `YYYYMMDDHHMMSS` (for example `20261005143000_library_schema.ts`). Never edit or overwrite an existing migration. The file must:
   - export `async function up(db: Kysely<any>): Promise<void>` that creates the tables with `db.schema.createTable(...)`,
   - export `async function down(db: Kysely<any>): Promise<void>` that drops only the tables created in `up`,
   - create parent tables before child tables in `up`, and drop child tables before parent tables in `down`, so foreign keys never block either direction.

5. **Verify.** From the repository root, run `npm run build`. If it reports TypeScript errors, fix the migration and run it again, up to 3 retries. Then report whether the build passed.

6. **Final output.** Tell the user the migration file path, list the tables created, and suggest running `npm run migrate:up`.

## Constraints

- Generate only what the ERD describes. Do not add tables or columns that are not in it.
- Do not modify `docs/architecture/` files. That is the `erd-generator` skill's job.