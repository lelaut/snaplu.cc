import { z } from "zod";

/**
 * Specify your server-side environment variables schema here.
 * This way you can ensure the app isn't built with invalid env vars.
 */
const server = z.object({
  DATABASE_URL: z.string().url(),
  NODE_ENV: z.enum(["development", "test", "production"]),
  NEXTAUTH_SECRET:
    process.env.NODE_ENV === "production"
      ? z.string().min(1)
      : z.string().min(1).optional(),
  NEXTAUTH_URL: z.preprocess(
    // This makes Vercel deployments not fail if you don't set NEXTAUTH_URL
    // Since NextAuth.js automatically uses the VERCEL_URL if present.
    (str) => process.env.VERCEL_URL ?? str,
    // VERCEL_URL doesn't include `https` so it cant be validated as a URL
    process.env.VERCEL ? z.string().min(1) : z.string().url()
  ),
  // Add `.min(1) on ID and SECRET if you want to make sure they're not empty
  GOOGLE_CLIENT_ID: z.string(),
  GOOGLE_CLIENT_SECRET: z.string(),

  AWS_DEFAULT_REGION: z.string(),
  AWS_ACCESS_KEY_ID: z.string(),
  AWS_S3_BUCKET: z.string(),
  AWS_S3_HOST: z.string(),
  AWS_S3_PORT: z.string(),
  AWS_S3_PROTOCOL: z.string(),
  AWS_S3_PUT_EXP: z.string(),
  AWS_S3_GET_EXP: z.string(),

  STRIPE_API_KEY: z.string(),
  STRIPE_TAX_CODE: z.string(),
  STRIPE_PORT: z.string(),
  STRIPE_HOST: z.string(),

  EMBEDDING_HOST: z.string(),
  EMBEDDING_PORT: z.string(),

  VSEARCH_PROTOCOL: z.string(),
  VSEARCH_HOST: z.string(),
  VSEARCH_HPORT: z.string(),
  VSEARCH_RPORT: z.string(),
  VSEARCH_COLLECTION: z.string(),
});

/**
 * Specify your client-side environment variables schema here.
 * This way you can ensure the app isn't built with invalid env vars.
 * To expose them to the client, prefix them with `NEXT_PUBLIC_`.
 */
const client = z.object({
  // NEXT_PUBLIC_CLIENTVAR: z.string().min(1),
});

/**
 * You can't destruct `process.env` as a regular object in the Next.js
 * edge runtimes (e.g. middlewares) or client-side so we need to destruct manually.
 * @type {Record<keyof z.infer<typeof server> | keyof z.infer<typeof client>, string | undefined>}
 */
const processEnv = {
  DATABASE_URL: process.env.DATABASE_URL,
  NODE_ENV: process.env.NODE_ENV,
  NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
  NEXTAUTH_URL: process.env.NEXTAUTH_URL,
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
  AWS_DEFAULT_REGION: process.env.AWS_DEFAULT_REGION,
  AWS_ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID,
  AWS_S3_BUCKET: process.env.AWS_S3_BUCKET,
  AWS_S3_HOST: process.env.AWS_S3_HOST,
  AWS_S3_PORT: process.env.AWS_S3_PORT,
  AWS_S3_PROTOCOL: process.env.AWS_S3_PROTOCOL,
  AWS_S3_PUT_EXP: process.env.AWS_S3_PUT_EXP,
  AWS_S3_GET_EXP: process.env.AWS_S3_GET_EXP,
  STRIPE_API_KEY: process.env.STRIPE_API_KEY,
  STRIPE_TAX_CODE: process.env.STRIPE_TAX_CODE,
  STRIPE_HOST: process.env.STRIPE_HOST,
  STRIPE_PORT: process.env.STRIPE_PORT,
  EMBEDDING_HOST: process.env.EMBEDDING_HOST,
  EMBEDDING_PORT: process.env.EMBEDDING_PORT,
  VSEARCH_PROTOCOL: process.env.VSEARCH_PROTOCOL,
  VSEARCH_HOST: process.env.VSEARCH_HOST,
  VSEARCH_HPORT: process.env.VSEARCH_HPORT,
  VSEARCH_RPORT: process.env.VSEARCH_RPORT,
  VSEARCH_COLLECTION: process.env.VSEARCH_COLLECTION,
  // NEXT_PUBLIC_CLIENTVAR: process.env.NEXT_PUBLIC_CLIENTVAR,
};

// Don't touch the part below
// --------------------------

const merged = server.merge(client);

/** @typedef {z.input<typeof merged>} MergedInput */
/** @typedef {z.infer<typeof merged>} MergedOutput */
/** @typedef {z.SafeParseReturnType<MergedInput, MergedOutput>} MergedSafeParseReturn */

let env = /** @type {MergedOutput} */ (process.env);

if (!!process.env.SKIP_ENV_VALIDATION == false) {
  const isServer = typeof window === "undefined";

  const parsed = /** @type {MergedSafeParseReturn} */ (
    isServer
      ? merged.safeParse(processEnv) // on server we can validate all env vars
      : client.safeParse(processEnv) // on client we can only validate the ones that are exposed
  );

  if (parsed.success === false) {
    console.error(
      "❌ Invalid environment variables:",
      parsed.error.flatten().fieldErrors
    );
    throw new Error("Invalid environment variables");
  }

  env = new Proxy(parsed.data, {
    get(target, prop) {
      if (typeof prop !== "string") return undefined;
      // Throw a descriptive error if a server-side env var is accessed on the client
      // Otherwise it would just be returning `undefined` and be annoying to debug
      if (!isServer && !prop.startsWith("NEXT_PUBLIC_"))
        throw new Error(
          process.env.NODE_ENV === "production"
            ? "❌ Attempted to access a server-side environment variable on the client"
            : `❌ Attempted to access server-side environment variable '${prop}' on the client`
        );
      return target[/** @type {keyof typeof target} */ (prop)];
    },
  });
}

export { env };
