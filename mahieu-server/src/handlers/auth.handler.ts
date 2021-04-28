import {NextFunction, Request, RequestHandler, Response} from "express";

import parseJwk from 'jose/jwk/parse';
import jwtVerify from 'jose/jwt/verify';
import decodeProtectedHeader from 'jose/util/decode_protected_header';

export class AuthHandler {
    private readonly publicRoutes = [
        '/api/session/signin',
        '/api/session/signup',
        '/api/contacts'
    ];

    readonly loader: RequestHandler = (req: Request, res: Response, next: NextFunction) => {
        if (this.publicRoutes.indexOf(req.originalUrl) !== -1) next();
        else if (req.headers.authorization) {
            const token: string = req.headers.authorization.split(' ')[1];
            const protectedHeader = decodeProtectedHeader(token);

             parseJwk({
                  alg: process.env.JOSE_ALG,
                  crv: process.env.JOSE_CRV,
                  kty: process.env.JOSE_KTY,
                  x: process.env.JOSE_X,
                  y: process.env.JOSE_Y
              })
                  .then(publicKey => jwtVerify(token, publicKey, {
                      issuer: 'urn:jose:issuer',
                      audience: `urn:${protectedHeader.user_mail}:audience`
                  }))
                  .then(decoded_token => {
                      req.app.locals.auth = decoded_token.payload;

                      next();
                  })
                  .catch(err => {
                      let status = 500;

                      if (err.code === 'ERR_JWS_INVALID') status = 401;

                      console.error(`AuthHandler - url: '${req.originalUrl}', token: '${token}' - ${status.toString()}`);

                      res.status(status).end();
                  });
        } else {
            console.error(`AuthHandler - url: '${req.originalUrl}' - 401`);

            res.status(401).end();
        }
    }
}