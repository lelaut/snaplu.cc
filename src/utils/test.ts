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
