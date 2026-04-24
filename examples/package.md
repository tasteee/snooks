---
name: package
output: packages
options:
  description:
    prompt: "Package description?"
    default: ""
---

# [[ARGS.NAME]]

A new package.

```json output="/[[ARGS.NAME]]/package.json"
{
  "name": "@[[CONFIG.ORG_NAME]]/[[ARGS.NAME]]",
  "version": "0.0.1",
  "description": "[[ARGS.DESCRIPTION]]",
  "type": "module",
  "main": "./src/index.ts",
  "exports": {
    ".": "./src/index.ts"
  }
}
```

```ts output="/[[ARGS.NAME]]/src/index.ts"
export const [[ARGS.NAME]] = () => {
  return null
}
```

```md output="/[[ARGS.NAME]]/README.md"
# @[[CONFIG.ORG_NAME]]/[[ARGS.NAME]]

[[ARGS.DESCRIPTION]]
```
