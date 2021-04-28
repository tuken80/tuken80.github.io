import {
    BaseEntity,
    Entity,
    PrimaryGeneratedColumn,
    Column,
    JoinColumn,
    OneToMany,
    ManyToOne,
    getRepository
} from "typeorm";
import {
    IsEmail,
    IsNotEmpty
} from 'class-validator';

import { UserEntity} from "./user.entity";
import {ContactEntity} from "./contact.entity";

@Entity({ name: 'mails' })
export class MailEntity extends BaseEntity {
    public static getRepo() {
        return getRepository(MailEntity);
    }

    @PrimaryGeneratedColumn()
    id: number;

    @Column({ unique: true })
    @IsNotEmpty({ message: "MailEntity value vide." })
    @IsEmail({}, { message: "MailEntity value invalide." })
    adresse: string;

    @ManyToOne(() => UserEntity, u => u.mails,{ cascade: ['insert', 'update'] })
    @JoinColumn()
    user: UserEntity;

    @OneToMany(() => ContactEntity, c => c.mail,{ cascade: ['insert', 'update'] })
    contacts: ContactEntity[];

    constructor(adresse: string) {
        super();

        this.adresse = adresse;
    }


}