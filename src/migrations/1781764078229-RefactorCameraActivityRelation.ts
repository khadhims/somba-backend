import { MigrationInterface, QueryRunner } from "typeorm";

export class RefactorCameraActivityRelation1781764078229 implements MigrationInterface {
    name = 'RefactorCameraActivityRelation1781764078229'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "organizations" ADD "created_by" uuid`);
        await queryRunner.query(`ALTER TABLE "teams" ADD "created_by" uuid`);
        await queryRunner.query(`ALTER TABLE "cameras" ADD "activity_uid" uuid`);
        await queryRunner.query(`ALTER TABLE "sites" ADD "created_by" uuid`);
        await queryRunner.query(`ALTER TABLE "organizations" ADD CONSTRAINT "FK_88a24953b7fb00e52d96fc1e2ba" FOREIGN KEY ("created_by") REFERENCES "users"("uid") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "teams" ADD CONSTRAINT "FK_e9998d2ac53a30bf287cb328b26" FOREIGN KEY ("created_by") REFERENCES "users"("uid") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "cameras" ADD CONSTRAINT "FK_6eef95005e39f5819a6530dbfb2" FOREIGN KEY ("activity_uid") REFERENCES "activities"("uid") ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "sites" ADD CONSTRAINT "FK_e2a9a2377348da2183f26b38fa1" FOREIGN KEY ("created_by") REFERENCES "users"("uid") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "sites" DROP CONSTRAINT "FK_e2a9a2377348da2183f26b38fa1"`);
        await queryRunner.query(`ALTER TABLE "cameras" DROP CONSTRAINT "FK_6eef95005e39f5819a6530dbfb2"`);
        await queryRunner.query(`ALTER TABLE "teams" DROP CONSTRAINT "FK_e9998d2ac53a30bf287cb328b26"`);
        await queryRunner.query(`ALTER TABLE "organizations" DROP CONSTRAINT "FK_88a24953b7fb00e52d96fc1e2ba"`);
        await queryRunner.query(`ALTER TABLE "sites" DROP COLUMN "created_by"`);
        await queryRunner.query(`ALTER TABLE "cameras" DROP COLUMN "activity_uid"`);
        await queryRunner.query(`ALTER TABLE "teams" DROP COLUMN "created_by"`);
        await queryRunner.query(`ALTER TABLE "organizations" DROP COLUMN "created_by"`);
    }

}
