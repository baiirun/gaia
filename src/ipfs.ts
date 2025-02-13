import {Effect, Either} from "effect"
import {Environment, EnvironmentLive} from "./config"
import type {BlankEnv, BlankInput} from "hono/types"
import type {Context} from "hono"

export async function uploadEdit(c: Context<BlankEnv, "/ipfs/upload-edit", BlankInput>) {
	const formData = await c.req.formData()
	const file = formData.get("file") as File | undefined

	if (!file) {
		return new Response("No file provided", {status: 400})
	}

	const run = Effect.gen(function* () {
		const config = yield* Environment

		const blob = new Blob([file], {type: "application/octet-stream"})
		const formData = new FormData()
		formData.append("file", blob)

		yield* Effect.logInfo("[IPFS][binary] Uploading content...")
		// @TODO: validate hash and retry
		const hash = yield* upload(formData, config.IPFS_GATEWAY_WRITE)
		yield* Effect.logInfo("[IPFS][binary] Uploaded to IPFS successfully")

		return {
			cid: hash,
		}
	}).pipe(Effect.provide(EnvironmentLive))

	const result = await Effect.runPromise(Effect.either(run))

	if (Either.isLeft(result)) {
		return new Response("Failed to upload file", {status: 500})
	}

	const cid = result.right.cid

	return c.json({cid})
}

export async function uploadFile(c: Context<BlankEnv, "/ipfs/upload-file", BlankInput>) {
	const formData = await c.req.formData()
	const file = formData.get("file") as File | undefined

	if (!file) {
		return new Response("No file provided", {status: 400})
	}

	const run = Effect.gen(function* () {
		const config = yield* Environment

		const formData = new FormData()
		formData.append("file", file)

		yield* Effect.logInfo("[IPFS][upload] Uploading content...")
		// @TODO: validate hash and retry
		const hash = yield* upload(formData, config.IPFS_GATEWAY_WRITE)
		yield* Effect.logInfo("[IPFS][upload] Uploaded to IPFS successfully")

		return {
			cid: hash,
		}
	}).pipe(Effect.provide(EnvironmentLive))

	const result = await Effect.runPromise(Effect.either(run))

	if (Either.isLeft(result)) {
		return new Response("Failed to upload file", {status: 500})
	}

	const cid = result.right.cid

	return c.json({cid})
}

class IpfsUploadError extends Error {
	readonly _tag = "IpfsUploadError"
}

class IpfsParseResponseError extends Error {
	readonly _tag = "IpfsParseResponseError"
}

export function upload(formData: FormData, url: string) {
	return Effect.gen(function* () {
		yield* Effect.logInfo("[IPFS] Posting IPFS content")
		const config = yield* Environment

		const response = yield* Effect.tryPromise({
			try: () =>
				fetch(url, {
					method: "POST",
					body: formData,
					headers: {
						Authorization: `Bearer ${config.IPFS_KEY}`,
					},
				}),
			catch: (error) => new IpfsUploadError(`IPFS upload failed: ${error}`),
		})

		const {Hash} = yield* Effect.tryPromise({
			try: () => response.json(),
			catch: (error) => new IpfsParseResponseError(`Could not parse IPFS JSON response: ${error}`),
		})

		return `ipfs://${Hash}` as const
	})
}
