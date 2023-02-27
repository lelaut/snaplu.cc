import { type NextRequest, NextResponse } from "next/server";

export const config = {
  runtime: "edge",
};

export default function handler(req: NextRequest) {
  // TODO: read all cards that have no embedding field
  // TODO: generate the embedding vector
  // TODO: insert the vector into ANN provider
  // TODO: update the embedding vector timestamp in the card entity

  // if (!cron) return new Response("No cron provided", { status: 400 });
  return new NextResponse(JSON.stringify({}), {
    status: 200,
  });
}
