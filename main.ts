import {Hono} from "hono"
import {Ipfs} from "./src"
import {Duration, Effect, Either, Schedule} from "effect"
import {deploySpace} from "./src/deploy"
import {EnvironmentLive} from "./src/config"
import {getPublishEditCalldata} from "./src/calldata"
import { cors } from 'hono/cors'

const app = new Hono()

app.use("*", cors())

app.get("/health", (c) => {
	return c.json({healthy: true})
})

app.post("/ipfs/upload-edit", Ipfs.uploadEdit)
app.post("/ipfs/upload-file", Ipfs.uploadFile)

app.post("/deploy", async (c) => {
	const {initialEditorAddress, spaceName} = await c.req.json()

	if (initialEditorAddress === null || spaceName === null) {
		console.error(
			`[SPACE][deploy] Missing required parameters to deploy a space ${JSON.stringify({initialEditorAddress, spaceName})}`,
		)

		return new Response(
			JSON.stringify({
				error: "Missing required parameters",
				reason: "An initial editor account and space name are required to deploy a space.",
			}),
			{
				status: 400,
			},
		)
	}

	const deployWithRetry = Effect.retry(
		deploySpace({
			initialEditorAddress,
			spaceName,
		}).pipe(Effect.provide(EnvironmentLive)),
		{
			schedule: Schedule.exponential(Duration.millis(100)).pipe(
				Schedule.jittered,
				Schedule.compose(Schedule.elapsed),
				Schedule.whileOutput(Duration.lessThanOrEqualTo(Duration.minutes(1))),
			),
			while: (error) => error._tag !== "WaitForSpaceToBeIndexedError",
		},
	)

	const result = await Effect.runPromise(
		Effect.either(deployWithRetry).pipe(Effect.annotateLogs({editor: initialEditorAddress, spaceName})),
	)

	return Either.match(result, {
		onLeft: (error) => {
			switch (error._tag) {
				case "ConfigError":
					console.error("[SPACE][deploy] Invalid server config")
					return new Response(
						JSON.stringify({
							message: "Invalid server config. Please notify the server administrator.",
							reason: "Invalid server config. Please notify the server administrator.",
						}),
						{
							status: 500,
						},
					)
				default:
					console.error(
						`[SPACE][deploy] Failed to deploy space. message: ${error.message} – cause: ${error.cause}`,
					)

					return new Response(
						JSON.stringify({
							message: `Failed to deploy space. message: ${error.message} – cause: ${error.cause}`,
							reason: error.message,
						}),
						{
							status: 500,
						},
					)
			}
		},
		onRight: (spaceId) => {
			return Response.json({spaceId})
		},
	})
})

app.post("/space/:spaceId/edit/calldata", async (c) => {
	const {spaceId} = c.req.param()
	let {cid, network} = await c.req.json()

	if (!cid || !cid.startsWith("ipfs://")) {
		console.error(`[SPACE][calldata] Invalid CID ${cid}`)
		return new Response(
			JSON.stringify({
				error: "Missing required parameters",
				reason: "An IPFS CID prefixed with 'ipfs://' is required. e.g., ipfs://bafkreigkka6xfe3hb2tzcfqgm5clszs7oy7mct2awawivoxddcq6v3g5oi",
			}),
			{
				status: 400,
			},
		)
	}

	if (!network) {
		network = "MAINNET"
	}

	if (network !== "TESTNET" && network !== "MAINNET") {
		console.error(`[SPACE][calldata] Invalid network ${network}`)
		return new Response(
			JSON.stringify({
				error: "Invalid network",
				reason: "Invalid network. Please use 'TESTNET' or 'MAINNET'.",
			}),
			{
				status: 400,
			},
		)
	}

	const getCalldata = Effect.gen(function* () {
		return yield* getPublishEditCalldata(spaceId, cid as string, network)
	})

	const calldata = await Effect.runPromise(Effect.either(getCalldata.pipe(Effect.provide(EnvironmentLive))))

	if (Either.isLeft(calldata)) {
		const error = calldata.left

		switch (error._tag) {
			case "ConfigError":
				console.error("[SPACE][calldata] Invalid server config")
				return new Response(
					JSON.stringify({
						message: "Invalid server config. Please notify the server administrator.",
						reason: "Invalid server config. Please notify the server administrator.",
					}),
					{
						status: 500,
					},
				)

			default:
				console.error(
					`[SPACE][calldata] Failed to generate calldata for edit. message: ${error.message} – cause: ${error.cause}`,
				)

				return new Response(
					JSON.stringify({
						message: `Failed to deploy space. message: ${error.message} – cause: ${error.cause}`,
						reason: error.message,
					}),
					{
						status: 500,
					},
				)
		}
	}

	if (calldata.right === null) {
		return new Response(
			JSON.stringify({
				error: "Failed to generate calldata",
				reason: `Could not find space with id ${spaceId}. Make sure it exists on the network ${network}.`,
			}),
			{
				status: 500,
			},
		)
	}

	return Response.json(calldata.right)
})

// Exporting default the hono instance is the standard way of starting the server.
export default app
