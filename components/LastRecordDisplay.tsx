'use client';
import Image from 'next/image';

const prevDanger = 140;
const prevPrevDanger = 96;

export default function LastRecordDisplay() {
  return (
    <div
      className="relative w-[368px] h-[114px] rounded-xl overflow-hidden border-2 border-[#ffffff30]"
      style={{ zIndex: 5 }} // PalletDisplayの初期z-index (10) より低く
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
              {prevDanger}
            </span>
          </div>
          <div className="text-center flex-1">
            <h2 className="text-[0.9rem] mb-1.5 font-[900] text-[#ffffffaa]">前々回の危険度</h2>
            <span className="text-4xl font-bold" style={{ fontFamily: 'var(--font-ibm-plex-mono)' }}>
              {prevPrevDanger}
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