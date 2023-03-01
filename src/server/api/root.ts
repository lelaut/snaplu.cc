import { createTRPCRouter } from "./trpc";
import { exploreRouter } from "./routers/explore";
import { gameRouter } from "./routers/game";
import { meRouter } from "./routers/me";
import { collectionRouter } from "./routers/collection";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here
 */
export const appRouter = createTRPCRouter({
  explore: exploreRouter,
  game: gameRouter,
  me: meRouter,
  collection: collectionRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
