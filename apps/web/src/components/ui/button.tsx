import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex select-none items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-[color,background-color,border-color,box-shadow,transform] duration-150 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground shadow-[0_1px_0_rgb(255_255_255/0.08)_inset,var(--shadow-card)] hover:bg-primary/90 hover:shadow-[0_1px_0_rgb(255_255_255/0.1)_inset,var(--shadow-raised)] active:translate-y-[1px]",
        destructive:
          "bg-destructive text-destructive-foreground shadow-[0_1px_0_rgb(255_255_255/0.08)_inset,var(--shadow-card)] hover:bg-destructive/90 active:translate-y-[1px]",
        outline:
          "border border-input bg-background shadow-[var(--shadow-card)] hover:bg-accent hover:text-accent-foreground active:translate-y-[1px]",
        secondary:
          "bg-secondary text-secondary-foreground shadow-[var(--shadow-card)] hover:bg-secondary/80 active:translate-y-[1px]",
        ghost:
          "hover:bg-accent hover:text-accent-foreground active:translate-y-[1px]",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-10 rounded-md px-8",
        icon: "h-9 w-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
