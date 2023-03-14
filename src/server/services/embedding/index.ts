import { env } from "../../../env.mjs";

interface EmbeddingResponse {
  input: {
    image: string;
  };
  output: number[];
  id: null;
  created_at: null;
  started_at: Date;
  completed_at: Date;
  logs: string;
  error: string | null;
  status: "succeeded";
  webhook: null;
  webhook_events_filter: string[];
  output_file_prefix: null;
}

// TODO: ensure that the server is not busy before calling it
// use `/health-check` endpoint
// https://github.com/replicate/cog/blob/75b7802219e7cd4cee845e34c4c22139558615d4/python/cog/server/http.py#L97
export default async function embedding(imageUrl: string) {
  const response = await fetch(
    `http://${env.EMBEDDING_HOST}:${env.EMBEDDING_PORT}/predictions`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        input: {
          image: imageUrl,
        },
      }),
    }
  );

  if (response.ok) {
    const data = (await response.json()) as EmbeddingResponse;
    return data.output;
  }

  throw new Error("Unable to make the embedding");
}
