'use client';

import { useRef, useState, useEffect } from 'react';
import SceneButton from './SceneButton';
import Image from 'next/image';
import gsap from 'gsap';

export default function PalletDisplay() {
  const containerRef = useRef<HTMLDivElement>(null);
  const finalRef = useRef<HTMLDivElement>(null);
  const sceneRefs = useRef<Record<number, HTMLButtonElement | null>>({});
  const palletTextRef = useRef<HTMLHeadingElement>(null);
  const sceneCountRef = useRef<HTMLParagraphElement>(null);
  const selectSceneRef = useRef<HTMLParagraphElement>(null);
  const palletSuffixRef = useRef<HTMLSpanElement>(null);
  const [isActive, setIsActive] = useState(false);
  const [selectedScene, setSelectedScene] = useState<string | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);

  // PalletDisplayがクリックされたときのアニメーション
  const handleSelfClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isActive && !isAnimating) {
      setIsActive(true);
      setIsAnimating(true);
      gsap.to(containerRef.current, {
        y: -200,
        duration: 0.4,
        ease: 'power2.out',
        onComplete: () => setIsAnimating(false),
      });
      // z-indexを上げる
      if (containerRef.current) {
        containerRef.current.style.zIndex = '20'; // LastRecordDisplayより高く
      }
      // Pallet文字を小さく
      if (palletTextRef.current) {
        gsap.to(palletTextRef.current, {
          fontSize: '1.75rem',
          duration: 0.3,
          ease: 'power2.out',
        });
      }
      // / 12を非表示
      if (palletSuffixRef.current) {
        gsap.to(palletSuffixRef.current, {
          opacity: 0,
          duration: 0.3,
          ease: 'power2.out',
        });
      }
      // シーン数を「12シーン」に変更し下に移動
      if (sceneCountRef.current) {
        sceneCountRef.current.textContent = '12シーン';
        gsap.to(sceneCountRef.current, {
          y: -8,
          opacity: 1,
          duration: 0.3,
          ease: 'power2.out',
        });
      }
      // 「シーンを選択してください」をふわっと表示
      if (selectSceneRef.current) {
        gsap.to(selectSceneRef.current, {
          opacity: 1,
          fontSize: '1rem',
          duration: 0.3,
          ease: 'power2.out',
        });
      }
    }
  };

  // 外部クリックで下に戻す
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        if (isActive && !isAnimating) {
          setIsActive(false);
          setIsAnimating(true);
          gsap.to(containerRef.current, {
            y: 0,
            duration: 0.4,
            ease: 'power2.out',
            onComplete: () => {
              setIsAnimating(false);
              // z-indexを元に戻す
              if (containerRef.current) {
                containerRef.current.style.zIndex = '10';
              }
            },
          });
          // Pallet文字を大きく
          if (palletTextRef.current) {
            gsap.to(palletTextRef.current, {
              fontSize: '2rem',
              duration: 0.3,
              ease: 'power2.out',
            });
          }
          // / 12を半透明で表示
          if (palletSuffixRef.current) {
            gsap.to(palletSuffixRef.current, {
              opacity: 0.5,
              duration: 0.3,
              ease: 'power2.out',
            });
          }
          // シーン数を非表示
          if (sceneCountRef.current) {
            gsap.to(sceneCountRef.current, {
              y: 0,
              opacity: 0,
              duration: 0.3,
              ease: 'power2.out',
            });
          }
          // 「シーンを選択してください」を小さくしてふわっと非表示
          if (selectSceneRef.current) {
            gsap.to(selectSceneRef.current, {
              opacity: 0,
              fontSize: '0.875rem',
              duration: 0.3,
              ease: 'power2.out',
            });
          }
        }
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [isActive, isAnimating]);

  // SceneButtonクリック時のアニメーション
  const handleSceneClick = (src: string, index: number) => {
    const button = sceneRefs.current[index];
    const final = finalRef.current;
    const container = containerRef.current;

    if (!button || !final || !container || isAnimating) return;

    const startRect = button.getBoundingClientRect();
    const endRect = final.getBoundingClientRect();
    const containerRect = container.getBoundingClientRect();

    const clone = button.cloneNode(true) as HTMLElement;
    clone.style.position = 'absolute';
    clone.style.top = `${startRect.top - containerRect.top}px`;
    clone.style.left = `${startRect.left - containerRect.left}px`;
    clone.style.width = `${startRect.width}px`;
    clone.style.height = `${startRect.height}px`;
    clone.style.zIndex = '1000';
    clone.style.pointerEvents = 'none';
    container.appendChild(clone);

    setIsAnimating(true);

    gsap.to(clone, {
      top: `${endRect.top - containerRect.top}px`,
      left: `${endRect.left - containerRect.left}px`,
      width: `${endRect.width}px`,
      height: `${endRect.height}px`,
      scale: 0.36,
      transformOrigin: 'top left',
      duration: 0.8,
      ease: 'power3.inOut',
      onComplete: () => {
        container.removeChild(clone);
        setSelectedScene(src);
        setIsAnimating(false);
      },
    });
  };

  return (
    <div
      ref={containerRef}
      onClick={handleSelfClick}
      className="relative bg-gray-50 flex flex-col w-full rounded-t-3xl"
      style={{ transform: 'translateY(0px)', zIndex: 10 }} // 初期z-indexを10に設定
    >
      <div className="text-left m-5 mt-4" style={{ fontFamily: 'var(--font-inter)' }}>
        <h1 ref={palletTextRef} className="text-[2rem] font-[900] text-[#222] inline">
          Pallet
          <span
            ref={palletSuffixRef}
            className="text-[2rem] font-[900] text-[#222]"
            style={{ opacity: 0.5 }}
          >
            / 12
          </span>
        </h1>
        <p
          ref={sceneCountRef}
          className="text-[#22222250] text-xl font-[900]"
          style={{ opacity: 0 }}
        >
          12シーン
        </p>
        <p
          ref={selectSceneRef}
          className="text-[#222] mt-2 font-[900]"
          style={{ opacity: 0, fontSize: '0.875rem' }}
        >
          シーンを選択してください
        </p>

        <div
          ref={finalRef}
          className="absolute top-5 right-5 w-[50px] h-[50px] rounded-xl overflow-hidden border-4 border-white"
          style={{
            boxShadow:
              '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
          }}
        >
          {selectedScene && (
            <Image
              src={selectedScene}
              alt="Selected"
              width={50}
              height={50}
              className="rounded-lg object-cover"
            />
          )}
        </div>
      </div>

      <div className="w-full">
        <div className="overflow-x-auto whitespace-nowrap pb-4">
          <div className="flex space-x-4 m-6">
            {['/image.png', '/image.png', '/image.png'].map((src, index) => (
              <SceneButton
                key={index}
                src={src}
                alt={`Scene ${index + 1}`}
                onClick={() => handleSceneClick(src, index)}
                ref={(el) => (sceneRefs.current[index] = el)}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}