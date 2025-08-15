import { HTMLAttributes } from 'react';

export function Card({ className = '', ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={`rounded border p-4 bg-white dark:bg-gray-800 ${className}`} {...props} />;
}
