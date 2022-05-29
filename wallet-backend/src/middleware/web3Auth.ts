import nacl from 'tweetnacl';
import { PublicKey } from '@solana/web3.js';
import { Response, RequestHandler } from 'express';
import b58 from 'bs58';
import { TextDecoder } from 'util';
import { DateTime } from 'luxon';

/**
 * Configuration context that is passed to the middleware via
 * function currying, this allows for several configurations
 * to modify how the validations are performed.
 */
type Web3AuthConfigurationContext = {
  /**
   * The action field is the name of the action that is being performed.
   * This is used to determine the signed message is correct, and also specifies
   * a persmission from the client to perform an activity.
   * If action is `"skip"`, and the handler is configured to `allowSkipCheck = true`, then
   * the check will be skipped, which is useful for JWT-Like authentication
   * on several types of endpoints (Like reading).
   */
  action: string;
  /**
   * If set to `true`, the current execution context will allow for an action
   * to be "skip", skipping the action check if the endpoint allows for it.
   */
  allowSkipCheck?: boolean;
};

type Web3AuthHandlerCreator = (
  ctx: Web3AuthConfigurationContext,
) => RequestHandler;

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
export const web3Auth: Web3AuthHandlerCreator = (ctx) => (req, res, next) => {
  const { action, allowSkipCheck } = ctx;
  const authHeader = req.header('Authorization');

  if (!authHeader) {
    return res
      .status(401)
      .send({ error: { message: 'Missing Authorization header' } });
  }

  const [, authToken] = authHeader.split(' ');
  const [pk, msg, sig] = authToken.split('.');
  const hasValidSig = nacl.sign.detached.verify(
    b58.decode(msg),
    b58.decode(sig),
    new PublicKey(pk).toBytes(),
  );

  if (!hasValidSig) {
    return res.status(401).send({ error: { message: 'Invalid signature' } });
  }

  const contents = JSON.parse(new TextDecoder().decode(b58.decode(msg))) as {
    action: string;
    exp: number;
  };

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

export const authorizedPk = (res: Response) => res.locals.pubKey as string;
