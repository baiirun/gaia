import { HttpApiBuilder, HttpApiSwagger, HttpMiddleware, HttpServer } from "@effect/platform";
import { BunRuntime, BunHttpServer } from "@effect/platform-bun";
import { Layer } from "effect";
import { ApiLive } from "./src/api";

const ServerLive = HttpApiBuilder.serve(HttpMiddleware.logger).pipe(
  // Provide the Swagger layer so clients can access auto-generated docs
  Layer.provide(HttpApiSwagger.layer()),
  Layer.provide(ApiLive),
  HttpServer.withLogAddress,
  Layer.provide(BunHttpServer.layer({ port: 3000 })),
);

Layer.launch(ServerLive).pipe(BunRuntime.runMain);
