---
name: package
output: packages
---

# $$name

A new package.

```json output="/$$name/package.json"
{
  "name": "@${config.orgname}$/$$name",
  "version": "0.0.1",
  "description": "$$description",
  "type": "module",
  "main": "./src/index.ts",
  "exports": {
    ".": "./src/index.ts"
  }
}
```

```ts output="/$$name/src/index.ts"
export const $$name = () => {
  return null
}
```

```md output="/$$name/README.md"
# @${config.orgname}$/$$name

$$description
```
