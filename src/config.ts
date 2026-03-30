import "dotenv/config";

function required(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

export default {
  port: Number(process.env.PORT) || 3000,
  defaultProvider: required("DEFAULT_PROVIDER"),
  serverVersion: required("SERVER_VERSION"),
  googleApiKey: required("GOOGLE_API_KEY"),
} as const;
