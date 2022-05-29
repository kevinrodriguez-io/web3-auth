import express from 'express';
import * as yup from 'yup';
import { uuid } from 'uuidv4';
import { rw, r } from '../lib/drivers/database.js';
import { postSchema } from '../models/post.js';
import { authorizedPk, web3Auth } from '../middleware/web3Auth.js';
const postsRouter = express.Router();
postsRouter.get('/', web3Auth({ action: 'posts:get-all', allowSkipCheck: true }), async (_req, res) => {
    const pk = authorizedPk(res);
    const posts = await r((db) => db.data.posts.filter(({ userId }) => userId === pk));
    return res.status(200).send({ data: { posts } });
});
postsRouter.get('/:postId', web3Auth({ action: 'posts:get-one', allowSkipCheck: true }), async (req, res) => {
    const pk = authorizedPk(res);
    const { postId } = req.params;
    const post = await r((db) => db.data.posts.find((post) => post.id === postId) ?? null);
    if (!post) {
        return res.status(404).send({
            error: {
                message: 'Post not found',
            },
        });
    }
    if (post.userId !== pk) {
        return res.status(403).send({
            error: {
                message: 'Forbidden',
            },
        });
    }
    return res.status(200).send({
        data: {
            post,
        },
    });
});
postsRouter.post('/', web3Auth({ action: 'posts:post' }), async (req, res) => {
    try {
        const pk = authorizedPk(res);
        const body = await postSchema.validate(req.body);
        const post = {
            id: uuid(),
            title: body.title,
            content: body.content,
            userId: pk,
        };
        await rw((db) => db.data.posts.push(post));
        return res.status(200).send({ data: { post } });
    }
    catch (error) {
        if (yup.ValidationError.isError(error)) {
            return res.status(400).send({ error: { message: error.message } });
        }
        else {
            return res.status(500).send({ error: { message: 'Unhandled error.' } });
        }
    }
});
postsRouter.put('/:postId', web3Auth({ action: 'posts:put' }), async (req, res) => {
    try {
        const pk = authorizedPk(res);
        const { postId } = req.params;
        const body = await postSchema.validate(req.body);
        const post = await rw((db) => {
            const match = db.data.posts.find(({ id }) => id === postId);
            if (!match) {
                throw new Error('Post not found');
            }
            if (match.userId !== pk) {
                throw new Error('Forbidden');
            }
            match.title = body.title;
            match.content = body.content;
            return match;
        });
        return res.status(200).send({ data: { post } });
    }
    catch (error) {
        if (yup.ValidationError.isError(error)) {
            return res.status(400).send({ error: { message: error.message } });
        }
        else {
            return res.status(500).send({ error: { message: 'Unhandled error.' } });
        }
    }
});
postsRouter.delete('/:postId', web3Auth({ action: 'posts:delete' }), async (req, res) => {
    try {
        const pk = authorizedPk(res);
        const { postId } = req.params;
        const post = await rw((db) => {
            const match = db.data.posts.find(({ id }) => id === postId);
            if (!match) {
                throw new Error('Post not found');
            }
            if (match.userId !== pk) {
                throw new Error('Forbidden');
            }
            db.data.posts = db.data.posts.filter(({ id }) => id !== postId);
            return match;
        });
        return res.status(200).send({ data: { post } });
    }
    catch (error) {
        if (yup.ValidationError.isError(error)) {
            return res.status(400).send({ error: { message: error.message } });
        }
        else {
            return res.status(500).send({ error: { message: 'Unhandled error.' } });
        }
    }
});
export { postsRouter };
