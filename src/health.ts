import { HttpApiEndpoint, HttpApiGroup } from "@effect/platform";
import { Schema } from "effect";

const getHealthCheck = HttpApiEndpoint.get("health", "/health").addSuccess(
  Schema.Struct({
    healthy: Schema.Boolean,
  }),
);

export const healthGroup = HttpApiGroup.make("health").add(getHealthCheck);
