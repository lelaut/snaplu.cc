import { env } from "../../../env.mjs";

export default async function embedding(imageUrl: string) {
  return (
    await (
      await fetch(
        `http://${env.EMBEDDING_HOST}:${env.EMBEDDING_PORT}/predictions`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ input: { image: imageUrl } }),
        }
      )
    ).json()
  ).output as number[];
}
