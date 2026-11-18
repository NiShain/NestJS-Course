import { MigrationInterface, QueryRunner } from "typeorm";

export class AddFollowsAndAttachments1794900767126 implements MigrationInterface {
    name = 'AddFollowsAndAttachments1794900767126'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`attachments\` (\`id\` varchar(36) NOT NULL, \`url\` varchar(255) NOT NULL, \`file_name\` varchar(255) NOT NULL, \`file_type\` varchar(255) NOT NULL, \`file_size\` int NOT NULL, \`attachable_type\` varchar(255) NOT NULL, \`attachable_id\` varchar(255) NOT NULL, INDEX \`IDX_418b716a9043b7a66cfa8d22db\` (\`attachable_type\`, \`attachable_id\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`user_follows\` (\`following_id\` int NOT NULL, \`follower_id\` int NOT NULL, INDEX \`IDX_5a71643cec3110af425f92e76e\` (\`following_id\`), INDEX \`IDX_f7af3bf8f2dcba61b4adc10823\` (\`follower_id\`), PRIMARY KEY (\`following_id\`, \`follower_id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`ALTER TABLE \`user_follows\` ADD CONSTRAINT \`FK_5a71643cec3110af425f92e76e5\` FOREIGN KEY (\`following_id\`) REFERENCES \`user\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE \`user_follows\` ADD CONSTRAINT \`FK_f7af3bf8f2dcba61b4adc108239\` FOREIGN KEY (\`follower_id\`) REFERENCES \`user\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`user_follows\` DROP FOREIGN KEY \`FK_f7af3bf8f2dcba61b4adc108239\``);
        await queryRunner.query(`ALTER TABLE \`user_follows\` DROP FOREIGN KEY \`FK_5a71643cec3110af425f92e76e5\``);
        await queryRunner.query(`DROP INDEX \`IDX_f7af3bf8f2dcba61b4adc10823\` ON \`user_follows\``);
        await queryRunner.query(`DROP INDEX \`IDX_5a71643cec3110af425f92e76e\` ON \`user_follows\``);
        await queryRunner.query(`DROP TABLE \`user_follows\``);
        await queryRunner.query(`DROP INDEX \`IDX_418b716a9043b7a66cfa8d22db\` ON \`attachments\``);
        await queryRunner.query(`DROP TABLE \`attachments\``);
    }

}
