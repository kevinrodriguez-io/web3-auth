import nacl from 'tweetnacl';
import { web3 } from '@project-serum/anchor';
import b58 from 'bs58';
/**
 * This authentication middleware is used to verify
 * that the request is signed by the owner of the public key.
 * It uses an authorization header with the following format:
 * `Authorization: Beaer pk.msg.sig`
 * Where pk is the base58-encoded public key, msg is the base58-encoded message,
 * and sig is the base58-encoded signature.
 * This middleware does not validate the lifetime of the signature or the
 * contents of the message.
 */
export const publicKeySignatureAuthenticationMiddleware = (req, res, next) => {
    const authorizationHeader = req.header('Authorization');
    if (!authorizationHeader) {
        return res
            .status(401)
            .send({ error: { message: 'Missing Authorization header' } });
    }
    const [, authorizationChain] = authorizationHeader.split(' ');
    const [pk, msg, sig] = authorizationChain.split('.');
    const validSignature = nacl.sign.detached.verify(b58.decode(msg), b58.decode(sig), new web3.PublicKey(pk).toBytes());
    if (!validSignature) {
        return res.status(401).send({ error: { message: 'Invalid signature' } });
    }
    res.locals.pubKey = pk;
    next();
};
export const pkSigAuth = publicKeySignatureAuthenticationMiddleware;
