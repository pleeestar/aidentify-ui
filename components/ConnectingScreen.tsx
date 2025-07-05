// path: /components/ConnectingScreen.tsx

'use client';

import { useEffect, useRef } from 'react';
import BackgroundController from '@/components/BackgroundController';
import Image from 'next/image';
import { gsap } from 'gsap';

export default function ConnectingScreen() {
  const loadingIconRef = useRef(null);
  const logoRef = useRef(null);
  const textRef = useRef(null);
  const subTextRef = useRef(null);
  const containerRef = useRef(null);

  // アニメーションの設定
  useEffect(() => {
    console.log('ConnectingScreen: マウント', new Date().toISOString());

    // コンテナのアニメーション（フェードインとスライドアップ）
    gsap.fromTo(
      containerRef.current,
      { opacity: 0, y: 50 },
      { opacity: 1, y: 0, duration: 0.8, ease: 'power2.out' }
    );

    // 内部要素のアニメーション
    const tl = gsap.timeline({ repeat: -1, repeatDelay: 0.3 });

    gsap.set([logoRef.current, loadingIconRef.current, textRef.current, subTextRef.current], { opacity: 0, x: 50 });

    tl.fromTo(
      logoRef.current,
      { x: 50, opacity: 0 },
      { x: 0, opacity: 1, duration: 0.6, ease: 'power2.out' },
      0
    )
      .fromTo(
        loadingIconRef.current,
        { x: 50, opacity: 0 },
        { x: 0, opacity: 1, duration: 0.6, ease: 'power2.out' },
        0.15
      )
      .fromTo(
        textRef.current,
        { x: 50, opacity: 0 },
        { x: 0, opacity: 1, duration: 0.6, ease: 'power2.out' },
        0.3
      )
      .fromTo(
        subTextRef.current,
        { x: 50, opacity: 0 },
        { x: 0, opacity: 1, duration: 0.6, ease: 'power2.out' },
        0.45
      )
      .to({}, { duration: 1.2 })
      .to(
        logoRef.current,
        { x: -50, opacity: 0, duration: 0.6, ease: 'power2.in' },
        2.1
      )
      .to(
        loadingIconRef.current,
        { x: -50, opacity: 0, duration: 0.6, ease: 'power2.in' },
        2.25
      )
      .to(
        textRef.current,
        { x: -50, opacity: 0, duration: 0.6, ease: 'power2.in' },
        2.4
      )
      .to(
        subTextRef.current,
        { x: -50, opacity: 0, duration: 0.6, ease: 'power2.in' },
        2.55
      );

    // クリーンアップ
    return () => {
      console.log('ConnectingScreen: クリーンアップ', new Date().toISOString());
      tl.kill();
    };
  }, []);

  return (
    <div ref={containerRef} className="fixed top-0 z-50 w-screen h-dvh">
      <BackgroundController>
        <div
          className="inset-0 flex flex-col items-center justify-center"
          onClick={() => console.log('ConnectingScreen: クリックされたが、アクションなし')}
        >
          <img
            ref={logoRef}
            src="/aidentify.svg"
            alt="Aidentify #3.0.1"
            className="mb-4 w-full max-w-[300px]"
          />
          <h1
            ref={loadingIconRef}
            className="text-6xl my-[8vh]"
            style={{
              background: 'linear-gradient(to right, rgba(255, 255, 255, 1), rgba(255, 255, 255, 0.3))',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            <Image src="/<<<.svg" alt="Loading" width={120} height={120} />
          </h1>
          <div ref={textRef} className="flex items-center space-x-4 mb-4">
            <div>
              <Image src="/person-bounding.svg" alt="Person Bounding" width={30} height={30} />
            </div>
            <h2 className="text-2xl font-semibold text-white">個人情報を保護中</h2>
          </div>
          <p ref={subTextRef} className="text-[#ffffff70] font-bold text-base mb-[15vh]">
            AI鯖と通信しています...
          </p>
        </div>
      </BackgroundController>
    </div>
  );
}
