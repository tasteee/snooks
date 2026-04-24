# Snooks V1 Design

**Status:** Proposed

**Goal:** Define the first public API for `snooks` as an npm package that scaffolds files and directories from markdown templates.

## Product Summary

`snooks` is a local scaffolding tool.

Users install it as a dev dependency, create a `.snooks` directory in their project, add one or more markdown template files, and run `snooks make` to scaffold a new directory tree from those templates.

Version 1 is intentionally small:

- Templates are loaded only from the nearest `.snooks` directory found by walking upward from the current working directory.
- Template metadata is declared in YAML frontmatter.
- Generated files come only from fenced code blocks with a `file="..."` attribute.
- Project-wide static values come from `package.json.snooks`.
- Runtime values come from CLI input and prompts under the `args.*` namespace.

## User Workflow

### Installation

```sh
pnpm add snooks -D
```

### Project Setup

Create a `.snooks` directory somewhere in the repo:

```txt
.snooks/
  component.md
  library.md
```

Project-level static configuration lives in `package.json`:

```json
{
  "name": "my-project",
  "snooks": {
    "orgName": "acme"
  }
}
```

### Template Creation

Each template is a markdown file with YAML frontmatter followed by human-readable documentation and file-generation code fences.

Example:

````md
---
name: component
at: packages/
args:
  isFoo:
    prompt: Is this component foo-ish?
    default: false
  bar:
    prompt: What is bar about this component?
    default: whatever
---

# component

Creates a component package.

```json file="package.json"
{
  "name": "@${config.orgName}$/${args.name}$",
  "version": "0.0.0"
}
```

```ts file="src/index.ts"
export const name = "${args.name}$";
export const isFoo = ${args.isFoo}$;
```
````

## CLI API

Version 1 exposes a single primary command:

```sh
snooks make
```

Supported invocation forms:

```sh
snooks make
snooks make <template>
snooks make <name> <template>
snooks make <template> at <where>
snooks make <name> <template> at <where>
snooks make <name> <template> <key=value>...
snooks make <name> <template> at <where> <key=value>...
```

Concrete examples:

```sh
snooks make Button component
snooks make component
snooks make library at packages/foo/bar
snooks make Button component at path/foo/whatever
snooks make Button component isReady=false defaultColor=red foo="{isCool: true}"
```

### Resolution Rules

- If no template is provided, prompt the user to choose from discovered templates.
- If a template is provided but no name is provided, prompt for `args.name`.
- If `at <where>` is provided, it overrides the template's frontmatter `at` value.
- Additional `key=value` pairs become entries under `args.*`.

Reserved runtime args:

- `args.name`
- `args.template`
- `args.where`

## Template Format

### Required Frontmatter

Each template must declare:

```yaml
name: component
at: packages/
```

Rules:

- `name` is the template identifier used by the CLI.
- `at` is required and defines the default parent output directory.

### Optional Frontmatter

Templates may also declare additional args:

```yaml
args:
  isFoo:
    prompt: Is this component foo-ish?
    default: false
  bar:
    prompt: What is bar about this component?
    default: whatever
```

Rules:

- Each declared arg uses plain-text prompting only in v1.
- If a declared arg is missing from the CLI, `snooks` prompts using `prompt`.
- `default` is used as the fallback value if the user submits nothing.

### File Blocks

Only fenced code blocks with a `file="..."` attribute generate files.

Example:

````md
```ts file="src/index.ts"
export const name = "${args.name}$";
```
````

Rules:

- `file="..."` paths are resolved relative to the generated output root.
- Headings do not create files.
- No alternate file declaration syntax is supported in v1.

## Variable Syntax

Snooks supports a single interpolation syntax:

```txt
${...}$
```

Examples:

- `${args.name}$`
- `${args.template}$`
- `${args.where}$`
- `${config.orgName}$`
- `${config.some.deep.value}$`

Namespace rules:

- `args.*` contains runtime values from CLI input and prompts.
- `config.*` contains static values from `package.json.snooks`.

## Value Parsing

CLI and prompted values are collected as text first, then parsed conservatively.

Version 1 parsing rules:

- `true` becomes boolean `true`
- `false` becomes boolean `false`
- `null` becomes `null`
- numeric literals become numbers
- all other values remain strings

Examples:

```sh
foo=red bar=42 baz=true qux=null bah=/foo/bar
```

becomes:

```txt
args.foo = "red"
args.bar = 42
args.baz = true
args.qux = null
args.bah = "/foo/bar"
```

Rendering rules:

- There is no separate raw interpolation syntax in v1.
- Template authors control string vs non-string output by the surrounding file content.

Example:

```json
{ "color": "${args.foo}$", "count": ${args.bar}$ }
```

## Template Discovery

When `snooks make` runs, it looks for the nearest `.snooks` directory by walking upward from the current working directory.

Rules:

- Search starts in the current working directory.
- If `.snooks` is not found, continue upward one parent at a time.
- Load templates only from the first `.snooks` directory found.
- Do not support npm-distributed template packs in v1.

## Output Path Model

The generated root directory is:

```txt
(CLI override or template.at) / args.name
```

Examples:

- Template `at: packages/` plus `snooks make Button component` writes to `packages/Button`
- Template `at: packages/` plus `snooks make Button component at apps/ui` writes to `apps/ui/Button`

## Safety Model

Snooks only scaffolds into a brand new root directory in v1.

Rules:

- Determine the final output root before generating anything.
- The first filesystem action should be creating that output root directory.
- If the final output root already exists, stop immediately as unsafe.
- No partial generation should happen before that safety check passes.
- Snooks does not merge into an existing directory in v1.

## Scope Exclusions For V1

The following are intentionally out of scope:

- npm-distributed template packs
- multiple interpolation syntaxes
- heading-based file declarations
- custom root-folder formatting beyond `args.name`
- alternate prompt types such as selects or checkboxes
- explicit raw interpolation syntax
- merge/overwrite behavior for existing output directories

## Open Implementation Notes

These are not user-facing features, but they should guide implementation:

- Prefer straightforward parsing over magical inference.
- Keep error messages explicit when command tokens are ambiguous.
- The future README can be derived directly from this document with minimal changes.
