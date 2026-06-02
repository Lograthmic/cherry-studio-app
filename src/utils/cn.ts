import { twMerge } from 'tailwind-merge';

export function cn(...classNames: (false | null | string | undefined)[]) {
  return twMerge(classNames.filter(Boolean).join(' '));
}
