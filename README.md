This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## MongoDB configuration

The server-only MongoDB foundation reads these environment variables when a database connection is
requested:

- `MONGODB_URI` — MongoDB connection string.
- `MONGODB_DB` — database name.

For a local MongoDB instance, copy `.env.example` to `.env.local` and adjust the values if needed.
`.env.local` is ignored by Git. The example uses a loopback URI and contains no credentials. Keep
production connection strings in the deployment platform's server-side secret settings; never use
`NEXT_PUBLIC_*` for database secrets.

MongoDB is not yet connected to application pages or order/menu/settings operations. The current UI
can still be run without MongoDB environment variables; accessing the database module requires both
values. This foundation alone does not implement login, data migration, or tenant isolation for the
existing local-storage-backed application.

Index definitions for the five foundation collections are in `lib/db/indexes.ts`. A server-side
`ensureMongoIndexes()` helper is available for a future controlled setup step; it is not run
automatically by the current UI and does not create a tenant, user, or order.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
