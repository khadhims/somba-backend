import { MigrationInterface, QueryRunner } from 'typeorm';

export class SimplifyActivityToCameraFields1740000000000
  implements MigrationInterface
{
  name = 'SimplifyActivityToCameraFields1740000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "cameras"
      ADD COLUMN IF NOT EXISTS "activity" character varying,
      ADD COLUMN IF NOT EXISTS "alert" boolean NOT NULL DEFAULT false
    `);

    await queryRunner.query(`
      UPDATE "cameras" c
      SET "activity" = a."code"
      FROM "activities" a
      WHERE c."activity_uid" = a."uid"
        AND c."activity" IS NULL
    `);

    await queryRunner.query(`
      UPDATE "cameras"
      SET "activity" = 'activity'
      WHERE "activity" IS NULL OR trim("activity") = ''
    `);

    await queryRunner.query(`
      ALTER TABLE "cameras" ALTER COLUMN "activity" SET NOT NULL
    `);

    await queryRunner.query(`
      ALTER TABLE "cameras" DROP CONSTRAINT IF EXISTS "FK_cameras_activity_uid"
    `);
    await queryRunner.query(`
      ALTER TABLE "cameras" DROP CONSTRAINT IF EXISTS "FK_8a8c8f8f8a8c8f8f8a8c8f8f8a8c"
    `);
    await queryRunner.query(`
      DO $$
      DECLARE r RECORD;
      BEGIN
        FOR r IN
          SELECT conname
          FROM pg_constraint
          WHERE conrelid = 'cameras'::regclass
            AND contype = 'f'
            AND pg_get_constraintdef(oid) LIKE '%activity_uid%'
        LOOP
          EXECUTE format('ALTER TABLE cameras DROP CONSTRAINT %I', r.conname);
        END LOOP;
      END $$;
    `);

    await queryRunner.query(`
      ALTER TABLE "cameras" DROP COLUMN IF EXISTS "activity_uid"
    `);

    await queryRunner.query(`
      DO $$
      DECLARE r RECORD;
      BEGIN
        FOR r IN
          SELECT conname
          FROM pg_constraint
          WHERE conrelid = 'events'::regclass
            AND contype = 'f'
            AND pg_get_constraintdef(oid) LIKE '%activity_uid%'
        LOOP
          EXECUTE format('ALTER TABLE events DROP CONSTRAINT %I', r.conname);
        END LOOP;
      END $$;
    `);

    await queryRunner.query(`
      ALTER TABLE "events" DROP COLUMN IF EXISTS "activity_uid"
    `);

    await queryRunner.query(`DROP TABLE IF EXISTS "activities"`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
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
        CONSTRAINT "PK_activities" PRIMARY KEY ("uid")
      )
    `);

    await queryRunner.query(`
      ALTER TABLE "events"
      ADD COLUMN IF NOT EXISTS "activity_uid" uuid
    `);

    await queryRunner.query(`
      ALTER TABLE "cameras"
      ADD COLUMN IF NOT EXISTS "activity_uid" uuid
    `);

    await queryRunner.query(`
      ALTER TABLE "cameras"
      DROP COLUMN IF EXISTS "activity",
      DROP COLUMN IF EXISTS "alert"
    `);
  }
}
