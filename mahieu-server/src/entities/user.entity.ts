import * as bcrypt from 'bcrypt';

import {Entity, PrimaryGeneratedColumn, Column, OneToMany, Unique, BaseEntity, getRepository} from "typeorm";
import {IsDate, IsNotEmpty, IsString} from 'class-validator';

import {MailEntity} from "./mail.entity";
import {PhoneEntity} from "./phone.entity";
import {ContactEntity} from "./contact.entity";
import {CommentEntity} from "./comment.entity";

export type UserRoleType = "admin" | "client";
export type UserGenreType = "masculin" | "feminin" | "autre";

@Entity({ name: 'users' })
@Unique("INDIVIDU", ["firstname", "lastname", "birthdate"])
export class UserEntity extends BaseEntity {
    public static getRepo() {
        return getRepository(UserEntity);
    }

    @PrimaryGeneratedColumn()
    id: number;

    @Column({
        type: "enum",
        enum: ["masculin", "feminin", "autre"]
    })
    genre: UserGenreType;

    @Column({nullable: true})
    @IsString({ message: 'UserEntity firstname invalide.' })
    firstname: string;

    @Column({nullable: true})
    @IsString({ message: 'UserEntity lastname invalide.' })
    lastname: string;

    @Column({nullable: true})
    @IsDate({ message: "UserEntity birthdate invalide." })
    birthdate: Date;

    @Column()
    @IsNotEmpty({message: 'UserEntity hash vide.'})
    hash: string;

    @Column()
    @IsNotEmpty({message: 'UserEntity salt vide.'})
    salt: string;

    @Column({
        type: "enum",
        enum: ["admin", "client"],
        default: "client"
    })
    role: UserRoleType;

    @OneToMany(type => MailEntity, m => m.user,{ cascade: ['insert', 'update'] })
    mails: MailEntity[];

    @OneToMany(type => PhoneEntity, m => m.user,{ cascade: ['insert', 'update'] })
    phones: PhoneEntity[];

    @OneToMany(type => ContactEntity, c => c.user,{ cascade: ['insert', 'update'] })
    contacts: ContactEntity[];

    @OneToMany(type => CommentEntity, c => c.author,{ cascade: ['insert', 'update'] })
    comments: CommentEntity[];

    async setHash(pass: string): Promise<boolean> {
        return bcrypt
            .genSalt(10)
            .then((salt, err) => {
                if (err !== undefined) Promise.reject(new Error('SALT'));

                this.salt = salt;

                return bcrypt.hash(pass, salt);
            })
            .then((encrypted, err) => {
                if (err !== undefined) Promise.reject(new Error('HASH'));

                this.hash = encrypted;

                return Promise.resolve(true);
            });
    }
}
