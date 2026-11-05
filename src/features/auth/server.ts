import "server-only";
import { betterAuth } from "better-auth";
import { mongodbAdapter } from "@better-auth/mongo-adapter";
import { connectMongo, databaseName } from "@/lib/mongodb/client";

let authPromise: ReturnType<typeof createAuth> | undefined;

async function createAuth() {
  const secret = process.env.BETTER_AUTH_SECRET;
  const baseURL = process.env.BETTER_AUTH_URL;
  if (!secret || secret.length < 32 || !baseURL) {
    throw new Error(
      "Configure BETTER_AUTH_SECRET (32+ characters) and BETTER_AUTH_URL.",
    );
  }
  const client = await connectMongo();

  return betterAuth({
    appName: "Company A",
    secret,
    baseURL,
    database: mongodbAdapter(client.db(databaseName()), {
      client,
      transaction: true,
    }),
    emailAndPassword: {
      enabled: true,
      minPasswordLength: 12,
      maxPasswordLength: 128,
    },
    user: {
      additionalFields: {
        role: {
          type: "string",
          defaultValue: "buyer",
          required: false,
          input: false,
        },
      },
    },
    session: { expiresIn: 60 * 60 * 24 * 7, cookieCache: { enabled: false } },
    rateLimit: {
      enabled: true,
      storage: "database",
      window: 60,
      max: 30,
      customRules: {
        "/sign-in/email": { window: 60, max: 5 },
        "/sign-up/email": { window: 600, max: 3 },
      },
    },
  });
}

export function getAuth() {
  authPromise ??= createAuth().catch((error: unknown) => {
    authPromise = undefined;
    throw error;
  });
  return authPromise;
}
