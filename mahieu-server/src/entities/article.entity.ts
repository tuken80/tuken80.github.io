import {
    BaseEntity,
    Entity,
    PrimaryGeneratedColumn,
    Column,
    OneToMany,
    getRepository
} from "typeorm";
import {
    IsString,
    IsNotEmpty
} from 'class-validator';

import { CommentEntity } from "./comment.entity";

@Entity({ name: 'posts' })
export class ArticleEntity extends BaseEntity {
    public static getRepo() {
        return getRepository(ArticleEntity);
    }

    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    @IsNotEmpty({ message: "PostEntity contenu vide." })
    @IsString({ message: "PostEntity contenu invalid." })
    contenu: string;

    @OneToMany(type => CommentEntity, c => c.author,{ cascade: ['insert', 'update'] })
    comments: CommentEntity[];

    constructor(contenu: string) {
        super();

        this.contenu = contenu;
    }


}