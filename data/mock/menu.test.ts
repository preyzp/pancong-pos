import { describe, expect, it } from "vitest";
import { MOCK_ADDONS, MOCK_MENU } from "./menu";

describe("seed menu dan Add-on", () => {
  it("menyediakan nama dan harga seluruh menu starter", () => {
    expect(MOCK_MENU).toHaveLength(19);
    expect(MOCK_MENU.filter((item) => item.category === "pancong")).toHaveLength(
      9,
    );
    expect(
      MOCK_MENU.filter((item) => item.category === "ketan_susu"),
    ).toHaveLength(10);
    expect(new Set(MOCK_MENU.map((item) => item.id)).size).toBe(19);
    expect(
      MOCK_MENU.map(({ name, price }) => [name, price]),
    ).toEqual([
      ["Pancong Original", 9000],
      ["Pancong Cokelat", 10000],
      ["Pancong Keju", 11000],
      ["Pancong Cokelat Keju", 12000],
      ["Pancong Oreo", 12000],
      ["Pancong Green Tea", 13000],
      ["Pancong Tiramisu", 13000],
      ["Pancong Hazelnut", 13000],
      ["Pancong Hazelnut Keju", 15000],
      ["Ketan Susu Original", 9000],
      ["Ketan Susu Cokelat", 10000],
      ["Ketan Susu Keju", 11000],
      ["Ketan Susu Cokelat Keju", 12000],
      ["Ketan Susu Kacang", 11000],
      ["Ketan Susu Oreo", 13000],
      ["Ketan Susu Duren", 15000],
      ["Ketan Susu Duren Keju", 17000],
      ["Ketan Susu Duren Oreo", 16000],
      ["Ketan Susu Duren Keju Oreo", 19000],
    ]);
    expect(MOCK_MENU.every((item) => item.addonIds === undefined)).toBe(true);
  });

  it("menyediakan nama dan harga seluruh Add-on starter dengan ID unik", () => {
    expect(MOCK_ADDONS).toHaveLength(11);
    expect(new Set(MOCK_ADDONS.map((addon) => addon.id)).size).toBe(11);
    expect(MOCK_ADDONS.every((addon) => addon.active)).toBe(true);
    expect(MOCK_ADDONS.map((addon) => addon.sortOrder)).toEqual([
      0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10,
    ]);
    expect(
      MOCK_ADDONS.map(({ name, price }) => [name, price]),
    ).toEqual([
      ["Cokelat", 3000],
      ["Keju", 3000],
      ["Oreo", 3000],
      ["Meses", 2000],
      ["Kacang", 2000],
      ["Milo", 3000],
      ["Green Tea", 3000],
      ["Tiramisu", 3000],
      ["Hazelnut", 3000],
      ["Susu", 2000],
      ["Duren", 5000],
    ]);
  });
});
