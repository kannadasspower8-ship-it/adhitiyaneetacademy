import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean
  variant?: "default" | "secondary" | "outline" | "ghost" | "link" | "accent"
  size?: "default" | "sm" | "lg" | "icon"
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    
    const baseClass = "inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-semibold tracking-wide transition-all duration-300 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
    
    const variantClasses = {
      default: "bg-primary text-white shadow-md hover:bg-secondary hover:-translate-y-0.5 border border-transparent",
      secondary: "bg-secondary text-white shadow-md hover:bg-primary hover:-translate-y-0.5 border border-transparent",
      accent: "bg-accent text-white shadow-md hover:bg-[#B59120] hover:-translate-y-0.5 border border-transparent",
      outline: "border border-primary bg-transparent text-primary hover:bg-primary hover:text-white hover:-translate-y-0.5 shadow-sm",
      ghost: "hover:bg-muted text-foreground",
      link: "text-primary underline-offset-4 hover:underline",
    }
    
    const sizeClasses = {
      default: "h-12 px-6 py-3",
      sm: "h-10 rounded-md px-4 text-xs",
      lg: "h-14 rounded-xl px-8 text-base",
      icon: "h-12 w-12",
    }

    return (
      <Comp
        className={cn(baseClass, variantClasses[variant], sizeClasses[size], className)}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button }
