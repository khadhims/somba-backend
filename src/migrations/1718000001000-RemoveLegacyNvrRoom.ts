import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Idempotent cleanup for databases created with older synchronize schema
 * (NVR / Room tables and FK columns on cameras).
 */
export class RemoveLegacyNvrRoom1718000001000 implements MigrationInterface {
  name = 'RemoveLegacyNvrRoom1718000001000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "cameras" ADD COLUMN IF NOT EXISTS "room" character varying
    `);

    await queryRunner.query(`
      UPDATE "cameras"
      SET "room" = ("camera_config"::jsonb)->>'room'
      WHERE "room" IS NULL
        AND "camera_config" IS NOT NULL
        AND "camera_config" <> ''
        AND ("camera_config"::jsonb)->>'room' IS NOT NULL
    `);

    await queryRunner.query(`
      DO $$
      DECLARE
        constraint_record RECORD;
      BEGIN
        FOR constraint_record IN
          SELECT tc.constraint_name
          FROM information_schema.table_constraints tc
          JOIN information_schema.key_column_usage kcu
            ON tc.constraint_name = kcu.constraint_name
            AND tc.table_schema = kcu.table_schema
          WHERE tc.table_schema = 'public'
            AND tc.table_name = 'cameras'
            AND tc.constraint_type = 'FOREIGN KEY'
            AND kcu.column_name IN ('room_id', 'nvr_uid')
        LOOP
          EXECUTE format(
            'ALTER TABLE "cameras" DROP CONSTRAINT IF EXISTS %I',
            constraint_record.constraint_name
          );
        END LOOP;
      END $$;
    `);

    await queryRunner.query(`
      ALTER TABLE "cameras" DROP COLUMN IF EXISTS "room_id"
    `);

    await queryRunner.query(`
      ALTER TABLE "cameras" DROP COLUMN IF EXISTS "nvr_uid"
    `);

    await queryRunner.query(`DROP TABLE IF EXISTS "rooms" CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS "nvrs" CASCADE`);
  }

  public async down(): Promise<void> {
    // Legacy tables are intentionally not recreated.
  }
}
