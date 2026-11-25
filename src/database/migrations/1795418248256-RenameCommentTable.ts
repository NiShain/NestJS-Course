import { MigrationInterface, QueryRunner } from "typeorm";

export class RenameCommentTable1795418248256 implements MigrationInterface {
    name = 'RenameCommentTable1795418248256';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`RENAME TABLE \`Comment\` TO \`comment\``);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`RENAME TABLE \`comment\` TO \`Comment\``);
    }
}
