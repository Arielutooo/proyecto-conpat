'use client'

import React from 'react'

const colors: Record<string, string> = {
  blue: 'bg-blue-50 text-blue-700 ring-1 ring-blue-200',
  green: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200',
  amber: 'bg-amber-50 text-amber-700 ring-1 ring-amber-200',
  red: 'bg-red-50 text-red-700 ring-1 ring-red-200',
  slate: 'bg-slate-100 text-slate-600 ring-1 ring-slate-200',
  purple: 'bg-purple-50 text-purple-700 ring-1 ring-purple-200',
  indigo: 'bg-indigo-50 text-indigo-700 ring-1 ring-indigo-200',
}

interface BadgeProps {
  children: React.ReactNode
  color?: string
}

export const Badge = ({ children, color = 'blue' }: BadgeProps) => (
  <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${colors[color] ?? colors.slate}`}>
    {children}
  </span>
)
