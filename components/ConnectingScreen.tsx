'use client';
import { useEffect, useRef } from 'react';
import BackgroundController from '@/components/BackgroundController';
import Image from 'next/image';
import { gsap } from 'gsap';
import { useAnalysisStore } from '@/stores/useAnalysisStore';

interface ConnectingScreenProps {
  handleFirstScreenClick: () => void;
}

export default function ConnectingScreen({ handleFirstScreenClick }: ConnectingScreenProps) {
  const loadingIconRef = useRef(null);
  const logoRef = useRef(null);
  const textRef = useRef(null);
  const subTextRef = useRef(null);
  const containerRef = useRef(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const isMinDurationElapsed = useRef(false);

  useEffect(() => {
    // Animation for the container (fade in and slide up)
    gsap.fromTo(
      containerRef.current,
      { opacity: 0, y: 0 },
      { opacity: 1, y: 0, duration: 1, ease: 'power2.out' }
    );

    // Existing animation for the internal elements
    const tl = gsap.timeline({ repeat: -1, repeatDelay: 0.5 });

    gsap.set([logoRef.current, loadingIconRef.current, subTextRef.current], { opacity: 0, x: 100 });

    tl.fromTo(
      logoRef.current,
      { x: 100, opacity: 0 },
      { x: 0, opacity: 1, duration: 0.8, ease: 'power2.out' },
      0
    )
      .fromTo(
        loadingIconRef.current,
        { x: 100, opacity: 0 },
        { x: 0, opacity: 1, duration: 0.8, ease: 'power2.out' },
        0.2
      )
      .fromTo(
        textRef.current,
        { x: 100, opacity: 0 },
        { x: 0, opacity: 1, duration: 0.8, ease: 'power2.out' },
        0.4
      )
      .fromTo(
        subTextRef.current,
        { x: 100, opacity: 0 },
        { x: 0, opacity: 1, duration: 0.8, ease: 'power2.out' },
        0.6
      )
      .to({}, { duration: 1.5 })
      .to(
        logoRef.current,
        { x: -100, opacity: 0, duration: 0.8, ease: 'power2.in' },
        2.3
      )
      .to(
        loadingIconRef.current,
        { x: -100, opacity: 0, duration: 0.8, ease: 'power2.in' },
        2.5
      )
      .to(
        textRef.current,
        { x: -100, opacity: 0, duration: 0.8, ease: 'power2.in' },
        2.7
      )
      .to(
        subTextRef.current,
        { x: -100, opacity: 0, duration: 0.8, ease: 'power2.in' },
        2.9
      );

    // Set a timer to ensure minimum 10-second display
    timerRef.current = setTimeout(() => {
      isMinDurationElapsed.current = true;
      // Check if response is already received
      const { resultFile, danger } = useAnalysisStore.getState();
      if (resultFile && danger !== null) {
        handleFirstScreenClick();
      }
    }, 10000); // 10 seconds

    // Periodically check for API response
    const checkCompletion = () => {
      const { resultFile, danger } = useAnalysisStore.getState();
      // Only close if minimum duration has elapsed and response is received
      if (isMinDurationElapsed.current && resultFile && danger !== null) {
        if (timerRef.current) {
          clearTimeout(timerRef.current);
        }
        handleFirstScreenClick();
      }
    };
    const interval = setInterval(checkCompletion, 500); // Check every 0.5 seconds

    // Cleanup
    return () => {
      tl.kill();
      if (timerRef.current) clearTimeout(timerRef.current);
      clearInterval(interval);
    };
  }, [handleFirstScreenClick]);

  return (
    <div ref={containerRef} className="fixed top-0 z-50 w-screen h-dvh">
      <BackgroundController>
        <div
          className="inset-0 flex flex-col items-center justify-center"
          onClick={handleFirstScreenClick}
        >
          <img
            ref={logoRef}
            src="/aidentify.svg"
            alt="Aidentify #3.0.1"
            className="mb-4 w-full"
          />
          <h1
            ref={loadingIconRef}
            className="text-8xl my-[10vh]"
            style={{
              background: 'linear-gradient(to right, rgba(255, 255, 255, 1), rgba(255, 255, 255, 0.3))',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            <Image src="/<<<.svg" alt="<<<" width={150} height={150} />
          </h1>
          <div ref={textRef} className="flex items-center space-x-4 mb-4">
            <div>
              <Image src="/person-bounding.svg" alt="Person Bounding" width={35} height={35} />
            </div>
            <h2 className="text-3xl font-semibold text-white">個人情報を保護中</h2>
          </div>
          <p ref={subTextRef} className="text-[#ffffff70] font-bold text-lg mb-[20vh]">
            AI鯖と通信しています...
          </p>
        </div>
      </BackgroundController>
    </div>
  );
}