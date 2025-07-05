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
  const connectingScreenRef = useRef<HTMLDivElement>(null); // ConnectingScreen用のRef

  console.log('HomeScence: useAnalysisStoreの前');
  const file = useAnalysisStore((state) => state.file);
  const resultFile = useAnalysisStore((state) => state.resultFile);
  const danger = useAnalysisStore((state) => state.danger);
  const scene = useAnalysisStore((state) => state.scene);
  const isProcessing = useAnalysisStore((state) => state.isProcessing);
  console.log('HomeScence: useAnalysisStoreの後', { file, resultFile, danger, scene, isProcessing });

  const [showFirstScreen, setShowFirstScreen] = useState(false);
  const [showSecondScreen, setShowSecondScreen] = useState(false);

  // ヘッダーのテキストアニメーション
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

  // ConnectingScreenのopacityアニメーション
  useEffect(() => {
    if (connectingScreenRef.current) {
      if (showFirstScreen) {
        gsap.fromTo(
          connectingScreenRef.current,
          { opacity: 0 },
          { opacity: 1, duration: 0.5, ease: 'power2.out' }
        );
      } else {
        gsap.to(connectingScreenRef.current, {
          opacity: 0,
          duration: 0.5,
          ease: 'power2.in',
        });
      }
    }
  }, [showFirstScreen]);

  const handlePlay = () => {
    console.log('HomeScence: handlePlay 呼び出し');
    setShowFirstScreen(true); // ConnectingScreenをopacityアニメーションで表示
  };

  const handleFirstScreenComplete = () => {
    console.log('HomeScence: handleFirstScreenComplete 呼び出し', { resultFile, danger });
    setShowFirstScreen(false); // ConnectingScreenを非表示
    if (resultFile && danger !== null) {
      setShowSecondScreen(true); // ResultDisplayを表示
    } else {
      console.warn('HomeScence: resultFileまたはdangerが未設定、HomeScenceに留まる');
      alert('分析結果を取得できませんでした。もう一度お試しください。');
    }
  };

  const handleCloseSecondScreen = () => {
    console.log('HomeScence: handleCloseSecondScreen 呼び出し');
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

      {/* fileが存在する場合、ImageInteractionManagerを常にレンダリングし、CSSで表示/非表示を制御 */}
      {file && (
        <div
          className={`w-full h-full absolute top-0 left-0 transition-opacity duration-300 ${
            showFirstScreen || showSecondScreen ? 'opacity-0 pointer-events-none' : 'opacity-100'
          }`}
        >
          <ImageInteractionManager
            uploadedFile={file}
            onClose={() => {
              console.log('HomeScence: ImageInteractionManager onClose');
              const { setFile } = getAnalysisStoreActions();
              setFile(null);
            }}
            onPlay={handlePlay}
            onComplete={handleFirstScreenComplete} // 新たに追加
          />
        </div>
      )}

      {/* ConnectingScreenをopacityアニメーションで表示 */}
      {file && (
        <div
          ref={connectingScreenRef}
          className={`w-full h-full absolute top-0 left-0 transition-opacity duration-300 ${
            showFirstScreen ? 'opacity-100 z-20' : 'opacity-0 pointer-events-none'
          }`}
        >
          <ConnectingScreen />
        </div>
      )}

      {/* ResultDisplay */}
      {showSecondScreen && resultFile && danger !== null && (
        <div className="w-full h-full absolute top-0 left-0 z-30">
          <ResultDisplay onClose={handleCloseSecondScreen} />
        </div>
      )}

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
