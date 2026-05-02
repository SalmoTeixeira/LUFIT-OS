export default function LogoInline({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center gap-1 select-none ${className}`}>
      <svg width="40" height="40" viewBox="0 0 100 100" className="shrink-0">
        {/* Female silhouette with dumbbell */}
        <circle cx="50" cy="18" r="12" fill="currentColor" />
        <ellipse cx="50" cy="55" rx="18" ry="28" fill="currentColor" />
        <rect x="20" y="35" width="30" height="6" rx="3" fill="currentColor" transform="rotate(-20 50 50)" />
        <circle cx="15" cy="30" r="5" fill="currentColor" />
        <circle cx="85" cy="40" r="5" fill="currentColor" />
        <path d="M50 30 L55 22 L60 24" stroke="currentColor" strokeWidth="3" fill="none" />
      </svg>
      <span className="font-black text-2xl tracking-tight">
        <span className="text-[#2DD4A8]">LU</span>
        <span className="text-white">FIT</span>
      </span>
    </div>
  );
}
