import { MigrationInterface, QueryRunner } from "typeorm";

export class RefactorCameraActivityRelation1781764078229 implements MigrationInterface {
    name = 'RefactorCameraActivityRelation1781764078229'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "cameras" ADD "activity_uid" uuid`);
        await queryRunner.query(`ALTER TABLE "cameras" ADD CONSTRAINT "FK_6eef95005e39f5819a6530dbfb2" FOREIGN KEY ("activity_uid") REFERENCES "activities"("uid") ON DELETE SET NULL ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "cameras" DROP CONSTRAINT "FK_6eef95005e39f5819a6530dbfb2"`);
        await queryRunner.query(`ALTER TABLE "cameras" DROP COLUMN "activity_uid"`);
    }

}
