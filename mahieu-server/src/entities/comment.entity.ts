import {
    BaseEntity,
    Entity,
    PrimaryGeneratedColumn,
    Column,
    JoinColumn,
    ManyToOne,
    getRepository
} from "typeorm";
import {
    IsString,
    IsNotEmpty
} from 'class-validator';

import { ArticleEntity} from "./article.entity";
import {UserEntity} from "./user.entity";

@Entity({ name: 'comments' })
export class CommentEntity extends BaseEntity {
    public static getRepo() {
        return getRepository(CommentEntity);
    }

    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    @IsNotEmpty({ message: "CommentEntity message vide." })
    @IsString({ message: "CommentEntity message invalid." })
    message: string;

    @ManyToOne(() => UserEntity, u => u.comments,{ cascade: ['insert', 'update'] })
    @JoinColumn()
    author: UserEntity;

    @ManyToOne(() => ArticleEntity, a => a.comments,{ cascade: ['insert', 'update'] })
    @JoinColumn()
    article: ArticleEntity;

    constructor(message: string, author: UserEntity, article: ArticleEntity) {
        super();

        this.message = message;
        this.author = author;
        this.article = article;
    }


}