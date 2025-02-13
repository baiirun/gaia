import {Hono} from "hono"
import {Ipfs} from "./src"
import {Duration, Effect, Either, Schedule} from "effect"
import {deploySpace} from "./src/deploy"
import {EnvironmentLive} from "./src/config"

const app = new Hono()

app.get("/", (c) => {
	return c.text("Hello World!")
})

app.get("/health", (c) => {
	return c.json({healthy: true})
})

app.post("/ipfs/upload-edit", Ipfs.uploadEdit)
app.post("/ipfs/upload-file", Ipfs.uploadFile)

app.get("/space/deploy", async (c) => {
	const url = new URL(c.req.url)

	const initialEditorAddress = url.searchParams.get("initialEditorAddress")
	const spaceName = url.searchParams.get("spaceName")

	if (initialEditorAddress === null || spaceName === null) {
		console.error(
			`Missing required parameters to deploy a space ${JSON.stringify({initialEditorAddress, spaceName})}`,
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
				Schedule.whileOutput(Duration.lessThanOrEqualTo(Duration.minutes(3))),
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
					console.error("Invalid server config")
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
					console.error(`Failed to deploy space. message: ${error.message} – cause: ${error.cause}`)

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

export default app
