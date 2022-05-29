# Solana Wallet Auth: A FullStack example

This example uses Solana's wallet adapter to sign messages and verifies
their signatures on the backend, allowing for a lean way to authenticate
users without the need for web2 credentials like email/password combinations
or social providers, in this scenario all you have to do is connect your wallet
and sign interaction messages to be properly authenticated.

## How to run

Backend

```bash
cd wallet-backend
yarn && yarn dev
```

Frontend

```bash
cd wallet-frontend
yarn && yarn dev
```

## Technology stack for this example

Most of the technologies used in this example are production ready,
however, be sure to check them and remember to switch LowDB for a
proper database.

### Backend

- NodeJS, Express, Typescript, LowDB (Local JSON file, only for testing), TweetNaCL.
- GraphQL example coming soon.

### Frontend

- React, Typescript, Vite, Solana-Wallet-Adapter, Tailwind.

## Notes

Validation on the backend happens using the library `tweetnacl`,
but some additional checks were added, like `action` and `message expiration`.

The files you want to check are:

- `@wallet-backend/src/middleware/web3Auth.ts`
- `@wallet-frontend/src/lib/api/web3Posts.ts`

Where `web3Auth.ts` defines a simple, yet powerful authorization middleware that
extracts the authorization headers and validates, then parses the message to perform
some additional checks and the `web3Posts.ts` axios client exemplifies a good set
of UX patterns, like reusing a token for `"skip"` requests (Requests that skip action checks).

## Here's a diagram of simplified is this authentication method

![arch](https://user-images.githubusercontent.com/6248571/170860443-52f07799-d3e4-4f5f-a78e-2b09b8dc4d58.png)

## Reference read

- [Solana Wallet Adapter - How can I sign and verify messages?](https://github.com/solana-labs/wallet-adapter/blob/master/FAQ.md#how-can-i-sign-and-verify-messages)
- [Phantom Wallet - Signing a Message](https://docs.phantom.app/integrating/extension-and-mobile-browser/signing-a-message)
- [TweetNaCL - Verfiy message signature](https://github.com/dchest/tweetnacl-js/blob/master/README.md#naclsigndetachedverifymessage-signature-publickey)
- [Improve user authentication with Web3 wallets](https://blog.logrocket.com/improve-user-authentication-web3-wallets/)
- [Build a Web3 authentication flow with React, Ether.js, and Ceramic](https://blog.logrocket.com/build-web3-authentication-flow-react-ether-js-ceramic/)
