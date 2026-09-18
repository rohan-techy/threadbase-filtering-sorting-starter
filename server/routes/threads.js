```js
import { Router } from "express";
import prisma from "../prisma/client.js";

const router = Router();

// GET /api/threads?search=<term>&sort=<newest|oldest>
router.get("/", async (req, res, next) => {
  try {
    const { search, sort } = req.query;

    // Build the Prisma where condition
    const where = search
      ? {
          title: {
            contains: search,
            mode: "insensitive",
          },
        }
      : {};

    // Build the Prisma orderBy condition
    const orderBy =
      sort === "oldest"
        ? { createdAt: "asc" }
        : { createdAt: "desc" };

    // Let the database handle filtering and sorting
    const threads = await prisma.thread.findMany({
      where,
      orderBy,
      include: {
        author: { select: { name: true, avatarUrl: true } },
        _count: { select: { comments: true } },
      },
    });

    res.json({ threads });
  } catch (error) {
    next(error);
  }
});

export default router;
```

### What changed?

You **removed** this:

```js
threads = threads.filter(...)
```

and replaced it with:

```js
const where = search
  ? {
      title: {
        contains: search,
        mode: "insensitive",
      },
    }
  : {};
```

You also **removed** JavaScript `.sort()` and replaced it with:

```js
const orderBy =
  sort === "oldest"
    ? { createdAt: "asc" }
    : { createdAt: "desc" };
```

Then both are given directly to Prisma:

```js
const threads = await prisma.thread.findMany({
  where,
  orderBy,
  include: {
    author: { select: { name: true, avatarUrl: true } },
    _count: { select: { comments: true } },
});
```

This is exactly what the assignment requires: build `where` from `req.query.search`, use case-insensitive `contains`, map `sort` to `orderBy`, and remove `.filter()`/`.sort()` from the handler.

### Now run the assignment

Start the project:

```bash
npm run dev
```

Search for something like:

```text
react
```

Check the browser **Network** tab. You should see:

```text
/api/threads?search=react&sort=newest
```

Then look at the **server terminal**. Because Prisma query logging is already enabled, you should see a query containing:

```text
WHERE ... ILIKE '%react%'
ORDER BY ... createdAt ... DESC
```

That terminal output is the screenshot you need for the PR submission.

**Do not modify any other file**—the assignment specifically says to edit only `server/routes/threads.js`.
