// path: /components/ScenceButton.tsx

'use client';
import Image from 'next/image';
import { forwardRef } from 'react';

interface SceneButtonProps {
  src: string;
  alt: string;
  onClick: () => void;
  ImageText: string;
}

// forwardRefでrefをbuttonに渡す
const SceneButton = forwardRef<HTMLButtonElement, SceneButtonProps>(
  ({ src, alt, onClick, ImageText }, ref) => {
    return (
      <button
        ref={ref}
        className="relative inline-flex w-36 h-36 overflow-hidden border-6 border-white rounded-3xl"
        style={{
          minWidth: '140px',
          minHeight: '140px',
          boxShadow: '0 1px 1px rgba(0,0,0,0.12), 0 2px 2px rgba(0,0,0,0.12), 0 4px 4px rgba(0,0,0,0.12), 0 8px 8px rgba(0,0,0,0.12), 0 16px 16px rgba(0,0,0,0.12)',
        }}
        onClick={onClick}
      >
        <Image
          src={src}
          alt={alt}
          layout="fill"
          objectFit="cover"
          className="absolute"
        />
        <div className="absolute inset-0 bg-[#00000040] flex items-center justify-center">
          <span className="text-white text-xl font-bold">{ImageText}</span>
        </div>
      </button>
    );
  }
);

export default SceneButton;