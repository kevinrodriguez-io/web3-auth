import { web3 } from "@project-serum/anchor";
import axios, { Method } from "axios";
import { DateTime } from "luxon";
import b58 from "bs58";

export const web3Posts = axios.create({
  baseURL: "http://localhost:4000/posts",
});

type MessageSigner = {
  signMessage(message: Uint8Array): Promise<Uint8Array>;
  publicKey: web3.PublicKey;
};

export const getAuthToken = async (
  action: string,
  wallet: MessageSigner,
  exp = 5
) => {
  const encodedMessage = new TextEncoder().encode(
    JSON.stringify({
      action,
      exp: DateTime.local().toUTC().plus({ minutes: exp }).toUnixInteger(),
    })
  );
  const signature = await wallet.signMessage(encodedMessage);
  const pk = wallet.publicKey.toBase58();
  const msg = b58.encode(encodedMessage);
  const sig = b58.encode(signature);
  return `${pk}.${msg}.${sig}`;
};

export const performAuthenticatedRequest = async <T, R>(
  method: Method,
  url: string,
  action: string,
  wallet: MessageSigner,
  payload?: T,
  exp = 5
) => {
  // You can set up the backend to trust a single token for a given
  // expiration time, JWT style, so the user doesn't have to approve all.
  const authToken = await getAuthToken(action, wallet, exp);
  const response = await web3Posts.request<R>({
    data: payload,
    method,
    url,
    headers: {
      Authorization: `Bearer ${authToken}`,
    },
  });
  return response.data;
};
