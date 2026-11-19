import { useState } from 'react';

interface ResilientImageProps {
  src: string;
  alt: string;
  className?: string;
  aspectClassName?: string;
}

export function ResilientImage({ src, alt, className = '', aspectClassName = '' }: ResilientImageProps) {
  const [failed, setFailed] = useState(false);

  if (failed || !src) {
    return (
      <div
        className={`flex flex-col items-center justify-center bg-gradient-to-br from-[#0F291E] via-[#193D2D] to-[#0F291E] text-[#FAF7F0] p-6 text-center ${aspectClassName} ${className}`}
        role="img"
        aria-label={alt}
      >
        <svg
          width="36"
          height="36"
          viewBox="0 0 36 36"
          fill="none"
          aria-hidden="true"
          className="mb-3 text-[#D4B26A]"
        >
          <path
            d="M6 30V15C6 8.37258 11.3726 3 18 3C24.6274 3 30 8.37258 30 15V30"
            stroke="currentColor"
            strokeWidth="1.5"
          />
          <path d="M12 30V17C12 13.6863 14.6863 11 18 11C21.3137 11 24 13.6863 24 17V30" stroke="currentColor" strokeWidth="1.2" />
          <line x1="3" y1="30" x2="33" y2="30" stroke="currentColor" strokeWidth="1.5" />
        </svg>
        <span className="font-serif text-lg tracking-wide text-[#FAF7F0]/90">{alt}</span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      referrerPolicy="no-referrer"
      onError={() => setFailed(true)}
      className={className}
    />
  );
}
