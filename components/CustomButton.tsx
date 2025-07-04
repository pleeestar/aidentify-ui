// path: /components/CustomButton.tsx

'use client';
//CustomButton.tsx
import React, { useRef } from 'react';
import { useAnalysisStore } from '@/stores/useAnalysisStore';

export default function CustomButton() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const setFile = useAnalysisStore((state) => state.setFile);

  const handleClick = () => {
    fileInputRef.current?.click();
    console.log("ボタン押したよ！");
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null;
    if (file) {
      console.log("ファイル選択したよ！", file);
      setFile(file);
    }
  };

  return (
    <div>
      <button onClick={handleClick}>
        <img src="/customButton.svg" alt="アップロードボタン" />
      </button>
      <input
        type="file"
        ref={fileInputRef}
        accept="image/*"
        style={{ display: 'none' }}
        onChange={handleFileChange}
      />
    </div>
  );
}
