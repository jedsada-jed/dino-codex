export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" className={className} fill="currentColor" aria-hidden="true">
      <path d="M50 12 C68 12 78 40 78 58 C78 78 65 90 50 90 C35 90 22 78 22 58 C22 40 32 12 50 12 Z" />
      <path
        d="M42 30 L50 44 L44 50 L56 66"
        fill="none"
        stroke="var(--background)"
        strokeWidth="4"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </svg>
  );
}
