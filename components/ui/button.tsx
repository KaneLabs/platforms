import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gray-950 disabled:pointer-events-none disabled:opacity-50 dark:focus-visible:ring-gray-300",
  {
    variants: {
      variant: {
        default:
          "bg-gray-800 bg-button-gradient text-gray-100 shadow hover:bg-gray-800/90 hover:bg-button-gradient-lighten dark:bg-gray-100 dark:text-gray-900 dark:hover:bg-gray-100/90 ",
        destructive:
          "bg-accent-red text-gray-100 shadow-sm hover:bg-accent-red/90 dark:bg-red-900 dark:text-gray-100 dark:hover:bg-red-900/90",
        outline:
          "border border-gray-400 bg-transparent shadow-sm hover:bg-gray-50/90 hover:text-gray-900 dark:border-gray-800 dark:hover:bg-gray-800 dark:hover:text-gray-100",
        secondary:
          "bg-gray-50 text-gray-900 shadow-sm hover:bg-gray-50/70 dark:bg-gray-800 dark:text-gray-100 dark:hover:bg-gray-800/80",
        ghost: "hover:bg-gray-100 hover:text-gray-900 dark:hover:bg-gray-800 dark:hover:text-gray-100",
        link: "text-gray-900 underline-offset-4 hover:underline dark:text-gray-100",
        green:
          "bg-accent-green text-gray-100 shadow hover:bg-accent-green/90 dark:bg-gray-100 dark:text-gray-900 dark:hover:bg-gray-100/90 ",
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
