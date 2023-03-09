import { env } from "../env.mjs";
import { appRouter } from "../server/api/root";
import {
  createInnerTRPCContext,
  type CreateContextOptions,
} from "../server/api/trpc";

export function createTestRouter(user?: { id: string; name: string }) {
  return appRouter.createCaller(
    createInnerTRPCContext({
      session: user ? { user } : null,
    } as unknown as CreateContextOptions)
  );
}

export function getSignedUrlPattern(
  key: string,
  action: "PutObject" | "GetObject"
) {
  return new RegExp(
    `${env.AWS_S3_PROTOCOL}:\/\/${
      env.AWS_S3_BUCKET
    }${env.AWS_S3_HOST.replaceAll(".", "\\.")}:${
      env.AWS_S3_PORT
    }\/${key}\\?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Credential=${
      env.AWS_ACCESS_KEY_ID
    }%2[^%]+%2F${
      env.AWS_DEFAULT_REGION
    }%2Fs3%2Faws4_request&X-Amz-Date=[^Z]+Z&X-Amz-Expires=${
      action === "PutObject" ? env.AWS_S3_PUT_EXP : env.AWS_S3_GET_EXP
    }&X-Amz-Signature=[^&]+&X-Amz-SignedHeaders=host&x-id=${action}`
  );
}
