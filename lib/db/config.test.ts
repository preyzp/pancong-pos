import { describe, expect, it } from "vitest";
import { parseMongoConfig } from "./config";

describe("konfigurasi MongoDB", () => {
  it("membaca URI dan nama database", () => {
    expect(
      parseMongoConfig({
        MONGODB_URI: "mongodb://127.0.0.1:27017",
        MONGODB_DB: "pancong_pos",
      }),
    ).toEqual({
      uri: "mongodb://127.0.0.1:27017",
      databaseName: "pancong_pos",
    });
  });

  it("menerima connection string mongodb+srv", () => {
    expect(
      parseMongoConfig({
        MONGODB_URI: "mongodb+srv://cluster.example.mongodb.net",
        MONGODB_DB: "pancong_pos",
      }).databaseName,
    ).toBe("pancong_pos");
  });

  it.each([
    [{ MONGODB_DB: "pancong_pos" }, "MONGODB_URI"],
    [
      { MONGODB_URI: "mongodb://127.0.0.1:27017" },
      "MONGODB_DB",
    ],
    [
      { MONGODB_URI: "https://example.test", MONGODB_DB: "pancong_pos" },
      "skema mongodb://",
    ],
    [
      { MONGODB_URI: "mongodb://localhost", MONGODB_DB: "invalid/name" },
      "karakter yang tidak valid",
    ],
  ])("menolak konfigurasi tidak valid %#", (env, message) => {
    expect(() => parseMongoConfig(env)).toThrow(message);
  });
});
