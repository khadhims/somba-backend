import { MigrationInterface, QueryRunner } from 'typeorm';

export class ChangeEventDurationMinutesToFloat1740000000001
  implements MigrationInterface
{
  name = 'ChangeEventDurationMinutesToFloat1740000000001';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "events"
      ALTER COLUMN "duration_minutes" TYPE double precision
      USING "duration_minutes"::double precision
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "events"
      ALTER COLUMN "duration_minutes" TYPE integer
      USING ROUND("duration_minutes")::integer
    `);
  }
}
