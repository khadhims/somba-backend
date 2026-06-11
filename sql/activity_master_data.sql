-- Activity master data tables (scope: site_uid)

CREATE TABLE IF NOT EXISTS activities (
  uid UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  site_uid UUID NOT NULL REFERENCES sites(uid) ON DELETE CASCADE,
  code VARCHAR NOT NULL,
  name VARCHAR NOT NULL,
  description VARCHAR,
  ai_model VARCHAR NOT NULL,
  target_classes JSONB NOT NULL DEFAULT '[]',
  min_confidence REAL NOT NULL DEFAULT 0.5,
  recording_config JSONB,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (site_uid, code)
);

CREATE TABLE IF NOT EXISTS camera_activities (
  uid UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  camera_uid UUID NOT NULL REFERENCES cameras(uid) ON DELETE CASCADE,
  activity_uid UUID NOT NULL REFERENCES activities(uid) ON DELETE CASCADE,
  enabled BOOLEAN NOT NULL DEFAULT TRUE,
  UNIQUE (camera_uid, activity_uid)
);

ALTER TABLE events ADD COLUMN IF NOT EXISTS activity_uid UUID REFERENCES activities(uid);
