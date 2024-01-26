import { Env } from '../index'; // Assuming you have an Env model defined
import { Score } from './types/scores'; // Assuming you have a Scores model defined


export async function fetchScoresFromKV(env: Env): Promise<Score[]> {
    // Fetch the JSON string from Cloudflare KV storage
    const jsonString = await env.SCORES.get<string>("scores")

    if (!jsonString) {
        return [];
    }
    
    // Parse the JSON string into an array of scores
    return JSON.parse(jsonString);
}

async function updateScoresInKV(env: Env, scores: Score[]) {
    // Convert the array of scores into a JSON string
    const jsonString = JSON.stringify(scores);

    // Save the JSON string to Cloudflare KV storage
    await env.SCORES.put("scores", jsonString);
}

export async function processNewScore(env:Env, name: string, score: number) {

    // Fetch the scores from KV
    const scores = await fetchScoresFromKV(env);

    // Create a new score object
    const newScore: Score = {
        name,
        score,
    }

    // Add the new score to the array of scores
    scores.push(newScore);

    // Sort the scores by score, descending
    scores.sort((a, b) => b.score - a.score);

    // Remove any scores after the 30th
    for (let i = 30; i < scores.length; i++) {
        scores.pop();
    }

    await updateScoresInKV(env, scores);
}