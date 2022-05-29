import nacl from 'tweetnacl';
import { web3 } from '@project-serum/anchor';
import b58 from 'bs58';
export const publicKeySignatureAuthenticationMiddleware = (req, res, next) => {
    const authorizationHeader = req.header('Authorization');
    if (!authorizationHeader) {
        return res
            .status(401)
            .send({ error: { message: 'Missing Authorization header' } });
    }
    const [, pubKeyBase64] = authorizationHeader.split(' ');
    const [pubKey, signature] = pubKeyBase64.split('.');
    const pubKeyBytes = new web3.PublicKey(pubKey).toBytes();
    const signatureBytes = b58.decode(signature);
    const validSignature = nacl.sign.detached.verify(pubKeyBytes, signatureBytes, pubKeyBytes);
    if (!validSignature) {
        return res.status(401).send({ error: { message: 'Invalid signature' } });
    }
    res.locals.pubKey = pubKey;
    next();
};
