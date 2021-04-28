import {ErrorRequestHandler, NextFunction, Request, Response} from "express";

export class ErrorHandler {
    readonly loader: ErrorRequestHandler = (err: { stack: any; }, req: Request, res: Response, next: NextFunction) => {
        if (res.headersSent) {
            return next(err);
        }

        console.error(err.stack);
        res.status(500).end();
    }
}