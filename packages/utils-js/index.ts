export * from './formatters';
export * from './validators';

// Utility function for conditionally joining class names (like clsx/tailwind-merge)
export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ');
}