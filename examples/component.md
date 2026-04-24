---
name: component
output: src/components
---

# [[ARGS.NAME]]

A React component.

```tsx output="/[[ARGS.NAME]]/index.tsx"
import "./index.css"

type [[ARGS.NAME]]PropsT = {
  children: React.ReactNode
}

export const [[ARGS.NAME]] = (props: [[ARGS.NAME]]PropsT) => {
  return (
    <div className="[[ARGS.NAME]]">
      {props.children}
    </div>
  )
}
```

```css output="/[[ARGS.NAME]]/index.css"
.[[ARGS.NAME]] {
  display: flex;
}
```

```ts output="/[[ARGS.NAME]]/index.stories.ts"
import type { Meta, StoryObj } from "@storybook/react"
import { [[ARGS.NAME]] } from "."

const meta: Meta<typeof [[ARGS.NAME]]> = {
  component: [[ARGS.NAME]],
}

export default meta

type StoryT = StoryObj<typeof [[ARGS.NAME]]>

export const Default: StoryT = {
  args: {},
}
```
