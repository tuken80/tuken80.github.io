import {Request, Response} from "express";

import {ArticleEntity} from "../entities/article.entity";

export class BlogController {

    getArticles(req: Request, res: Response): void {
        ArticleEntity
            .getRepo()
            .find()
            .then((posts: ArticleEntity[]) => res.status(200).json(posts));
    }

    getArticle(req: Request, res: Response): void {
        ArticleEntity
            .getRepo()
            .findOne({ where: { id: req.body.id }, relations: [ "comments" ] })
            .then((post: ArticleEntity) => res.status(200).json(post));
    }

    addPost(req: Request, res: Response): void {
        ArticleEntity
            .getRepo()
            .save(new ArticleEntity(req.body.contenu))
            .then((post: ArticleEntity) => res.status(200).json(post));
    }
}