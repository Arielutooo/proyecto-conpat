'use client'

import React, { useEffect } from 'react'
import { Icon } from './Icon'

// ─── Toast ────────────────────────────────────────────────────────────────────
interface ToastProps {
  message: string
  type?: 'success' | 'error'
  onClose: () => void
}

export const Toast = ({ message, type = 'success', onClose }: ToastProps) => {
  useEffect(() => {
    const t = setTimeout(onClose, 3500)
    return () => clearTimeout(t)
  }, [onClose])

  const cfg = {
    success: { bg: '#ecfdf5', border: '#a7f3d0', color: '#065f46', icon: 'check' },
    error: { bg: '#fef2f2', border: '#fecaca', color: '#991b1b', icon: 'x' },
  }
  const c = cfg[type]

  return (
    <div style={{
      position: 'fixed', bottom: 24, right: 24, zIndex: 999,
      background: c.bg, border: `1px solid ${c.border}`, borderRadius: 10,
      padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 10,
      boxShadow: '0 4px 16px rgba(0,0,0,0.12)', color: c.color,
      fontSize: 13, fontWeight: 500,
    }}>
      <Icon name={c.icon} size={15} />
      {message}
    </div>
  )
}

// ─── Modal ────────────────────────────────────────────────────────────────────
interface ModalProps {
  title: string
  children: React.ReactNode
  onClose: () => void
  width?: number
}

export const Modal = ({ title, children, onClose, width = 480 }: ModalProps) => (
  <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
    <div style={{ background: 'white', borderRadius: 16, width: '100%', maxWidth: width, maxHeight: '90vh', display: 'flex', flexDirection: 'column', boxShadow: '0 20px 60px rgba(0,0,0,0.25)' }}>
      <div style={{ padding: '20px 24px', borderBottom: '1px solid #e5e8ef', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: '#0f172a' }}>{title}</h3>
        <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', padding: 4 }}>
          <Icon name="x" size={16} />
        </button>
      </div>
      <div style={{ overflow: 'auto', flex: 1 }}>{children}</div>
    </div>
  </div>
)

// ─── EmptyState ───────────────────────────────────────────────────────────────
interface EmptyStateProps {
  icon: string
  title: string
  sub?: string
}

export const EmptyState = ({ icon, title, sub }: EmptyStateProps) => (
  <div style={{ textAlign: 'center', padding: '40px 24px', color: '#94a3b8' }}>
    <Icon name={icon} size={32} style={{ marginBottom: 12, opacity: 0.5, display: 'block', margin: '0 auto 12px' }} />
    <div style={{ fontSize: 14, fontWeight: 500, color: '#64748b', marginBottom: 4 }}>{title}</div>
    {sub && <div style={{ fontSize: 12 }}>{sub}</div>}
  </div>
)
