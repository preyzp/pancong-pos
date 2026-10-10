import type { Addon, MenuCategory, MenuItem } from "../../types/pos";

export const DEFAULT_MENU_CATEGORIES: MenuCategory[] = [
  { id: "pancong", name: "Pancong" },
  { id: "ketan_susu", name: "Ketan Susu" },
];

export const MOCK_MENU: MenuItem[] = [
  {
    id: "pancong-original",
    name: "Pancong Original",
    category: "pancong",
    price: 9000,
  },
  {
    id: "pancong-coklat",
    name: "Pancong Cokelat",
    category: "pancong",
    price: 10000,
  },
  {
    id: "pancong-keju",
    name: "Pancong Keju",
    category: "pancong",
    price: 11000,
  },
  {
    id: "pancong-coklat-keju",
    name: "Pancong Cokelat Keju",
    category: "pancong",
    price: 12000,
  },
  {
    id: "pancong-oreo",
    name: "Pancong Oreo",
    category: "pancong",
    price: 12000,
  },
  {
    id: "pancong-green-tea",
    name: "Pancong Green Tea",
    category: "pancong",
    price: 13000,
  },
  {
    id: "pancong-tiramisu",
    name: "Pancong Tiramisu",
    category: "pancong",
    price: 13000,
  },
  {
    id: "pancong-hazelnut",
    name: "Pancong Hazelnut",
    category: "pancong",
    price: 13000,
  },
  {
    id: "pancong-hazelnut-keju",
    name: "Pancong Hazelnut Keju",
    category: "pancong",
    price: 15000,
  },
  {
    id: "ketan-susu-original",
    name: "Ketan Susu Original",
    category: "ketan_susu",
    price: 9000,
  },
  {
    id: "ketan-susu-cokelat",
    name: "Ketan Susu Cokelat",
    category: "ketan_susu",
    price: 10000,
  },
  {
    id: "ketan-susu-keju",
    name: "Ketan Susu Keju",
    category: "ketan_susu",
    price: 11000,
  },
  {
    id: "ketan-susu-cokelat-keju",
    name: "Ketan Susu Cokelat Keju",
    category: "ketan_susu",
    price: 12000,
  },
  {
    id: "ketan-susu-kacang",
    name: "Ketan Susu Kacang",
    category: "ketan_susu",
    price: 11000,
  },
  {
    id: "ketan-susu-oreo",
    name: "Ketan Susu Oreo",
    category: "ketan_susu",
    price: 13000,
  },
  {
    id: "ketan-susu-duren",
    name: "Ketan Susu Duren",
    category: "ketan_susu",
    price: 15000,
  },
  {
    id: "ketan-susu-duren-keju",
    name: "Ketan Susu Duren Keju",
    category: "ketan_susu",
    price: 17000,
  },
  {
    id: "ketan-susu-duren-oreo",
    name: "Ketan Susu Duren Oreo",
    category: "ketan_susu",
    price: 16000,
  },
  {
    id: "ketan-susu-duren-keju-oreo",
    name: "Ketan Susu Duren Keju Oreo",
    category: "ketan_susu",
    price: 19000,
  },
];

export const MOCK_ADDONS: Addon[] = [
  { id: "cokelat", name: "Cokelat", price: 3000, active: true, sortOrder: 0 },
  { id: "keju", name: "Keju", price: 3000, active: true, sortOrder: 1 },
  { id: "oreo", name: "Oreo", price: 3000, active: true, sortOrder: 2 },
  { id: "meses", name: "Meses", price: 2000, active: true, sortOrder: 3 },
  { id: "kacang", name: "Kacang", price: 2000, active: true, sortOrder: 4 },
  { id: "milo", name: "Milo", price: 3000, active: true, sortOrder: 5 },
  { id: "green-tea", name: "Green Tea", price: 3000, active: true, sortOrder: 6 },
  { id: "tiramisu", name: "Tiramisu", price: 3000, active: true, sortOrder: 7 },
  { id: "hazelnut", name: "Hazelnut", price: 3000, active: true, sortOrder: 8 },
  { id: "susu", name: "Susu", price: 2000, active: true, sortOrder: 9 },
  { id: "duren", name: "Duren", price: 5000, active: true, sortOrder: 10 },
];
