import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Alerts and recording events are independent domains — an alert never points
 * to a recording event. Drop the unused `recording_event_id` FK from `alerts`.
 * (Postgres drops the dependent FK constraint automatically with the column.)
 */
export class DropAlertRecordingEventLink1740000000002
  implements MigrationInterface
{
  name = 'DropAlertRecordingEventLink1740000000002';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "alerts" DROP COLUMN IF EXISTS "recording_event_id"
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "alerts" ADD COLUMN "recording_event_id" uuid
    `);
    await queryRunner.query(`
      ALTER TABLE "alerts"
      ADD CONSTRAINT "FK_alerts_recording_event_id"
      FOREIGN KEY ("recording_event_id") REFERENCES "events"("event_id")
      ON DELETE NO ACTION ON UPDATE NO ACTION
    `);
  }
}
