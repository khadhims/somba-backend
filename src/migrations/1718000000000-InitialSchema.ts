import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialSchema1718000000000 implements MigrationInterface {
  name = 'InitialSchema1718000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "organizations" (
        "uid" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "name" character varying NOT NULL,
        "legalName" character varying,
        "email" character varying,
        "phone" character varying,
        "website" character varying,
        "address" character varying,
        "country" character varying,
        "status" character varying NOT NULL DEFAULT 'active',
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_organizations" PRIMARY KEY ("uid")
      )
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "accounts" (
        "uid" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "name" character varying NOT NULL,
        "email" character varying,
        "phone" character varying,
        "organization_uid" uuid NOT NULL,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_accounts" PRIMARY KEY ("uid"),
        CONSTRAINT "FK_accounts_organization" FOREIGN KEY ("organization_uid")
          REFERENCES "organizations"("uid") ON DELETE NO ACTION ON UPDATE NO ACTION
      )
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "teams" (
        "uid" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "name" character varying NOT NULL,
        "account_uid" uuid NOT NULL,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_teams" PRIMARY KEY ("uid"),
        CONSTRAINT "FK_teams_account" FOREIGN KEY ("account_uid")
          REFERENCES "accounts"("uid") ON DELETE NO ACTION ON UPDATE NO ACTION
      )
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "users" (
        "uid" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "email" character varying NOT NULL,
        "first_name" character varying NOT NULL,
        "last_name" character varying NOT NULL,
        "password_hash" character varying NOT NULL,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_users" PRIMARY KEY ("uid"),
        CONSTRAINT "UQ_users_email" UNIQUE ("email")
      )
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "memberships" (
        "uid" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "user_uid" uuid NOT NULL,
        "organization_uid" uuid,
        "account_uid" uuid,
        "team_uid" uuid,
        "role" character varying NOT NULL,
        "joined_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_memberships" PRIMARY KEY ("uid"),
        CONSTRAINT "FK_memberships_user" FOREIGN KEY ("user_uid")
          REFERENCES "users"("uid") ON DELETE NO ACTION ON UPDATE NO ACTION,
        CONSTRAINT "FK_memberships_organization" FOREIGN KEY ("organization_uid")
          REFERENCES "organizations"("uid") ON DELETE NO ACTION ON UPDATE NO ACTION,
        CONSTRAINT "FK_memberships_account" FOREIGN KEY ("account_uid")
          REFERENCES "accounts"("uid") ON DELETE NO ACTION ON UPDATE NO ACTION,
        CONSTRAINT "FK_memberships_team" FOREIGN KEY ("team_uid")
          REFERENCES "teams"("uid") ON DELETE NO ACTION ON UPDATE NO ACTION
      )
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "sites" (
        "uid" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "name" character varying NOT NULL,
        "description" character varying,
        "address" character varying,
        "api_key_hash" character varying NOT NULL,
        "status" character varying NOT NULL DEFAULT 'active',
        "connection_status" character varying NOT NULL DEFAULT 'offline',
        "last_seen_at" TIMESTAMPTZ,
        "timezone" character varying,
        "team_uid" uuid NOT NULL,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_sites" PRIMARY KEY ("uid"),
        CONSTRAINT "UQ_sites_api_key_hash" UNIQUE ("api_key_hash"),
        CONSTRAINT "FK_sites_team" FOREIGN KEY ("team_uid")
          REFERENCES "teams"("uid") ON DELETE NO ACTION ON UPDATE NO ACTION
      )
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "cameras" (
        "uid" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "name" character varying NOT NULL,
        "site_uid" uuid NOT NULL,
        "room" character varying,
        "rtsp_url" character varying,
        "stream_url" character varying,
        "brand" character varying,
        "model" character varying,
        "type" character varying,
        "cam_resolution" character varying,
        "channels" integer,
        "location" character varying,
        "description" character varying,
        "camera_config" text,
        "status" character varying NOT NULL DEFAULT 'online',
        CONSTRAINT "PK_cameras" PRIMARY KEY ("uid"),
        CONSTRAINT "FK_cameras_site" FOREIGN KEY ("site_uid")
          REFERENCES "sites"("uid") ON DELETE NO ACTION ON UPDATE NO ACTION
      )
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "activities" (
        "uid" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "site_uid" uuid NOT NULL,
        "code" character varying NOT NULL,
        "name" character varying NOT NULL,
        "description" character varying,
        "ai_model" character varying NOT NULL,
        "target_classes" text NOT NULL,
        "min_confidence" double precision NOT NULL DEFAULT 0.5,
        "recording_config" text,
        "is_active" boolean NOT NULL DEFAULT true,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_activities" PRIMARY KEY ("uid"),
        CONSTRAINT "FK_activities_site" FOREIGN KEY ("site_uid")
          REFERENCES "sites"("uid") ON DELETE NO ACTION ON UPDATE NO ACTION
      )
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "camera_activities" (
        "uid" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "camera_uid" uuid NOT NULL,
        "activity_uid" uuid NOT NULL,
        "enabled" boolean NOT NULL DEFAULT true,
        CONSTRAINT "PK_camera_activities" PRIMARY KEY ("uid"),
        CONSTRAINT "UQ_camera_activities_camera_activity" UNIQUE ("camera_uid", "activity_uid"),
        CONSTRAINT "FK_camera_activities_camera" FOREIGN KEY ("camera_uid")
          REFERENCES "cameras"("uid") ON DELETE CASCADE ON UPDATE NO ACTION,
        CONSTRAINT "FK_camera_activities_activity" FOREIGN KEY ("activity_uid")
          REFERENCES "activities"("uid") ON DELETE CASCADE ON UPDATE NO ACTION
      )
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "events" (
        "event_id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "site_uid" uuid NOT NULL,
        "camera_uid" uuid NOT NULL,
        "activity_uid" uuid,
        "activity_type" character varying NOT NULL DEFAULT 'activity',
        "event_start" TIMESTAMP NOT NULL,
        "event_end" TIMESTAMP,
        "duration_minutes" integer,
        "recording_url" character varying,
        CONSTRAINT "PK_events" PRIMARY KEY ("event_id"),
        CONSTRAINT "FK_events_site" FOREIGN KEY ("site_uid")
          REFERENCES "sites"("uid") ON DELETE NO ACTION ON UPDATE NO ACTION,
        CONSTRAINT "FK_events_camera" FOREIGN KEY ("camera_uid")
          REFERENCES "cameras"("uid") ON DELETE NO ACTION ON UPDATE NO ACTION,
        CONSTRAINT "FK_events_activity" FOREIGN KEY ("activity_uid")
          REFERENCES "activities"("uid") ON DELETE NO ACTION ON UPDATE NO ACTION
      )
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "alerts" (
        "alert_id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "recording_event_id" uuid,
        "camera_uid" uuid NOT NULL,
        "violation_name" character varying NOT NULL,
        "severity" character varying NOT NULL DEFAULT 'high',
        "status" character varying NOT NULL DEFAULT 'notResolved',
        "image_url" character varying,
        "comment" character varying,
        "bbox" json,
        "total_detections" integer NOT NULL DEFAULT 0,
        "detected_at" TIMESTAMPTZ NOT NULL,
        CONSTRAINT "PK_alerts" PRIMARY KEY ("alert_id"),
        CONSTRAINT "FK_alerts_event" FOREIGN KEY ("recording_event_id")
          REFERENCES "events"("event_id") ON DELETE NO ACTION ON UPDATE NO ACTION,
        CONSTRAINT "FK_alerts_camera" FOREIGN KEY ("camera_uid")
          REFERENCES "cameras"("uid") ON DELETE NO ACTION ON UPDATE NO ACTION
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "alerts"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "events"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "camera_activities"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "activities"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "cameras"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "sites"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "memberships"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "users"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "teams"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "accounts"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "organizations"`);
  }
}
