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

type PointId = string;

interface UploadParams {
  batch: { ids: PointId[]; vectors: number[][]; payloads?: object[] };
}

interface SearchParams {
  vector: number[];
  limit: number;
  offset: number;
}

interface SearchItemResult {
  id: PointId;
  version: number;
  score: number;
  payload: null;
  vector: null;
}

interface VSearchPoint {
  id: PointId;
  payload: any;
  vector: number[];
}

interface VSearchResponse<T> {
  time: number;
  status: string;
  result: T;
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
    if (
      params.batch.ids.length !== params.batch.vectors.length ||
      (typeof params.batch.payloads !== "undefined" &&
        params.batch.payloads.length !== params.batch.vectors.length)
    ) {
      throw new Error("Invalid upload params length");
    }
    if (params.batch.ids.length === 0) {
      return true;
    }

    const point = await this.send(
      "PUT",
      `collections/${env.VSEARCH_COLLECTION}/points?wait=true&ordering=weak`,
      JSON.stringify(params)
    );

    if (
      !point.ok &&
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      ((await point.json()).status.error as string).startsWith(
        "Not found: Collection"
      )
    ) {
      const collection = await this.send(
        "PUT",
        `collections/${env.VSEARCH_COLLECTION}`,
        CollectionSchema
      );

      if (!collection.ok) return false;

      const retry = await this.send(
        "PUT",
        `collections/${env.VSEARCH_COLLECTION}/points`,
        JSON.stringify(params)
      );

      return retry.ok;
    }

    return point.ok;
  }

  async search(params: SearchParams) {
    const response = await this.send(
      "POST",
      `collections/${env.VSEARCH_COLLECTION}/points/search`,
      JSON.stringify(params)
    );

    return (await response.json()) as VSearchResponse<SearchItemResult[]>;
  }

  async retrieve(id: string) {
    const response = await this.send(
      "GET",
      `collections/${env.VSEARCH_COLLECTION}/points/${id}`
    );

    return (await response.json()) as VSearchResponse<VSearchPoint>;
  }
}

const vsearch = new VSearchSystem();

export default vsearch;
