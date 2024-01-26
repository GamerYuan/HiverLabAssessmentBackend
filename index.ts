import { Router } from 'itty-router';
import { processNewScore, fetchScoresFromKV } from './src/triggers';

// Create a new router
const router = Router();

export default {
	async fetch(request: Request, env: Env, ctx: ExecutionContext) {
		
		// Handle a new score request
		router.post('/newscore', async({query}) => {

			const name = query?.name;
			const score = query?.score;
		
			// Check if the name or score is missing
			if (!name || !score) {
				return new Response("Invalid request, missing name or score", {status: 400});
			}
		
			// Check if the score is a number
			if (isNaN(Number(score))) {
				return new Response("Invalid request, score must be a number", {status: 400});
			}
		
			// Process the new score
			await processNewScore(env, name, Number(score));
		
			return new Response("New score added");
		});
		
		// Return the high scores
		router.get('/highscores', async() => {
			const scores = await fetchScoresFromKV(env);
		
			return Response.json(scores);
		});

		// Return 404 for all other requests
		router.all('*', () => new Response('404, not found!', { status: 404 }));

		return router.handle(request).catch(err => new Response(err.stack, { status: 500 }));
	}
};

export interface Env {
	// Example binding to KV. Learn more at https://developers.cloudflare.com/workers/runtime-apis/kv/
	// MY_KV_NAMESPACE: KVNamespace;
	//
	// Example binding to Durable Object. Learn more at https://developers.cloudflare.com/workers/runtime-apis/durable-objects/
	// MY_DURABLE_OBJECT: DurableObjectNamespace;
	//
	// Example binding to R2. Learn more at https://developers.cloudflare.com/workers/runtime-apis/r2/
	// MY_BUCKET: R2Bucket;
	//
	// Example binding to a Service. Learn more at https://developers.cloudflare.com/workers/runtime-apis/service-bindings/
	// MY_SERVICE: Fetcher;
	//
	// Example binding to a Queue. Learn more at https://developers.cloudflare.com/queues/javascript-apis/
	// MY_QUEUE: Queue;
	//
	// Example binding to a D1 Database. Learn more at https://developers.cloudflare.com/workers/platform/bindings/#d1-database-bindings
	// DB: D1Database
	SCORES: KVNamespace;
}