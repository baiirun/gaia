import { HttpApi, HttpApiBuilder } from "@effect/platform";
import { healthGroup } from "./health";
import { Effect, Layer } from "effect";
import { ipfsGroup } from "./ipfs";
import { Environment } from "./config";

export const Api = HttpApi.make("gaia").add(healthGroup).add(ipfsGroup);

const healthGroupLive = HttpApiBuilder.group(Api, "health", (handlers) => {
  return handlers.handle("health", () => {
    return Effect.succeed({ healthy: true });
  });
});

class IpfsUploadError extends Error {
  readonly _tag = "IpfsUploadError";
}

class IpfsParseResponseError extends Error {
  readonly _tag = "IpfsParseResponseError";
}

function upload(formData: FormData, url: string) {
  return Effect.gen(function* () {
    yield* Effect.logInfo(`Posting IPFS content to url`, url);

    const response = yield* Effect.tryPromise({
      try: () =>
        fetch(url, {
          method: "POST",
          body: formData,
          headers: {
            Authorization: `Bearer ${process.env.IPFS_KEY}`,
          },
        }),
      catch: (error) => new IpfsUploadError(`IPFS upload failed: ${error}`),
    });

    const { Hash } = yield* Effect.tryPromise({
      try: () => response.json(),
      catch: (error) => new IpfsParseResponseError(`Could not parse IPFS JSON response: ${error}`),
    });

    return `ipfs://${Hash}` as const;
  });
}

const ipfsGroupLive = HttpApiBuilder.group(Api, "ipfs", (handlers) => {
  return (
    handlers
      // @ts-expect-error Error mismatch
      .handle("uploadBinary", ({ payload }) => {
        return Effect.gen(function* () {
          const config = yield* Environment;
          const run = Effect.gen(function* () {
            const blob = new Blob([payload.file], { type: "application/octet-stream" });
            const formData = new FormData();
            formData.append("file", blob);

            const hash = yield* upload(formData, config.IPFS_GATEWAY_WRITE);
            yield* Effect.logInfo(`Uploaded binary to IPFS successfully`).pipe(Effect.annotateLogs({ hash }));
            return hash;
          });

          // @TODO: validate hash and retry
          const hash = yield* run;

          return {
            cid: hash,
          };
        });
      })
      .handle("get", ({ path: { cid } }) => {
        return Effect.gen(function* () {
          yield* Effect.logInfo(`cid: ${cid}`);
          return {
            cid,
          };
        });
      })
  );
}).pipe(Layer.provide(Environment.Default));

export const ApiLive = HttpApiBuilder.api(Api).pipe(Layer.provide(healthGroupLive), Layer.provide(ipfsGroupLive));
