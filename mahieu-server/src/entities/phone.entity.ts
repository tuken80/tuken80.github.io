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
    IsNotEmpty, IsPhoneNumber
} from 'class-validator';

import { UserEntity} from "./user.entity";
import {ContactEntity} from "./contact.entity";

@Entity({ name: 'phones' })
export class PhoneEntity extends BaseEntity {
    public static getRepo() {
        return getRepository(PhoneEntity);
    }

    @PrimaryGeneratedColumn()
    id: number;

    @Column({ unique: true })
    @IsNotEmpty({ message: "PhoneEntity value vide." })
    @IsPhoneNumber('FR', { message: "PhoneEntity value invalide." })
    number: string;

    @ManyToOne(() => UserEntity, u => u.phones,{ cascade: ['insert', 'update'] })
    @JoinColumn()
    user: UserEntity;

    @OneToMany(() => ContactEntity, c => c.phone,{ cascade: ['insert', 'update'] })
    contacts: ContactEntity[];

    constructor(number: string) {
        super();

        this.number = number;
    }


}