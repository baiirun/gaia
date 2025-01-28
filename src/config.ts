import { Effect, Config } from "effect";

export class Environment extends Effect.Service<Environment>()("Environment", {
  effect: Effect.gen(function* () {
    const IPFS_KEY = yield* Config.string("IPFS_KEY");
    const IPFS_GATEWAY_WRITE = yield* Config.string("IPFS_GATEWAY_WRITE");
    const IPFS_GATEWAY_READ = yield* Config.string("IPFS_GATEWAY_READ");

    return {
      IPFS_KEY,
      IPFS_GATEWAY_WRITE,
      IPFS_GATEWAY_READ,
    };
  }),
}) {}
