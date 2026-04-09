-- Rolls back the 'role' column entirely if the migration crashes sequentially
ALTER TABLE demo_records DROP COLUMN role;
