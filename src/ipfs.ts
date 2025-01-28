import { HttpApiEndpoint, HttpApiGroup, HttpApiSchema } from "@effect/platform";
import { Schema } from "effect";

const uploadBinary = HttpApiEndpoint.post("uploadBinary", "/ipfs/upload-binary")
  .setPayload(
    Schema.Struct({
      file: Schema.Uint8Array,
    }),
  )
  .addSuccess(
    Schema.Struct({
      cid: Schema.String,
    }),
  );

const getParam = HttpApiSchema.param("cid", Schema.String);

const get = HttpApiEndpoint.get("get")`/ipfs/${getParam}`.addSuccess(Schema.Any);

export const ipfsGroup = HttpApiGroup.make("ipfs").add(uploadBinary).add(get);
