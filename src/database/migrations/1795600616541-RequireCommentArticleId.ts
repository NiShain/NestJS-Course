import { MigrationInterface, QueryRunner } from "typeorm";

export class RequireCommentArticleId1795600616541 implements MigrationInterface {
    name = 'RequireCommentArticleId1795600616541';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`comment\` MODIFY \`article_id\` int NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`comment\` MODIFY \`article_id\` int NULL`);
    }
}
