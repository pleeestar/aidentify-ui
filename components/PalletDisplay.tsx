// path: /components/PalletDisplay.tsx

'use client';

import { useRef, useState, useEffect } from 'react';
import SceneButton from './SceneButton';
import Image from 'next/image';
import gsap from 'gsap';
import { useAnalysisStore } from '@/stores/useAnalysisStore';

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

  const setScene = useAnalysisStore((state) => state.setScene);

  const handleSelfClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isActive && !isAnimating) {
      setIsActive(true);
      setIsAnimating(true);
      gsap.to(containerRef.current, {
        y: -230,
        duration: 0.4,
        ease: 'power2.out',
        onComplete: () => setIsAnimating(false),
      });
      if (containerRef.current) {
        containerRef.current.style.zIndex = '20';
      }
      if (palletTextRef.current) {
        gsap.to(palletTextRef.current, {
          fontSize: '1.75rem',
          duration: 0.3,
          ease: 'power2.out',
        });
      }
      if (palletSuffixRef.current) {
        gsap.to(palletSuffixRef.current, {
          opacity: 0,
          duration: 0.3,
          ease: 'power2.out',
        });
      }
      if (sceneCountRef.current) {
        sceneCountRef.current.textContent = '12シーン';
        gsap.to(sceneCountRef.current, {
          y: -8,
          opacity: 1,
          duration: 0.3,
          ease: 'power2.out',
        });
      }
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
              if (containerRef.current) {
                containerRef.current.style.zIndex = '10';
              }
            },
          });
          if (palletTextRef.current) {
            gsap.to(palletTextRef.current, {
              fontSize: '2rem',
              duration: 0.3,
              ease: 'power2.out',
            });
          }
          if (palletSuffixRef.current) {
            gsap.to(palletSuffixRef.current, {
              opacity: 0.5,
              duration: 0.3,
              ease: 'power2.out',
            });
          }
          if (sceneCountRef.current) {
            gsap.to(sceneCountRef.current, {
              y: 0,
              opacity: 0,
              duration: 0.3,
              ease: 'power2.out',
            });
          }
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

  const handleSceneClick = (src: string, index: number, label: string) => {
    setScene(label);
    console.log("Scene selected:", label);

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
    clone.style.height = `${startRect.height}px`; // 修正済み（typo: .clone -> clone）
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
      style={{ transform: 'translateY(0px)', zIndex: 10 }}
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
          className="text-[#222] font-[900]"
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
          <div className="flex space-x-4 mb-6 mx-6">
            {['自然に注目', '町に注目', '人物に注目'].map((text, index) => (
              <SceneButton
                key={index}
                src={`/${text}.png`}
                alt={`Scene ${index + 1}`}
                onClick={() => handleSceneClick(`/${text}.png`, index, text)}
                ref={(el: HTMLButtonElement | null) => {
                  sceneRefs.current[index] = el;
                }}
                ImageText={text}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}