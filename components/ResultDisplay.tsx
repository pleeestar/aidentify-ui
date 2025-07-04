// path: /components/ResultDisplay.tsx

'use client';
import { useEffect, useState, useRef } from 'react';
import Image from 'next/image';
import gsap from 'gsap';
import { useAnalysisStore } from '@/stores/useAnalysisStore';

export default function ResultDisplay() {
  const { resultFile, danger } = useAnalysisStore();
  const [imageURL, setImageURL] = useState<string | null>(null);
  const [dangerValue, setDangerValue] = useState<string>('--');
  const [prevDangerValue, setPrevDangerValue] = useState<string>('--');
  const containerRef = useRef<HTMLDivElement>(null);
  const [isExpanded, setIsExpanded] = useState(false);

  // 状態更新と localStorage 処理を統合
  useEffect(() => {
    if (!resultFile || danger == null) {
      console.log('Skipping update: resultFile or danger is null', { resultFile, danger });
      return;
    }

    // 画像URLを生成
    const url = URL.createObjectURL(resultFile);
    setImageURL(url);
    console.log('Image URL generated:', url);

    // localStorage から値を取得
    const prevDanger = localStorage.getItem('prevDanger') ?? '--';
    const prevPrevDanger = localStorage.getItem('prevPrevDanger') ?? '--';
    console.log('Retrieved from localStorage:', { prevDanger, prevPrevDanger });

    // localStorage を更新
    localStorage.setItem('prevPrevDanger', prevDanger);
    console.log('Set prevPrevDanger in localStorage:', prevDanger);

    localStorage.setItem('prevDanger', danger.toString());
    console.log('Set prevDanger in localStorage:', danger);

    // 状態を更新
    setDangerValue(danger.toString());
    setPrevDangerValue(prevDanger);
    console.log('Updated state:', { dangerValue: danger.toString(), prevDangerValue: prevDanger });

    // クリーンアップ
    return () => {
      URL.revokeObjectURL(url);
      console.log('Cleaned up image URL:', url);
    };
  }, [resultFile, danger]);

  // アニメーション
  useEffect(() => {
    if (containerRef.current) {
      gsap.fromTo(
        containerRef.current,
        { y: '100vh', opacity: 0 },
        { y: 0, opacity: 1, duration: 0.5, ease: 'power2.out' }
      );
    }
  }, []);

  // 外部クリックハンドリング
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node) && isExpanded) {
        setIsExpanded(false);
        if (containerRef.current) {
          containerRef.current.style.zIndex = '10';
        }
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [isExpanded]);

  // 早期リターン
  if (!imageURL || danger == null) {
    console.log('Early return: imageURL or danger is null', { imageURL, danger });
    return null;
  }

  const arrowDirection = prevDangerValue !== '--' && Number(prevDangerValue) < Number(dangerValue) ? '>>>' : '<<<';
  console.log('Rendering ResultDisplay:', { dangerValue, prevDangerValue, arrowDirection });

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isExpanded) {
      setIsExpanded(true);
      if (containerRef.current) {
        containerRef.current.style.zIndex = '20';
      }
    }
  };

  const handleShare = async () => {
    if (!resultFile || !navigator.share) {
      console.log('Cannot share: resultFile or navigator.share unavailable');
      return;
    }

    try {
      await navigator.share({
        files: [resultFile],
        title: '画像を共有',
        text: 'Aidentifyで編集した画像を共有します',
      });
      console.log('Share successful');
    } catch (error) {
      console.error('Share failed:', error);
    }
  };

  return (
    <div className="w-screen h-dvh fixed top-0 right-0 z-50">
      <div className="w-screen h-dvh bg-black inset-0 flex flex-col items-center justify-center">
        <img src={imageURL} className="w-screen object-contain max-h-dvh" alt="Result Image" />
      </div>

      <div
        ref={containerRef}
        className="absolute bottom-0 bg-gray-50 flex flex-col w-full rounded-t-3xl"
        style={{ transform: 'translateY(0px)', zIndex: 10 }}
      >
        <div className="w-screen">
          <div className="overflow-x-auto whitespace-nowrap pb-4">
            <div className="flex space-x-4 mb-6 m-3">
              <div className="relative w-full h-[114px] rounded-xl overflow-hidden border-2 border-[#00000030] mx-auto" style={{ zIndex: 5 }}>
                <Image
                  src="/LastRecordDisplay/LastRecord-background.png"
                  alt="Background"
                  layout="fill"
                  objectFit="cover"
                  className="absolute"
                />
                <div className="absolute inset-0 bg-[#00000015] backdrop-blur-md" />
                <div className="relative z-10 p-3">
                  <div className="mx-auto flex justify-between items-center">
                    <div className="text-left flex-1">
                      <h2 className="text-[0.9rem] mb-1.5 font-[900] text-[#ffffffaa]">あなたの評価</h2>
                      <span className="text-4xl font-bold" style={{ fontFamily: 'var(--font-ibm-plex-mono)' }}>
                        危険度{dangerValue}
                      </span>
                    </div>
                    <div className="text-center flex-1 flex items-center">
                      <div className="rotate-90 text-3xl">{arrowDirection}</div>
                      <div className="flex flex-col">
                        <h2 className="text-[0.7rem] mb-1.5 font-[900] text-[#ffffff66]">前回の危険度</h2>
                        <span className="text-4xl font-bold text-[#ffffff66]" style={{ fontFamily: 'var(--font-ibm-plex-mono)' }}>
                          {prevDangerValue}
                        </span>
                      </div>
                    </div>
                  </div>
                  <p className="text-[8px] text-[#ffffff63] mt-2 w-full text-center">
                    危険度はAIによる判定で信頼できない場合があります。参考として活用してください。
                  </p>
                </div>
              </div>
            </div>

            <div className={`flex justify-between p-4 ${isExpanded ? 'flex-row' : 'flex-col'}`}>
              <button
                onClick={handleToggle}
                className="w-full bg-blue-500 text-white py-2 rounded-lg font-semibold hover:bg-blue-600 transition-colors"
              >
                共有
              </button>
              {isExpanded && (
                <div className="flex space-x-2 ml-4">
                  <button
                    onClick={handleShare}
                    className="bg-gray-300 text-gray-700 py-2 px-4 rounded-lg"
                  >
                    シェア
                  </button>
                  <a
                    href={imageURL}
                    download={resultFile?.name || 'downloaded-image'}
                    className={`bg-gray-300 text-gray-700 py-2 px-4 rounded-lg ${!imageURL ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-400'}`}
                    onClick={(e) => !imageURL && e.preventDefault()}
                  >
                    画像を保存
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}