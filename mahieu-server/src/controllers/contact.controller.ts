import {NextFunction, Request, Response} from "express";

import {ContactEntity} from "../entities/contact.entity";
import {UserEntity} from "../entities/user.entity";
import {MailEntity} from "../entities/mail.entity";
import {PhoneEntity} from "../entities/phone.entity";
import {Repository} from "typeorm";

export class ContactController {

    gets(req: Request, res: Response): void {
        ContactEntity
            .getRepo()
            .find({
                relations: [
                    "user",
                    "user.mails",
                    "user.phones",
                    "mail",
                    "phone"
                ]
            })
            .then((contacts: ContactEntity[]) => res.status(200).json(contacts));
    }

    add(req: Request, res: Response): void {
        let c: ContactEntity = new ContactEntity(req.body.sujet, req.body.details);
        const contactRepo: Repository<ContactEntity> = ContactEntity.getRepo();

        if (req.app.locals.auth !== undefined) {
            UserEntity
                .getRepo()
                .findOne({ where: { id: req.app.locals.auth.id } })
                .then((u: UserEntity) => {
                    c.user = u;

                    return contactRepo
                        .save(c);
                })
                .then((cs: ContactEntity) => res.status(201).json(cs));
        } else {
            const mailRepo: Repository<MailEntity> = MailEntity.getRepo();
            const phoneRepo: Repository<PhoneEntity> = PhoneEntity.getRepo();

            Promise
                .all([
                    mailRepo
                        .findOne({ where: { adresse: req.body.mail } }),
                    phoneRepo
                        .findOne({ where: { number: req.body.phone } })
                ])
                .then((results: (MailEntity|PhoneEntity)[]) => {
                    let promises = {
                        mail: undefined,
                        phone: undefined
                    };

                    if (results[0] === undefined) {
                        results[0] = new MailEntity(req.body.mail);
                        promises.mail = mailRepo.save(results[0]);
                    }
                    if (results[1] === undefined) {
                        results[1] = new PhoneEntity(req.body.phone);
                        promises.phone = phoneRepo.save(results[1]);
                    }

                    return Promise.all([
                        (promises.mail === undefined) ? Promise.resolve(results[0]) : promises.mail,
                        (promises.phone === undefined) ? Promise.resolve(results[1]) : promises.phone
                    ]);
                })
                .then((results: (MailEntity|PhoneEntity)[]) => {
                    c.mail = results[0] as MailEntity;
                    c.phone = results[1] as PhoneEntity;

                    return contactRepo.save(c);
                })
                .then((cs: ContactEntity) => res.status(201).json(cs));
        }

    }
}