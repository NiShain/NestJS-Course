import {
    Column,
    CreateDateColumn,
    Entity,
    JoinColumn,
    ManyToOne,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
    type Relation,
} from 'typeorm';

import { Article } from "../../article/entities/article.entity.js";
import { User } from "../../user/entities/user.entity.js";


@Entity('comment')
export class Comment{
    @PrimaryGeneratedColumn()
    id: number;

    @Column ( {type: 'text'})
    body: string;

    @Column ( { name:'author_id', type: 'int' })
    authorId: number;

    @Column({ name: 'article_id', type: 'int' })
    articleId: number;

    @ManyToOne(() => Article, {onDelete: 'CASCADE'})
    @JoinColumn({ name: 'article_id' })
    article: Relation<Article>;

    @ManyToOne(() => User,{onDelete: 'CASCADE'})
    @JoinColumn({ name:'author_id' })
    author: Relation<User>;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;

}