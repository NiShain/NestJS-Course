import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateArticleTable1795157682290 implements MigrationInterface {
    name = 'CreateArticleTable1795157682290'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`tags\` (\`id\` int NOT NULL AUTO_INCREMENT, \`name\` varchar(100) NOT NULL, UNIQUE INDEX \`IDX_d90243459a697eadb8ad56e909\` (\`name\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`articles\` (\`id\` int NOT NULL AUTO_INCREMENT, \`slug\` varchar(255) NOT NULL, \`title\` varchar(255) NOT NULL, \`description\` text NOT NULL, \`body\` text NOT NULL, \`author_id\` int NOT NULL, \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), UNIQUE INDEX \`IDX_1123ff6815c5b8fec0ba9fec37\` (\`slug\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`article_tags\` (\`article_id\` int NOT NULL, \`tag_id\` int NOT NULL, INDEX \`IDX_f8c9234a4c4cb37806387f0c9e\` (\`article_id\`), INDEX \`IDX_1325dd0b98ee0f8f673db6ce19\` (\`tag_id\`), PRIMARY KEY (\`article_id\`, \`tag_id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`article_favorites\` (\`article_id\` int NOT NULL, \`user_id\` int NOT NULL, INDEX \`IDX_19fa0bc90b91678cc4d30e3737\` (\`article_id\`), INDEX \`IDX_8d1bc602f86930d0b609972221\` (\`user_id\`), PRIMARY KEY (\`article_id\`, \`user_id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`ALTER TABLE \`user\` ADD UNIQUE INDEX \`IDX_78a916df40e02a9deb1c4b75ed\` (\`username\`)`);
        await queryRunner.query(`ALTER TABLE \`articles\` ADD CONSTRAINT \`FK_6515da4dff8db423ce4eb841490\` FOREIGN KEY (\`author_id\`) REFERENCES \`user\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`article_tags\` ADD CONSTRAINT \`FK_f8c9234a4c4cb37806387f0c9e9\` FOREIGN KEY (\`article_id\`) REFERENCES \`articles\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE \`article_tags\` ADD CONSTRAINT \`FK_1325dd0b98ee0f8f673db6ce194\` FOREIGN KEY (\`tag_id\`) REFERENCES \`tags\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE \`article_favorites\` ADD CONSTRAINT \`FK_19fa0bc90b91678cc4d30e37375\` FOREIGN KEY (\`article_id\`) REFERENCES \`articles\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE \`article_favorites\` ADD CONSTRAINT \`FK_8d1bc602f86930d0b609972221a\` FOREIGN KEY (\`user_id\`) REFERENCES \`user\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`article_favorites\` DROP FOREIGN KEY \`FK_8d1bc602f86930d0b609972221a\``);
        await queryRunner.query(`ALTER TABLE \`article_favorites\` DROP FOREIGN KEY \`FK_19fa0bc90b91678cc4d30e37375\``);
        await queryRunner.query(`ALTER TABLE \`article_tags\` DROP FOREIGN KEY \`FK_1325dd0b98ee0f8f673db6ce194\``);
        await queryRunner.query(`ALTER TABLE \`article_tags\` DROP FOREIGN KEY \`FK_f8c9234a4c4cb37806387f0c9e9\``);
        await queryRunner.query(`ALTER TABLE \`articles\` DROP FOREIGN KEY \`FK_6515da4dff8db423ce4eb841490\``);
        await queryRunner.query(`ALTER TABLE \`user\` DROP INDEX \`IDX_78a916df40e02a9deb1c4b75ed\``);
        await queryRunner.query(`DROP INDEX \`IDX_8d1bc602f86930d0b609972221\` ON \`article_favorites\``);
        await queryRunner.query(`DROP INDEX \`IDX_19fa0bc90b91678cc4d30e3737\` ON \`article_favorites\``);
        await queryRunner.query(`DROP TABLE \`article_favorites\``);
        await queryRunner.query(`DROP INDEX \`IDX_1325dd0b98ee0f8f673db6ce19\` ON \`article_tags\``);
        await queryRunner.query(`DROP INDEX \`IDX_f8c9234a4c4cb37806387f0c9e\` ON \`article_tags\``);
        await queryRunner.query(`DROP TABLE \`article_tags\``);
        await queryRunner.query(`DROP INDEX \`IDX_1123ff6815c5b8fec0ba9fec37\` ON \`articles\``);
        await queryRunner.query(`DROP TABLE \`articles\``);
        await queryRunner.query(`DROP INDEX \`IDX_d90243459a697eadb8ad56e909\` ON \`tags\``);
        await queryRunner.query(`DROP TABLE \`tags\``);
    }

}
