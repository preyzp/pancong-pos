import type { MenuItem, Topping } from "../../types/pos";

export const MOCK_MENU: MenuItem[] = [
  {
    id: "pancong-original",
    name: "Pancong Original",
    category: "pancong",
    price: 8000,
    hasToppings: true,
  },
  {
    id: "pancong-coklat",
    name: "Pancong Coklat",
    category: "pancong",
    price: 8000,
    hasToppings: true,
  },
  {
    id: "pancong-strawberry",
    name: "Pancong Strawberry",
    category: "pancong",
    price: 8000,
    hasToppings: true,
  },
  {
    id: "pancong-keju",
    name: "Pancong Keju",
    category: "pancong",
    price: 9000,
    hasToppings: true,
  },
  {
    id: "ketan-susu-original",
    name: "Ketan Susu Original",
    category: "ketan_susu",
    price: 6000,
    hasToppings: true,
  },
  {
    id: "ketan-susu-keju",
    name: "Ketan Susu Keju",
    category: "ketan_susu",
    price: 7000,
    hasToppings: true,
  },
  {
    id: "ketan-susu-coklat",
    name: "Ketan Susu Coklat",
    category: "ketan_susu",
    price: 7000,
    hasToppings: true,
  },
];

export const MOCK_TOPPINGS: Topping[] = [
  { id: "extra-keju", name: "Extra Keju", price: 3000 },
  { id: "susu-kental-manis", name: "Susu Kental Manis", price: 2000 },
  { id: "kacang", name: "Kacang", price: 2000 },
  { id: "meises", name: "Meises", price: 2000 },
];
