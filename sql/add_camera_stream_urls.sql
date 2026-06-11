-- Simplified camera URL columns.
-- Run manually if DB_SYNCHRONIZE is disabled.

ALTER TABLE cameras ADD COLUMN IF NOT EXISTS rtsp_url VARCHAR;
ALTER TABLE cameras ADD COLUMN IF NOT EXISTS stream_url VARCHAR;

-- Optional cleanup of legacy columns
-- ALTER TABLE cameras DROP COLUMN IF EXISTS master_rtsp_url;
-- ALTER TABLE cameras DROP COLUMN IF EXISTS ip_address;
