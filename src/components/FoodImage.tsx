import { useState } from 'react';
import { Utensils } from 'lucide-react';

interface FoodImageProps {
  src: string;
  alt: string;
  className?: string;
}

export function FoodImage({ src, alt, className = '' }: FoodImageProps) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <div
        className={`flex flex-col items-center justify-center bg-gradient-to-br from-[#23201E] to-[#161412] text-[#A8A29E] p-4 text-center ${className}`}
        role="img"
        aria-label={alt}
      >
        <Utensils className="w-7 h-7 text-[#E85D22]/80 mb-2" strokeWidth={1.6} />
        <span className="text-xs font-medium text-[#D6D3D1] line-clamp-2">{alt}</span>
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
