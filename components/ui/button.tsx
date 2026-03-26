import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Slot } from "radix-ui"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap transition-all outline-none shrink-0 font-medium leading-none text-[11px] drop-shadow-[0px_0.5px_1px_rgba(0,0,0,0.3)] rounded-[4px] disabled:opacity-50 disabled:pointer-events-none disabled:shadow-none disabled:drop-shadow-none [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-3 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground shadow-[var(--shadow-action-primary)] hover:drop-shadow-[0px_0.5px_1px_rgba(0,0,0,1)] hover:brightness-115 focus-visible:outline focus-visible:outline-1 focus-visible:outline-ring focus-visible:outline-offset-1",
        destructive:
          "bg-destructive text-white shadow-[var(--shadow-action-primary)] hover:drop-shadow-[0px_0.5px_1px_rgba(0,0,0,1)] hover:brightness-115 focus-visible:outline focus-visible:outline-1 focus-visible:outline-[var(--wf-red-border)] focus-visible:outline-offset-1",
        outline:
          "border border-[var(--border)] bg-background shadow-[var(--shadow-action-secondary)] hover:bg-accent hover:text-accent-foreground focus-visible:outline focus-visible:outline-1 focus-visible:outline-ring focus-visible:outline-offset-1",
        secondary:
          "bg-secondary text-secondary-foreground shadow-[var(--shadow-action-secondary)] hover:drop-shadow-[0px_0.5px_1px_rgba(0,0,0,1)] hover:brightness-110 focus-visible:outline focus-visible:outline-1 focus-visible:outline-ring focus-visible:outline-offset-1",
        ghost:
          "hover:bg-accent hover:text-accent-foreground drop-shadow-none shadow-none focus-visible:outline focus-visible:outline-1 focus-visible:outline-ring focus-visible:outline-offset-1",
        link: "text-primary underline-offset-4 hover:underline drop-shadow-none shadow-none",
      },
      size: {
        default: "h-6 px-2 py-1 gap-0.5 has-[>svg]:px-1.5",
        xs: "h-5 px-1.5 py-0.5 gap-0.5 text-[10px] has-[>svg]:px-1",
        sm: "h-6 px-2 py-1 gap-0.5 has-[>svg]:px-1.5",
        lg: "h-7 px-3 py-1 gap-1 text-[12px] has-[>svg]:px-2.5",
        icon: "size-6 rounded-[2px] p-0 gap-1",
        "icon-xs": "size-5 rounded-[2px] p-0 gap-1",
        "icon-sm": "size-6 rounded-[2px] p-0 gap-1",
        "icon-lg": "size-7 rounded-[2px] p-0 gap-1",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant = "default",
  size = "default",
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot.Root : "button"

  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
