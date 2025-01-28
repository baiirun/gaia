import { HttpApiEndpoint, HttpApiGroup } from "@effect/platform";
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

export const ipfsGroup = HttpApiGroup.make("ipfs").add(uploadBinary);
