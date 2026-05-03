'use client'

import React from 'react'

interface CardProps {
  children: React.ReactNode
  className?: string
  style?: React.CSSProperties
  onClick?: () => void
  onMouseEnter?: (e: React.MouseEvent<HTMLDivElement>) => void
  onMouseLeave?: (e: React.MouseEvent<HTMLDivElement>) => void
}

export const Card = ({ children, className = '', style = {}, onClick, onMouseEnter, onMouseLeave }: CardProps) => (
  <div
    style={{ background: 'white', borderRadius: 12, border: '1px solid #e5e8ef', boxShadow: '0 1px 4px rgba(0,0,0,0.05)', ...style }}
    className={className}
    onClick={onClick}
    onMouseEnter={onMouseEnter}
    onMouseLeave={onMouseLeave}
  >
    {children}
  </div>
)

interface StatCardProps {
  label: string
  value: string | number
  sub?: string
  accent?: boolean
}

export const StatCard = ({ label, value, sub, accent = false }: StatCardProps) => (
  <Card style={{ padding: '20px 24px' }}>
    <div style={{ fontSize: 11, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 500 }}>{label}</div>
    <div style={{ fontSize: 26, fontWeight: 700, color: accent ? 'oklch(0.55 0.18 245)' : '#0f172a', marginTop: 6, fontFamily: "'DM Serif Display', serif" }}>{value}</div>
    {sub && <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 4 }}>{sub}</div>}
  </Card>
)
