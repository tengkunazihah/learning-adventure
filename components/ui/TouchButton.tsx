'use client';

import React from 'react';

export type TouchButtonVariant = 'default' | 'primary' | 'success';

export interface TouchButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: TouchButtonVariant;
}

const variantStyles: Record<TouchButtonVariant, string> = {
  default:
    'bg-background text-neutral-800 border-2 border-neutral-300 hover:border-neutral-400',
  primary:
    'bg-primary text-white hover:bg-primary/90',
  success:
    'bg-success text-white hover:bg-success/90',
};

export function TouchButton({
  variant = 'default',
  className = '',
  disabled,
  children,
  ...props
}: TouchButtonProps) {
  return (
    <button
      className={[
        'min-w-touch min-h-touch',
        'rounded-2xl font-bold text-kid-body',
        'transition-transform duration-100',
        'active:scale-95',
        'focus:outline-none focus:ring-4 focus:ring-accent',
        'disabled:opacity-50 disabled:pointer-events-none',
        'flex items-center justify-center gap-2 px-4',
        variantStyles[variant],
        className,
      ].join(' ')}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
}
