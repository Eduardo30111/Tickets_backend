import * as React from 'react'
import { cn } from './utils'

function Card({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      className={cn(
        'bg-[var(--card)] text-[var(--card-foreground)] flex flex-col gap-6 rounded-xl border border-[var(--border)]',
        className
      )}
      {...props}
    />
  )
}

function CardHeader({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      className={cn(
        'grid items-start gap-1.5 px-6 pt-6 [&:last-child]:pb-6',
        className
      )}
      {...props}
    />
  )
}

function CardTitle({ className, ...props }: React.ComponentProps<'div'>) {
  return <h4 className={cn('leading-none font-medium', className)} {...props} />
}

function CardDescription({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <p
      className={cn('text-sm text-[var(--muted-foreground)]', className)}
      {...props}
    />
  )
}

function CardContent({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div className={cn('px-6 [&:last-child]:pb-6', className)} {...props} />
  )
}

export { Card, CardHeader, CardTitle, CardDescription, CardContent }
