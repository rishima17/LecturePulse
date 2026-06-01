import * as React from "react"
import { cn } from "@/lib/utils"

const Card = React.forwardRef(({ className, variant = "default", ...props }, ref) => {
  const variants = {
    default: "rounded-xl border bg-card text-card-foreground shadow-sm",
    interactive:
      `
rounded-xl
border border-border
bg-card/80
text-card-foreground
backdrop-blur-md
shadow-sm
hover:shadow-lg
hover:-translate-y-1
transition-all
duration-300
`,
    elevated: "rounded-2xl shadow-xl",
    glass: "rounded-xl border bg-background/60 backdrop-blur-lg shadow-sm",
    gradient: "rounded-xl border bg-gradient-to-br from-background via-background to-muted/50 shadow-sm",
  }

  return (
    <div
      ref={ref}
      className={cn(
        variants[variant],
        className
      )}
      {...props}
    />
  )
})
Card.displayName = "Card"

const CardHeader = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-1.5 p-6", className)}
    {...props}
  />
))
CardHeader.displayName = "CardHeader"

const CardTitle = React.forwardRef(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn(
      "text-2xl font-semibold leading-none tracking-tight",
      className
    )}
    {...props}
  />
))
CardTitle.displayName = "CardTitle"

const CardDescription = React.forwardRef(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
))
CardDescription.displayName = "CardDescription"

const CardContent = React.forwardRef(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
))
CardContent.displayName = "CardContent"

const CardFooter = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center p-6 pt-0", className)}
    {...props}
  />
))
CardFooter.displayName = "CardFooter"

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent }
