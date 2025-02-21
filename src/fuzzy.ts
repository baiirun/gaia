import {Effect} from "effect"
import {graphql} from "./graphql"
import {Environment} from "./config"

const getSearchQuery = (query: string) => `
  query {
    searchEntitiesFuzzy(searchTerm: "${query}") {
      nodes {
        id
        name
      }
    }
  }
`

type NetworkResult = {
	searchEntitiesFuzzy: {
		nodes: {
			id: string
			name: string
		}[]
	}
}

export function fuzzySearch(query: string) {
	return Effect.gen(function* () {
		const config = yield* Environment

		const result = yield* graphql<NetworkResult>({
			endpoint: config.API_ENDPOINT_TESTNET,
			query: getSearchQuery(query),
		})

		return result.searchEntitiesFuzzy.nodes
	})
}
