-- Add 'role' column safely mapped to the existing Postgres Table.
ALTER TABLE demo_records ADD COLUMN role VARCHAR(50) DEFAULT 'user';
