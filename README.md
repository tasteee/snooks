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

```tsx output="/[[ARGS.NAME]]/index.tsx"
export const [[ARGS.NAME]] = () => {
  return <div>[[ARGS.NAME]]</div>
}
```

```css output="/[[ARGS.NAME]]/index.css"
.[[ARGS.NAME]] {
  display: flex;
}
```
````

Run it:

```bash
snooks make Button component
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
snooks make Button component                   # name + template
snooks make Button component --at src/ui       # override output path
snooks make Button component color=blue        # pass extra values
```

---

## Templates

A template is a markdown file in `.snooks/`. Any code block with `output="..."` becomes a file.

````md
---
name: component
output: src/components
options:
  version:
    prompt: "What version?"
    default: 0.0.1
---

```json output="/package.json"
{ "version": "[[ARGS.VERSION]]" }
```
````

### Frontmatter

| Field     | Description                              |
| --------- | ---------------------------------------- |
| `name`    | Friendly name shown in the picker        |
| `output`  | Default output directory                 |
| `options` | Extra values to prompt for if not passed |

---

## Variables

### `[[ARGS.NAME]]`

Comes from the CLI or a prompt. `NAME` is always set from the first argument.

```bash
snooks make Button component color=blue
# [[ARGS.NAME]]  → Button
# [[ARGS.COLOR]] → blue
```

### `[[CONFIG.KEY]]`

Comes from `package.json`:

```json
{
  "snooks": {
    "orgName": "acme"
  }
}
```

```
[[CONFIG.ORG_NAME]] → acme
```

---

## Examples

See the [`examples/`](./examples) folder for ready-to-use templates.

---

## License

MIT
