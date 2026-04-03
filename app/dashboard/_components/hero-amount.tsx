'use client';

import { useTheme } from 'next-themes';

export function HeroAmount({ value }: { value: string }) {
  const { resolvedTheme, setTheme } = useTheme();

  return (
    <p
      onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
      className="mt-1 cursor-default select-none text-4xl font-bold tracking-tighter tabular-nums text-foreground sm:text-6xl"
    >
      {value}
    </p>
  );
}
