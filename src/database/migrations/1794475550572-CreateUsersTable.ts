import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateUsersTable1794475550572 implements MigrationInterface {
    name = 'CreateUsersTable1794475550572'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`user\` (\`id\` int NOT NULL, \`username\` varchar(500) NOT NULL, \`email\` varchar(500) NOT NULL, \`password\` varchar(500) NOT NULL, \`bio\` varchar(500) NULL, \`image\` varchar(255) NULL, UNIQUE INDEX \`IDX_e12875dfb3b1d92d7d7c5377e2\` (\`email\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX \`IDX_e12875dfb3b1d92d7d7c5377e2\` ON \`user\``);
        await queryRunner.query(`DROP TABLE \`user\``);
    }

}
