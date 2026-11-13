import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class User {
    @PrimaryGeneratedColumn()
    id: number;

    @Column( { type: 'varchar', length: 500, unique: false } )
    username: string;

    @Column( { type: 'varchar', length: 500, unique: true } )
    email: string;

    @Column( { type: 'varchar', length: 500, select: false } )
    password: string;

    @Column( { type: 'varchar', length: 500, nullable: true, default: null } )
    bio: string | null;

    @Column({ type: 'varchar', length: 255, nullable: true, default: null })
    image: string | null;

}