'use client';
import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import Image from 'next/image';
import CustomButton from '@/components/CustomButton';
import LastRecordDisplay from '@/components/LastRecordDisplay';
import PalletDisplay from '@/components/PalletDisplay';
import HomeHeader from '@/components/HomeHeader';

export default function Home() {
  const textRef = useRef(null);
  const iconRef = useRef(null);

  useEffect(() => {
    const texts = [
      "個人情報を保護",
      "AIオート保護",
      "AIシーン保護",
      "AI危険度測定",
    ];
    let currentIndex = 0;

    const animateText = () => {
      const tl = gsap.timeline();
      tl.to([textRef.current, iconRef.current], {
        y: -50,
        opacity: 0,
        duration: 1,
        onComplete: () => {
          currentIndex = (currentIndex + 1) % texts.length;
          textRef.current.textContent = texts[currentIndex];
          gsap.fromTo(
            [textRef.current, iconRef.current],
            { y: 50, opacity: 0 },
            { y: 0, opacity: 1, duration: 1, ease: 'power2.out' }
          );
        }
      });
    };

    const interval = setInterval(animateText, 4000); // 4秒ごとにアニメーション
    return () => clearInterval(interval); // クリーンアップ
  }, []);

  const handleButtonClick = () => {
    console.log('Button was clicked!');
    // ここで必要な処理を追加
  };

  return (
    <div className="w-full h-screen p-6 bg-gradient-to-b from-pink-100 to-blue-400 flex flex-col items-center relative overflow-y-auto">
      <h1 className="text-4xl font-bold mb-4 text-[#222] text-left w-full">＝ Home</h1>
      <img src="/aidentify.svg" alt="Aidentify #3.0.1" className="mb-4 w-full" />

      {/* 個人情報を保護とperson-boundingを平行に配置し、スクロール可能 */}
      <div className="flex items-center space-x-4 mb-8">
        <div ref={iconRef}>
          <Image src="/person-bounding.svg" alt="Person Bounding" width={50} height={50} />
        </div>
        <h2 ref={textRef} className="text-3xl font-semibold text-white">個人情報を保護</h2>
      </div>

      {/* 中央のプラスボタン */}
      <div className="mt-auto flex items-center justify-center w-full mb-8">
        <CustomButton onClick={handleButtonClick} />
      </div>

      {/* 下部の表示エリア */}
      <div className="w-full absolute bottom-[-200px]">
        <LastRecordDisplay />
        <PalletDisplay />
      </div>
    </div>
  );
}