# snooks

Markdown-based scaffolding that lives in your repo.

Write templates in `.snooks/`. Run `snooks make`. Get files.

```bash
npm i -g @tasteee/snooks
```

---

## First template

Create `.snooks/component.md`:

````md
---
name: component
output: src/components
---

```tsx output="/$$name/index.tsx"
export const $$name = () => {
  return <div>$$name</div>
}
```

```css output="/$$name/index.css"
.$$name {
  display: flex;
}
```
````

Run it:

```bash
snooks make component Button
```

Output:

```
src/components/Button/index.tsx
src/components/Button/index.css
```

That's it.

---

## CLI

```bash
snooks make                                    # pick template interactively
snooks make component                          # pick a name interactively
snooks make component Button                   # template + name
snooks make component Button --at src/ui       # override output path
snooks make component Button color=blue        # pass extra values
```

---

## Templates

A template is a markdown file in `.snooks/`. Any code block with `output="..."` becomes a file.

````md
---
name: component
output: src/components
---

```json output="/package.json"
{ "version": "$$version" }
```
````

### Frontmatter

| Field    | Description                       |
| -------- | --------------------------------- |
| `name`   | Friendly name shown in the picker |
| `output` | Default output directory          |

---

## Variables

### `$$name`

Simple variable injection from arguments. The `name` argument is always set from the second CLI argument.

```bash
snooks make component Button color=blue
# $$name  → Button
# $$color → blue
```

You can also use the explicit form `${args.name}$` for better clarity or when concatenating:

```tsx
type ${args.name}$PropsT = { ... }
```

### `${config.key}$`

Comes from `package.json`:

```json
{
  "snooks": {
    "orgName": "acme"
  }
}
```

```
${config.orgname}$ → acme
```

---

## Examples

See the [`examples/`](./examples) folder for ready-to-use templates.

---

## License

MIT
