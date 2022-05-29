import nacl from 'tweetnacl';
import { PublicKey } from '@solana/web3.js';
import b58 from 'bs58';
import { TextDecoder } from 'util';
import { DateTime } from 'luxon';
/**
 * This authentication middleware is used to verify
 * that the request is signed by the owner of the public key.
 * It uses an authorization header with the following format:
 * `Authorization: Bearer pk.msg.sig`
 * Where pk is the base58-encoded public key, msg is the base58-encoded message,
 * and sig is the base58-encoded signature.
 * This middleware does not validate the lifetime of the signature or the
 * contents of the message.
 */
export const web3Auth = (ctx) => (req, res, next) => {
    const { action, allowSkipCheck } = ctx;
    const authHeader = req.header('Authorization');
    if (!authHeader) {
        return res
            .status(401)
            .send({ error: { message: 'Missing Authorization header' } });
    }
    const [, authToken] = authHeader.split(' ');
    const [pk, msg, sig] = authToken.split('.');
    const hasValidSig = nacl.sign.detached.verify(b58.decode(msg), b58.decode(sig), new PublicKey(pk).toBytes());
    if (!hasValidSig) {
        return res.status(401).send({ error: { message: 'Invalid signature' } });
    }
    const contents = JSON.parse(new TextDecoder().decode(b58.decode(msg)));
    if (DateTime.local().toUTC().toUnixInteger() > contents.exp) {
        return res.status(401).send({ error: { message: 'Expired signature' } });
    }
    const skipActionCheck = allowSkipCheck && contents.action === 'skip';
    console.log('💎', {
        action: contents.action,
        allowSkipCheck,
        skipActionCheck,
    });
    if (!skipActionCheck && contents.action !== action) {
        return res.status(401).send({ error: { message: 'Invalid action' } });
    }
    res.locals.pubKey = pk;
    return next();
};
export const authorizedPk = (res) => res.locals.pubKey;
