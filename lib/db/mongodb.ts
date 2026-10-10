import "server-only";

import { MongoClient, type Collection, type Db } from "mongodb";
import { parseMongoConfig } from "./config";
import { collectionNames, databaseIndexes } from "./indexes";
import type {
  MenuItemDocument,
  OrderDocument,
  SettingsDocument,
  TenantDocument,
  UserDocument,
} from "./models";

type MongoClientCache = {
  uri: string;
  promise: Promise<MongoClient>;
};

const globalForMongo = globalThis as typeof globalThis & {
  __pancongMongoClient?: MongoClientCache;
};

export async function getMongoDatabase(): Promise<Db> {
  const { uri, databaseName } = parseMongoConfig(process.env);
  let cachedClient = globalForMongo.__pancongMongoClient;

  if (!cachedClient || cachedClient.uri !== uri) {
    cachedClient = {
      uri,
      promise: new MongoClient(uri, { appName: "Pancong POS" }).connect(),
    };
    globalForMongo.__pancongMongoClient = cachedClient;
  }

  return (await cachedClient.promise).db(databaseName);
}

// These raw handles do not authenticate users or enforce tenant-scoped access.
export async function getMongoCollections(): Promise<{
  tenants: Collection<TenantDocument>;
  users: Collection<UserDocument>;
  menuItems: Collection<MenuItemDocument>;
  orders: Collection<OrderDocument>;
  settings: Collection<SettingsDocument>;
}> {
  const database = await getMongoDatabase();

  return {
    tenants: database.collection<TenantDocument>("tenants"),
    users: database.collection<UserDocument>("users"),
    menuItems: database.collection<MenuItemDocument>("menuItems"),
    orders: database.collection<OrderDocument>("orders"),
    settings: database.collection<SettingsDocument>("settings"),
  };
}

export async function ensureMongoIndexes(): Promise<void> {
  const database = await getMongoDatabase();

  await Promise.all(
    collectionNames.map((collectionName) =>
      database
        .collection(collectionName)
        .createIndexes(databaseIndexes[collectionName]),
    ),
  );
}
