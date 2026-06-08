import React from 'react';

interface CurrencyIconProps {
  className?: string;
  theme?: 'dark' | 'light';
  style?: React.CSSProperties;
}

export default function CurrencyIcon({ className = "w-auto object-contain mx-1", theme = "light", style }: CurrencyIconProps) {
  return (
    <span
      className={`inline-block align-middle ${className}`}
      style={{
        display: 'inline-block',
        verticalAlign: 'middle',
        fontWeight: 600,
        fontSize: '1.15em',
        ...style,
      }}
    >
      EGP
    </span>
  );
}
