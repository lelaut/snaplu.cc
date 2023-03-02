import { User } from "@prisma/client";
import { appRouter } from "../server/api/root";
import {
  createInnerTRPCContext,
  type CreateContextOptions,
} from "../server/api/trpc";

export function createTestRouter(user?: User) {
  return appRouter.createCaller(
    createInnerTRPCContext({
      session: { user },
    } as unknown as CreateContextOptions)
  );
}

export function getSignedUrlPattern(key: string, action: "PutObject") {
  return new RegExp(
    `http:\/\/swaplucc-dev\\.localhost\\.localstack\\.cloud:4566\/${key}\\?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Credential=test%2F20230302%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Date=[^Z]+Z&X-Amz-Expires=86400&X-Amz-Signature=[^&]+&X-Amz-SignedHeaders=host&x-id=${action}`
  );
}
