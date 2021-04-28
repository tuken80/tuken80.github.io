import {Request, Response} from "express";

import {Repository} from "typeorm";

import SignJWT from 'jose/jwt/sign';
import parseJwk from 'jose/jwk/parse';

import * as bcrypt from 'bcrypt';

import * as moment from 'moment';

import {UserEntity} from "../entities/user.entity";
import {MailEntity} from "../entities/mail.entity";

export class SessionController {

    signin(req: Request, res: Response): void {
        MailEntity
            .getRepo()
            .findOne({ where: { adresse: req.body.mail }, relations: ["user"] })
            .then((m: MailEntity) => {
                if (m === undefined) return Promise.reject(new Error('404'));

                return bcrypt
                    .compare(req.body.pass, m.user.hash)
                    .then((match: boolean) => {
                        if (!match) return Promise.reject(new Error('401'));

                        return parseJwk({
                            alg: process.env.JOSE_ALG,
                            crv: process.env.JOSE_CRV,
                            kty: process.env.JOSE_KTY,
                            d: process.env.JOSE_D,
                            x: process.env.JOSE_X,
                            y: process.env.JOSE_Y
                        });
                    })
                    .then((privateKey: string) => new SignJWT({
                        id: m.user.id,
                        mail: req.body.mail,
                        nom: `${m.user.firstname} ${m.user.lastname}`
                    })
                        .setProtectedHeader({ alg: 'ES256', user_mail: req.body.mail })
                        .setIssuedAt()
                        .setIssuer('urn:jose:issuer')
                        .setAudience(`urn:${req.body.mail}:audience`)
                        .setExpirationTime('2h')
                        .sign(privateKey))
                    .then((jwt: string) => res.status(200).json({
                        token: jwt,
                        role: m.user.role
                    }))
                    .catch(err => {
                        console.error(`SessionController signin - mail: '${req.body.mail}', pass: '${req.body.pass}' - ${err}`);

                        if (err.toString() === 'Error: 401') res.status(401).end();

                        res.status(500).end();
                    });
            })
            .catch(err => {
                console.error(`SessionController signin - mail: '${req.body.mail}', pass: '${req.body.pass}' - ${err}`);

                if (err.toString() === 'Error: 404') res.status(404).end();

                res.status(500).end();
            });
    }

    signup(req: Request, res: Response): void {
        const mRepo: Repository<MailEntity> = MailEntity.getRepo();

        mRepo
            .findOne({ where: { adresse: req.body.ids.mail }, relations: ["user"] })
            .then((m: MailEntity) => {
                if (m === undefined) {
                    m = new MailEntity(req.body.ids.mail);
                }

                if (m.user !== undefined) return Promise.reject(new Error('409'));

                return mRepo.save(m);
            })
            .then((m: MailEntity) => {
                let u: UserEntity = new UserEntity();

                u.genre = req.body.data.genre === '' ? 'autre' : req.body.data.genre;
                u.firstname = req.body.data.firstname;
                u.lastname = req.body.data.lastname;
                u.birthdate = moment(req.body.data.birthdate).toDate();

                u.mails = [m];

                u
                    .setHash(req.body.ids.pass)
                    .then((hashed: boolean) => {
                        if (hashed !== true) return Promise.reject(`500 ${hashed}`);

                        return UserEntity.getRepo().save(u);
                    })
                    .then(() => parseJwk({
                        alg: process.env.JOSE_ALG,
                        crv: process.env.JOSE_CRV,
                        kty: process.env.JOSE_KTY,
                        d: process.env.JOSE_D,
                        x: process.env.JOSE_X,
                        y: process.env.JOSE_Y
                    }))
                    .then((privateKey: string) => new SignJWT({
                            id: u.id,
                            mail: req.body.ids.mail,
                            nom: `${u.firstname} ${u.lastname}`
                        })
                        .setProtectedHeader({alg: 'ES256', user_mail: req.body.ids.mail})
                        .setIssuedAt()
                        .setIssuer('urn:jose:issuer')
                        .setAudience(`urn:${req.body.ids.mail}:audience`)
                        .setExpirationTime('2h')
                        .sign(privateKey))
                    .then((jwt: string) => res.status(201).json({
                        token: jwt,
                        role: u.role
                    }))
                    .catch(err => {
                        console.error(`SessionController signup - mail: '${req.body.ids.mail}', pass: '${req.body.ids.pass}' - ${err}`);

                        res.status(500).end();
                    });
            })
            .catch(err => {
                console.error(`SessionController signup - mail: '${req.body.ids.mail}', pass: '${req.body.ids.pass}' - ${err}`);

                if (err.toString() === 'Error: 409') res.status(409).end();

                res.status(500).end();
            });
    }

    getAuth(req: Request, res: Response): void {
        UserEntity
            .getRepo()
            .findOne({
                select: [
                    "id",
                    "genre",
                    "firstname",
                    "lastname",
                    "birthdate",
                    "role"
                ],
                where: {
                    id: req.app.locals.auth.id
                },
                relations: [
                    "mails"
                ]
            })
            .then((u: UserEntity | undefined) => {
                if (u === undefined)
                    res.status(404).end();
                else
                    res.status(200).json(u);
            })
            .catch(err => {
                console.error(`SessionController getAuth() - id: ${req.app.locals.auth.id} - ${err}`);

                res.status(500).end();
            });
    }
}