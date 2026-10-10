export type MongoConfig = {
  uri: string;
  databaseName: string;
};

export function parseMongoConfig(
  env: Record<string, string | undefined>,
): MongoConfig {
  const uri = env.MONGODB_URI?.trim();
  const databaseName = env.MONGODB_DB?.trim();

  if (!uri) {
    throw new Error("MONGODB_URI wajib diatur untuk mengakses MongoDB.");
  }
  if (!databaseName) {
    throw new Error("MONGODB_DB wajib diatur untuk mengakses MongoDB.");
  }

  let parsedUri: URL;
  try {
    parsedUri = new URL(uri);
  } catch {
    throw new Error("MONGODB_URI bukan connection string MongoDB yang valid.");
  }

  if (
    (parsedUri.protocol !== "mongodb:" &&
      parsedUri.protocol !== "mongodb+srv:") ||
    !parsedUri.hostname
  ) {
    throw new Error("MONGODB_URI harus menggunakan skema mongodb:// atau mongodb+srv://.");
  }

  if (/[\/\\."$*<>:|?]/.test(databaseName) || databaseName.includes("\0")) {
    throw new Error("MONGODB_DB berisi karakter yang tidak valid.");
  }

  return { uri, databaseName };
}
