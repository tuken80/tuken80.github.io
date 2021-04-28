import {BaseEntity, Entity, PrimaryGeneratedColumn, Column, ManyToOne, getRepository} from "typeorm";
import { IsNotEmpty, IsString } from 'class-validator';

import {MailEntity} from "./mail.entity";
import {PhoneEntity} from "./phone.entity";
import {UserEntity} from "./user.entity";

@Entity({ name: 'contacts' })
export class ContactEntity extends BaseEntity {
    public static getRepo() {
        return getRepository(ContactEntity);
    }

    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    @IsNotEmpty({ message: 'ContactEntity sujet vide.' })
    @IsString({ message: 'ContactEntity sujet invalide.' })
    sujet: string;

    @Column()
    @IsNotEmpty({ message: 'ContactEntity details vide.' })
    @IsString({ message: 'ContactEntity details invalide.' })
    details: string;

    @ManyToOne(() => MailEntity, m => m.contacts,{ cascade: ['insert', 'update'] })
    mail: MailEntity;

    @ManyToOne(() => PhoneEntity, p => p.contacts,{ cascade: ['insert', 'update'] })
    phone: PhoneEntity;

    @ManyToOne(() => UserEntity, u => u.contacts,{ cascade: ['insert', 'update'] })
    user: UserEntity;

    constructor(sujet: string, details: string) {
        super();

        this.sujet = sujet;
        this.details = details;
    }
}