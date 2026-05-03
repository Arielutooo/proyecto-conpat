'use client'

import React from 'react'
import { Icon } from './Icon'

interface TopBarProps {
  breadcrumbs?: string[]
  action?: React.ReactNode
}

export const TopBar = ({ breadcrumbs = [], action }: TopBarProps) => (
  <div style={{ borderBottom: '1px solid #e5e8ef', background: 'white', padding: '0 28px', height: 56, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
    <div className="flex items-center gap-2" style={{ color: '#6b7280', fontSize: 13 }}>
      {breadcrumbs.map((b, i) => (
        <React.Fragment key={i}>
          {i > 0 && <Icon name="chevronRight" size={12} />}
          <span style={{ color: i === breadcrumbs.length - 1 ? '#0f172a' : '#6b7280', fontWeight: i === breadcrumbs.length - 1 ? 600 : 400 }}>
            {b}
          </span>
        </React.Fragment>
      ))}
    </div>
    {action && <div>{action}</div>}
  </div>
)
