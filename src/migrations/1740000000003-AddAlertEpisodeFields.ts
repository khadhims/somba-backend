import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Alerts now carry their violation-episode window: the edge collapses a burst
 * of per-frame detections into one alert and reports the episode start/end.
 * Add the columns the Web UI Alerts page already expects.
 */
export class AddAlertEpisodeFields1740000000003 implements MigrationInterface {
  name = 'AddAlertEpisodeFields1740000000003';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "alerts"
        ADD COLUMN IF NOT EXISTS "event_start" TIMESTAMP WITH TIME ZONE,
        ADD COLUMN IF NOT EXISTS "event_end" TIMESTAMP WITH TIME ZONE,
        ADD COLUMN IF NOT EXISTS "duration_minutes" double precision
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "alerts"
        DROP COLUMN IF EXISTS "event_start",
        DROP COLUMN IF EXISTS "event_end",
        DROP COLUMN IF EXISTS "duration_minutes"
    `);
  }
}
