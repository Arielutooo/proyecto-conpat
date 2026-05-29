'use client'

import React from 'react'
import { Icon } from './Icon'

type BtnVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'success'
type BtnSize = 'sm' | 'md' | 'lg'

interface BtnProps {
  children?: React.ReactNode
  variant?: BtnVariant
  size?: BtnSize
  onClick?: () => void
  disabled?: boolean
  icon?: string
  type?: 'button' | 'submit' | 'reset'
  style?: React.CSSProperties
}

const sizeStyles: Record<BtnSize, React.CSSProperties> = {
  sm: { padding: '6px 12px', fontSize: 12 },
  md: { padding: '9px 18px', fontSize: 13 },
  lg: { padding: '11px 24px', fontSize: 14 },
}

const variantStyles: Record<BtnVariant, React.CSSProperties> = {
  primary: { background: '#C84632', color: 'white', boxShadow: '0 1px 3px rgba(200,70,50,0.4)' },
  secondary: { background: 'white', color: '#374151', border: '1px solid #d1d5db', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' },
  ghost: { background: 'transparent', color: '#6b7280' },
  danger: { background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca' },
  success: { background: 'oklch(0.55 0.18 145)', color: 'white' },
}

export const Btn = ({ children, variant = 'primary', size = 'md', onClick, disabled, icon, type = 'button', style = {} }: BtnProps) => {
  const base: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    border: 'none',
    cursor: disabled ? 'not-allowed' : 'pointer',
    borderRadius: 8,
    fontWeight: 500,
    transition: 'all 0.15s',
    opacity: disabled ? 0.5 : 1,
    ...style,
  }

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      style={{ ...base, ...sizeStyles[size], ...variantStyles[variant], ...(style.border ? { border: style.border } : {}) }}
    >
      {icon && <Icon name={icon} size={13} />}
      {children}
    </button>
  )
}
