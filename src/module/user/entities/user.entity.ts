import { Column, Entity, JoinTable, ManyToMany, PrimaryGeneratedColumn } from 'typeorm';

@Entity('user')
export class User {
    @PrimaryGeneratedColumn()
    id: number;

    @Column( { type: 'varchar', length: 500, unique: true } )
    username: string;

    @Column( { type: 'varchar', length: 500, unique: true } )
    email: string;

    @Column( { type: 'varchar', length: 500, select: false } )
    password: string;

    @Column( { type: 'varchar', length: 500, nullable: true, default: null } )
    bio: string | null;

    @Column({ type: 'varchar', length: 255, nullable: true, default: null })
    image: string | null;


    //following
    @ManyToMany(() => User, (user) => user.following)
    @JoinTable({
        name: 'user_follows',
        joinColumn: { name: 'following_id', referencedColumnName: 'id' },
        inverseJoinColumn: { name: 'follower_id', referencedColumnName: 'id' },
    })
    followers: User[];

    //followers
    @ManyToMany(() => User, (user) => user.followers)
    following: User[];

}