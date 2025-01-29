import { HttpApiBuilder, HttpApiSwagger, HttpMiddleware, HttpServer } from "@effect/platform";
import { BunRuntime, BunHttpServer } from "@effect/platform-bun";
import { ConfigError, Layer } from "effect";
import { ApiLive } from "./src/api";
import { EnvironmentLive } from "./src/config";

const ServerLive = HttpApiBuilder.serve(HttpMiddleware.logger).pipe(
  // Provide the Swagger layer so clients can access auto-generated docs
  Layer.provide(HttpApiSwagger.layer()),
  Layer.provide(ApiLive),
  HttpServer.withLogAddress,
  Layer.provide(BunHttpServer.layer({ port: 3000 })),
  Layer.provide(EnvironmentLive),
);

BunRuntime.runMain(Layer.launch(ServerLive as Layer.Layer<never, ConfigError.ConfigError, never>));
