import * as React from "react"

export function AvatarGroup({ children, className, max }: { children: React.ReactNode; className?: string; max?: number }) {
  return <div className={`flex -space-x-2 overflow-hidden ${className || ''}`}>{children}</div>
}
