import { InputHTMLAttributes } from 'react';

export function Input({ className = '', ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input className={`border p-2 rounded bg-white dark:bg-gray-800 ${className}`} {...props} />
  );
}
