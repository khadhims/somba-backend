-- Site status refactor: operational status vs edge connection status

ALTER TABLE sites ADD COLUMN IF NOT EXISTS connection_status VARCHAR NOT NULL DEFAULT 'offline';

-- Migrate legacy rows where status stored edge online/offline
UPDATE sites
SET
  connection_status = status,
  status = CASE WHEN is_active = FALSE THEN 'inactive' ELSE 'active' END
WHERE status IN ('online', 'offline');

UPDATE sites
SET status = CASE WHEN is_active = FALSE THEN 'inactive' ELSE 'active' END
WHERE status NOT IN ('active', 'inactive');

ALTER TABLE sites DROP COLUMN IF EXISTS is_active;
