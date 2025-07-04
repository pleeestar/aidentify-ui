// path: /components/scence/HomeScence.tsx

'use client';

import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import Image from 'next/image';
import dynamic from 'next/dynamic';

const CustomButton = dynamic(() => import('@/components/CustomButton'), { ssr: false });
const LastRecordDisplay = dynamic(() => import('@/components/LastRecordDisplay'), { ssr: false });
const PalletDisplay = dynamic(() => import('@/components/PalletDisplay'), { ssr: false });
const ImageInteractionManager = dynamic(() => import('@/components/ImageInteractionManager'), { ssr: false });
const ConnectingScreen = dynamic(() => import('@/components/ConnectingScreen'), { ssr: false });
const ResultDisplay = dynamic(() => import('@/components/ResultDisplay'), { ssr: false });

import { useAnalysisStore, getAnalysisStoreActions } from '@/stores/useAnalysisStore';

export default function HomeScence() {
  const textRef = useRef<HTMLHeadingElement>(null);
  const iconRef = useRef<HTMLDivElement>(null);

  console.log('HomeScence: Before useAnalysisStore');
  const file = useAnalysisStore((state) => state.file);
  const resultFile = useAnalysisStore((state) => state.resultFile);
  const danger = useAnalysisStore((state) => state.danger);
  const scene = useAnalysisStore((state) => state.scene);
  const isProcessing = useAnalysisStore((state) => state.isProcessing);
  console.log('HomeScence: After useAnalysisStore', { file, resultFile, danger, scene, isProcessing });

  const [showFirstScreen, setShowFirstScreen] = useState(false);
  const [showSecondScreen, setShowSecondScreen] = useState(false);

  useEffect(() => {
    const texts = [
      '個人情報を保護',
      'AIオート保護',
      'AIシーン保護',
      'AI危険度測定',
    ];
    let currentIndex = 0;

    const animateText = () => {
      const tl = gsap.timeline();
      tl.to([textRef.current, iconRef.current], {
        y: -50,
        opacity: 0,
        duration: 0.5,
        ease: 'power2.in',
        onComplete: () => {
          currentIndex = (currentIndex + 1) % texts.length;
          if (textRef.current) {
            textRef.current.textContent = texts[currentIndex];
          }
          gsap.fromTo(
            [textRef.current, iconRef.current],
            { y: 50, opacity: 0 },
            { y: 0, opacity: 1, duration: 0.5, ease: 'power2.out' }
          );
        },
      });
    };

    const interval = setInterval(animateText, 3000);
    return () => clearInterval(interval);
  }, []);

  const handlePlay = () => {
    console.log('HomeScence: handlePlay called');
    const { setIsProcessing } = getAnalysisStoreActions();
    setIsProcessing(true); // 処理開始をマーク
    setShowFirstScreen(true);
  };

  const handleFirstScreenComplete = () => {
    console.log('HomeScence: handleFirstScreenComplete called', { resultFile, danger });
    const { setIsProcessing } = getAnalysisStoreActions();
    setShowFirstScreen(false);
    setIsProcessing(false); // 処理終了をマーク
    if (resultFile && danger !== null) {
      setShowSecondScreen(true);
    }
  };

  const handleCloseSecondScreen = () => {
    console.log('HomeScence: handleCloseSecondScreen called');
    const { setFile, setScene, setResult } = getAnalysisStoreActions();
    setShowSecondScreen(false);
    setFile(null);
    setScene(null);
    setResult(null, null); // 結果をリセット
  };

  return (
    <div className="w-full h-dvh p-6 flex flex-col items-center relative overflow-y-hidden">
      <h1 className="text-4xl font-bold mb-4 text-[#222] text-left w-full">＝ Home</h1>
      <img src="/aidentify.svg" alt="Aidentify #3.0.1" className="mb-4 w-full" />

      {file && !showFirstScreen && !showSecondScreen && (
        <ImageInteractionManager
          uploadedFile={file}
          onClose={() => {
            console.log('HomeScence: ImageInteractionManager onClose');
            const { setFile } = getAnalysisStoreActions();
            setFile(null);
          }}
          onPlay={handlePlay}
        />
      )}

      {showFirstScreen && (
        <ConnectingScreen handleFirstScreenClick={handleFirstScreenComplete} />
      )}

      {showSecondScreen && resultFile && danger !== null && <ResultDisplay />}

      <div className="flex items-center space-x-4 mb-8">
        <div ref={iconRef}>
          <Image src="/person-bounding.svg" alt="Person Bounding" width={50} height={50} />
        </div>
        <h2 ref={textRef} className="text-3xl font-semibold text-white">
          個人情報を保護
        </h2>
      </div>

      <div className="mt-auto flex items-center justify-center w-full h-dvh mb-8 absolute">
        <CustomButton />
      </div>

      <div className="w-full absolute bottom-[-230px] flex flex-col gap-4 transition-all duration-300">
        <LastRecordDisplay />
        <PalletDisplay />
      </div>
    </div>
  );
}