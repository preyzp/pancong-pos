import type { Order } from "../../types/pos";

const jakartaDateFormatter = new Intl.DateTimeFormat("en-CA", {
  day: "2-digit",
  month: "2-digit",
  timeZone: "Asia/Jakarta",
  year: "numeric",
});

function jakartaDateKey(date: Date): string {
  const parts = jakartaDateFormatter.formatToParts(date);
  const year = parts.find((part) => part.type === "year")?.value;
  const month = parts.find((part) => part.type === "month")?.value;
  const day = parts.find((part) => part.type === "day")?.value;

  if (!year || !month || !day) {
    throw new Error("Tidak dapat menentukan tanggal Asia/Jakarta.");
  }

  return `${year}-${month}-${day}`;
}

function timestampForJakartaTime(date: Date, time: string): string {
  return new Date(`${jakartaDateKey(date)}T${time}:00+07:00`).toISOString();
}

export function createMockOrders(asOf: Date): Order[] {
  return [
    {
      id: "#012",
      customerName: "Andi",
      items: [
        {
          menuId: "pancong-coklat",
          name: "Pancong Coklat",
          category: "pancong",
          unitPrice: 8000,
          qty: 2,
          addons: [],
        },
        {
          menuId: "ketan-susu-original",
          name: "Ketan Susu Original",
          category: "ketan_susu",
          unitPrice: 6000,
          qty: 1,
          addons: [],
        },
      ],
      subtotal: 22000,
      total: 22000,
      status: "belum_bayar",
      cashier: "Budi",
      createdAt: timestampForJakartaTime(asOf, "09:24"),
    },
    {
      id: "#011",
      customerName: "Siti",
      items: [
        {
          menuId: "pancong-original",
          name: "Pancong Original",
          category: "pancong",
          unitPrice: 8000,
          qty: 2,
          addons: [],
        },
      ],
      subtotal: 16000,
      total: 16000,
      status: "lunas",
      cashier: "Budi",
      createdAt: timestampForJakartaTime(asOf, "09:10"),
    },
    {
      id: "#010",
      customerName: "Rina",
      items: [
        {
          menuId: "ketan-susu-original",
          name: "Ketan Susu Original",
          category: "ketan_susu",
          unitPrice: 6000,
          qty: 4,
          addons: [],
        },
      ],
      subtotal: 24000,
      total: 24000,
      status: "lunas",
      cashier: "Budi",
      createdAt: timestampForJakartaTime(asOf, "08:56"),
    },
    {
      id: "#009",
      customerName: "Dewi",
      items: [
        {
          menuId: "pancong-original",
          name: "Pancong Original",
          category: "pancong",
          unitPrice: 8000,
          qty: 2,
          addons: [],
        },
        {
          menuId: "ketan-susu-original",
          name: "Ketan Susu Original",
          category: "ketan_susu",
          unitPrice: 6000,
          qty: 2,
          addons: [],
        },
      ],
      subtotal: 28000,
      total: 28000,
      status: "lunas",
      cashier: "Budi",
      createdAt: timestampForJakartaTime(asOf, "08:42"),
    },
    {
      id: "#008",
      customerName: "Joko",
      items: [
        {
          menuId: "pancong-original",
          name: "Pancong Original",
          category: "pancong",
          unitPrice: 8000,
          qty: 2,
          addons: [],
        },
      ],
      subtotal: 16000,
      total: 16000,
      status: "dibatalkan",
      cashier: "Budi",
      createdAt: timestampForJakartaTime(asOf, "08:30"),
    },
  ];
}
