import { publicProcedure, router } from './trpc';

export const appRouter = router({
  // Your app's routes here
});

export type AppRouter = typeof appRouter;