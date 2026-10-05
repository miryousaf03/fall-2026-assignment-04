import { Kysely } from 'kysely';

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .createTable('members')
    .addColumn('id', 'serial', (col) => col.primaryKey())
    .addColumn('card_number', 'varchar(255)', (col) => col.notNull().unique())
    .addColumn('first_name', 'varchar(255)', (col) => col.notNull())
    .addColumn('last_name', 'varchar(255)', (col) => col.notNull())
    .addColumn('email', 'varchar(255)', (col) => col.notNull().unique())
    .addColumn('phone', 'varchar(255)')
    .addColumn('joined_date', 'date', (col) => col.notNull())
    .addColumn('status', 'varchar(255)', (col) => col.notNull())
    .execute();

  await db.schema
    .createTable('books')
    .addColumn('id', 'serial', (col) => col.primaryKey())
    .addColumn('isbn', 'varchar(255)', (col) => col.notNull().unique())
    .addColumn('title', 'varchar(255)', (col) => col.notNull())
    .addColumn('author', 'varchar(255)', (col) => col.notNull())
    .addColumn('published_year', 'integer', (col) => col.notNull())
    .addColumn('genre', 'varchar(255)', (col) => col.notNull())
    .addColumn('total_copies', 'integer', (col) => col.notNull())
    .addColumn('available_copies', 'integer', (col) => col.notNull())
    .execute();

  await db.schema
    .createTable('loans')
    .addColumn('id', 'serial', (col) => col.primaryKey())
    .addColumn('member_id', 'integer', (col) =>
      col.references('members.id').onDelete('cascade').notNull()
    )
    .addColumn('book_id', 'integer', (col) =>
      col.references('books.id').onDelete('cascade').notNull()
    )
    .addColumn('loan_date', 'date', (col) => col.notNull())
    .addColumn('due_date', 'date', (col) => col.notNull())
    .addColumn('return_date', 'date')
    .addColumn('status', 'varchar(255)', (col) => col.notNull())
    .execute();
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.dropTable('loans').execute();
  await db.schema.dropTable('books').execute();
  await db.schema.dropTable('members').execute();
}
