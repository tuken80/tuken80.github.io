import * as dotenv from 'dotenv';
import * as winston from 'winston';

import "reflect-metadata";
import {createConnection, Connection} from "typeorm";

import * as express from 'express';

import {DbHandler} from "./handlers/db.handler";
import {AuthHandler} from "./handlers/auth.handler";
import {ErrorHandler} from "./handlers/error.handler";

import { SessionController } from "./controllers/session.controller";
import {ContactController} from "./controllers/contact.controller";

dotenv.config({
    path: `${__dirname}/env/${process.env.NODE_ENV ? process.env.NODE_ENV : 'development'}.env`
});

export class Server {
    private readonly app: express.Application;

    constructor() {
        this.app = express();

        this.loadLogger();

        this.loadDb()
            .then(() => this.loadApp())
            .catch(err => console.error(err));
    }

    private loadLogger(): void {
        this.app.locals.logger = winston.createLogger({
            level: 'info',
            format: winston.format.json(),
            defaultMeta: { service: 'user-service' },
            transports: [
                new winston.transports.File({ filename: `${__dirname}/../logs/error.log`, level: 'error' }),
                new winston.transports.File({ filename: `${__dirname}/../logs/combined.log` })
            ],
        });

        if (process.env.NODE_ENV !== 'production') this.app.locals.logger.add(new winston.transports.Console({ format: winston.format.simple() }));
    }

    private loadDb(): Promise<void> {
        return createConnection().then((connection: Connection) => {
            this.app.locals.db = connection;

            return this.app.locals.db.synchronize();
        });
    }

    private loadMiddlewares(): void {
        this.app.use(express.json());
        this.app.use(express.urlencoded({extended: true}));

        this.app.use(`${process.env.API_BASE_PATH}/static`, express.static(__dirname + '/../dist/public'));

        this.app.use(new DbHandler(this.app.locals.db).loader);
        this.app.use(new AuthHandler().loader);
    }

    private loadControllers(): void {
        const sessionController = new SessionController();

        this.app.post(`${process.env.API_BASE_PATH}/session/signin`, sessionController.signin);
        this.app.post(`${process.env.API_BASE_PATH}/session/signup`, sessionController.signup);
        this.app.get(`${process.env.API_BASE_PATH}/session/auth`, sessionController.getAuth);

        const contactController = new ContactController();

        this.app.get(`${process.env.API_BASE_PATH}/contacts`, contactController.gets);
        this.app.post(`${process.env.API_BASE_PATH}/contacts`, contactController.add);
    }

    private loadApp(): void {
        this.loadMiddlewares();
        this.loadControllers();
    }

    launch(): void {
        this.app.use(new ErrorHandler().loader);

        this.app.listen(process.env.PORT, () => {
            console.log(`MAHIEU SERVER listen on ${process.env.PORT}.`)
        });
    }
}

new Server()
    .launch();
