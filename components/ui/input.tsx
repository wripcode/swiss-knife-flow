import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const inputVariants = cva(
  "bg-input border-border text-(--font-size-small) shadow-(--shadow-input-inner) selection:bg-primary selection:text-primary-foreground placeholder:text-muted-foreground file:text-foreground flex w-full min-w-0 rounded border px-2 py-1 outline-none transition-[color,box-shadow] file:inline-flex file:h-full file:border-0 file:bg-transparent file:pt-0.5 file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 focus-visible:border-ring focus-visible:ring-1 focus-visible:ring-ring focus-visible:outline-none aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
  {
    variants: {
      size: {
        default: "h-6",
        sm: "h-5 text-[10px]",
        lg: "h-8 text-xs",
        xl: "h-9 text-sm",
      },
    },
    defaultVariants: {
      size: "default",
    },
  }
)

export interface InputProps
  extends Omit<React.ComponentProps<"input">, "size">,
    VariantProps<typeof inputVariants> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, size, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(inputVariants({ size, className }))}
        ref={ref}
        data-slot="input"
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }
