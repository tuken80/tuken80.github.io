import {Connection} from "typeorm";
import {NextFunction, Request, RequestHandler, Response} from "express";

export class DbHandler {
    private readonly db: Connection;

    constructor(db) {
        this.db = db;
    }

    readonly loader: RequestHandler = (req: Request, res: Response, next: NextFunction) : void => {
        req.app.locals.db = this.db;
        next();
    }
}