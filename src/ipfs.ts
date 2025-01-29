import { HttpApiEndpoint, HttpApiGroup, HttpApiSchema } from "@effect/platform";
import { Schema } from "effect";

const uploadBinary = HttpApiEndpoint.post("uploadEdit", "/ipfs/upload-edit")
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

const uploadFile = HttpApiEndpoint.post("upload", "/ipfs/upload")
  .setPayload(
    Schema.Struct({
      file: Schema.Any,
    }),
  )
  .addSuccess(
    Schema.Struct({
      cid: Schema.String,
    }),
  );

export const ipfsGroup = HttpApiGroup.make("ipfs").add(uploadBinary).add(uploadFile);
