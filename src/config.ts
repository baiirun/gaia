import { Effect, Config, Layer, Context } from "effect";

export class Environment extends Context.Tag("Environment")<
  Environment,
  {
    IPFS_KEY: string;
    IPFS_GATEWAY_WRITE: string;
    IPFS_GATEWAY_READ: string;
  }
>() {}

export const EnvironmentLive = Layer.effect(
  Environment,
  Effect.gen(function* () {
    const IPFS_KEY = yield* Config.string("IPFS_KEY");
    const IPFS_GATEWAY_WRITE = yield* Config.string("IPFS_GATEWAY_WRITE");
    const IPFS_GATEWAY_READ = yield* Config.string("IPFS_GATEWAY_READ");

    return {
      IPFS_KEY,
      IPFS_GATEWAY_WRITE,
      IPFS_GATEWAY_READ,
    };
  }),
);
