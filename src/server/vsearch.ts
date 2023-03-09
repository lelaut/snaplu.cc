// TODO: do this using gRPC instead
// - https://qdrant.tech/documentation/quick_start/#grpc
// - https://grpc.io/docs/languages/node/basics/

import { env } from "../env.mjs";

const CollectionSchema = JSON.stringify({
  name: env.VSEARCH_COLLECTION,
  vectors: {
    size: 512,
    distance: "Cosine",
  },
});

interface UploadParams {
  batch: { ids: number[]; vectors: number[][]; payloads?: object[] };
}

interface SearchParams {
  vector: number[];
  limit: number;
  offset: number;
}

interface SearchResult {
  time: number;
  status: string;
  result: number[];
}

class VSearchSystem {
  // TODO: this will need to change to support gRPC
  private async send(method: string, action: string, body?: string) {
    return await fetch(
      `${env.VSEARCH_PROTOCOL}://${env.VSEARCH_HOST}:${env.VSEARCH_HPORT}/${action}`,
      typeof body !== "undefined"
        ? {
            method,
            headers: {
              "Content-Type": "application/json",
            },
            body,
          }
        : { method }
    );
  }

  async upload(params: UploadParams) {
    const response = await this.send(
      "PUT",
      `collections/${env.VSEARCH_COLLECTION}/points?wait=true&ordering=weak`,
      JSON.stringify(params)
    );

    if (
      !response.ok &&
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      ((await response.json()).status.error as string).startsWith(
        "Not found: Collection"
      )
    ) {
      await this.send(
        "PUT",
        `collection/${env.VSEARCH_COLLECTION}`,
        CollectionSchema
      );

      return (
        await this.send(
          "PUT",
          `collections/${env.VSEARCH_COLLECTION}/points`,
          JSON.stringify(params)
        )
      ).ok;
    }

    return response.ok;
  }

  async search(params: SearchParams) {
    const response = await this.send(
      "POST",
      `collections/${env.VSEARCH_COLLECTION}/points/search`,
      JSON.stringify(params)
    );

    return (await response.json()) as SearchResult;
  }
}

const vsearch = new VSearchSystem();

export default vsearch;
