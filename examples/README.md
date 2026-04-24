# examples

Copy any of these into your `.snooks/` folder to get started.

| Template                       | Description                                         |
| ------------------------------ | --------------------------------------------------- |
| [component.md](./component.md) | React component with CSS and Storybook story        |
| [package.md](./package.md)     | New monorepo package with `package.json` and readme |
| [page.md](./page.md)           | Next.js page with a route handler                   |

## Setup

1. Copy a template into `.snooks/`
2. Add org config to `package.json` (optional):

```json
{
  "snooks": {
    "orgName": "acme"
  }
}
```

3. Run:

```bash
snooks make
```
