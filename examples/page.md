---
name: page
output: src/pages
---

# [[ARGS.NAME]] page

A Next.js page with a route handler.

```tsx output="/[[ARGS.NAME]]/page.tsx"
export default function [[ARGS.NAME]]Page() {
  return (
    <main>
      <h1>[[ARGS.NAME]]</h1>
    </main>
  )
}
```

```ts output="/[[ARGS.NAME]]/route.ts"
import { NextResponse } from "next/server";

export const GET = async () => {
  return NextResponse.json({ ok: true });
};
```
