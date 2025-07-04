// path: /components/LastRecordDisplay.tsx

'use client';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import { useAnalysisStore } from '@/stores/useAnalysisStore';

export default function LastRecordDisplay() {
  const [prevDanger, setPrevDanger] = useState<string>('--');
  const [prevPrevDanger, setPrevPrevDanger] = useState<string>('--');
  const danger = useAnalysisStore((state) => state.danger);

  useEffect(() => {
    // クライアント側でのみ localStorage を読み込む
    const prev = localStorage.getItem('prevDanger') ?? '--';
    const prevPrev = localStorage.getItem('prevPrevDanger') ?? '--';

    // danger が更新されたとき、表示は localStorage の値をそのまま使用
    setPrevDanger(prev);
    setPrevPrevDanger(prevPrev);

    // デバッグログ
    console.log('LastRecordDisplay - danger:', danger, 'prevDanger:', prev, 'prevPrevDanger:', prevPrev);
  }, [danger]);

  return (
    <div
      className="relative w-[368px] h-[114px] rounded-xl overflow-hidden border-2 border-[#ffffff30] mx-auto"
      style={{ zIndex: 5 }}
    >
      <Image
        src="/LastRecordDisplay/LastRecord-background.png"
        alt="Background"
        layout="fill"
        objectFit="cover"
        className="absolute"
      />
      <div className="absolute inset-0 bg-[#ffffff15] backdrop-blur-md"></div>
      <div className="relative z-10 p-3">
        <div className="mx-auto flex justify-between items-center">
          <div className="text-center flex-1">
            <h2 className="text-[0.9rem] mb-1.5 font-[900] text-[#ffffffaa]">前回の危険度</h2>
            <span className="text-4xl font-bold" style={{ fontFamily: 'var(--font-ibm-plex-mono)' }}>
              {prevDanger === '0' ? '--:--' : prevDanger}
            </span>
          </div>
          <div className="text-center flex-1">
            <h2 className="text-[0.9rem] mb-1.5 font-[900] text-[#ffffffaa]">前々回の危険度</h2>
            <span className="text-4xl font-bold" style={{ fontFamily: 'var(--font-ibm-plex-mono)' }}>
              {prevPrevDanger === '0' ? '--:--' : prevPrevDanger}
            </span>
          </div>
        </div>
        <p className="text-[8px] text-[#ffffff63] mt-2 w-full text-center">
          危険度はAIによる判定で信頼できない場合があります。参考として活用してください。
        </p>
      </div>
    </div>
  );
}