import { S3Client } from "@aws-sdk/client-s3";
import { env } from "../env.mjs";

// TODO: decouple this into a generic interface instead, name `storage`
export const s3 = new S3Client({
  region: env.AWS_DEFAULT_REGION,
  endpoint: "http://localhost.localstack.cloud:4566/",
  // env.NODE_ENV !== "production"
  //   ? "http://s3-website.localhost.localstack.cloud:4566/"
  //   : undefined, // TODO: move this to env.
});
