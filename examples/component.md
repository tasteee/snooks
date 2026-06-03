---
name: component
output: src/components
---

# $$name

A React component.

```tsx output="/$$name/index.tsx"
import "./index.css"

type ${args.name}$PropsT = {
  children: React.ReactNode
}

export const $$name = (props: ${args.name}$PropsT) => {
  return (
    <div className="$$name">
      {props.children}
    </div>
  )
}
```

```css output="/$$name/index.css"
.$$name {
  display: flex;
}
```

```ts output="/$$name/index.stories.ts"
import type { Meta, StoryObj } from "@storybook/react"
import { $$name } from "."

const meta: Meta<typeof $$name> = {
  component: $$name,
}

export default meta

type StoryT = StoryObj<typeof $$name>

export const Default: StoryT = {
  args: {},
}
```
