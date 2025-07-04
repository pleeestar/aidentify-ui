// path: /components/ImageInteractionManager.tsx

'use client';
import { useRef, useState, useEffect } from "react";
import gsap from "gsap";
import dynamic from "next/dynamic";
import { useSwipeable } from "react-swipeable";
import Image from 'next/image';
import { useAnalysisStore, getAnalysisStoreActions } from '@/stores/useAnalysisStore';
import imageCompression from 'browser-image-compression';

const KonvaStage = dynamic(() => import("@/components/KonvaStage"), { ssr: false });

type Mode = "crop" | "controller" | "auto";

interface ImageInteractionManagerProps {
  uploadedFile: File | null;
  onClose: () => void;
  onPlay?: () => void;
}

const modes: Mode[] = ["crop", "controller", "auto"];
const getNextMode = (current: Mode): Mode => {
  const currentIndex = modes.indexOf(current);
  return modes[(currentIndex + 1) % modes.length];
};
const getPrevMode = (current: Mode): Mode => {
  const currentIndex = modes.indexOf(current);
  return modes[(currentIndex - 1 + modes.length) % modes.length];
};

const modeIcons: Record<Mode, string> = {
  crop: "/cropIcon.svg",
  controller: "/controllerIcon.svg",
  auto: "/autoIcon.svg",
};

export default function ImageInteractionManager({ uploadedFile, onClose, onPlay }: ImageInteractionManagerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const modeNameRef = useRef<HTMLDivElement>(null);
  const modeIconRef = useRef<HTMLImageElement>(null);
  const sliderRef = useRef<HTMLDivElement>(null);
  const valueDisplayRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [state, setState] = useState<{
    mode: Mode;
    prevMode: Mode;
    selectedRect: { x: number; y: number; width: number; height: number; rotation: number } | null;
    sliderValue: number;
    imageURL: string;
    isSliding: boolean;
  }>({
    mode: "crop",
    prevMode: "crop",
    selectedRect: null,
    sliderValue: 50,
    imageURL: "",
    isSliding: false,
  });

  useEffect(() => {
    if (!uploadedFile) return;

    const url = URL.createObjectURL(uploadedFile);
    setState((prev) => ({ ...prev, imageURL: url }));

    gsap.fromTo(
      containerRef.current,
      { y: "100vh", opacity: 0 },
      { y: 0, opacity: 1, duration: 0.5, ease: "power2.out" }
    );

    return () => URL.revokeObjectURL(url);
  }, [uploadedFile]);

  const animateModeChange = (oldMode: Mode, newMode: Mode): Promise<void> =>
    new Promise((resolve) => {
      const capitalizedOldMode = oldMode.charAt(0).toUpperCase() + oldMode.slice(1);
      const capitalizedNewMode = newMode.charAt(0).toUpperCase() + newMode.slice(1);
      const newIcon = modeIcons[newMode];

      if (modeNameRef.current && modeIconRef.current) {
        modeNameRef.current.textContent = capitalizedOldMode;
        gsap.to([modeNameRef.current, modeIconRef.current], {
          y: -20,
          opacity: 0,
          duration: 0.3,
          ease: "power2.in",
          onComplete: () => {
            if (modeNameRef.current && modeIconRef.current) {
              modeNameRef.current.textContent = capitalizedNewMode;
              modeIconRef.current.src = newIcon;
              gsap.fromTo(
                [modeNameRef.current, modeIconRef.current],
                { y: 20, opacity: 0 },
                {
                  y: 0,
                  opacity: 1,
                  duration: 0.3,
                  ease: "power2.out",
                  onComplete: resolve,
                }
              );
            } else {
              resolve();
            }
          },
        });
      } else {
        resolve();
      }
    });

  const switchMode = (getMode: (current: Mode) => Mode) => {
    const newMode = getMode(state.mode);
    const index = modes.indexOf(newMode);

    if (newMode !== "controller" && sliderRef.current) {
      gsap.to(sliderRef.current, {
        opacity: 0,
        y: 20,
        duration: 0.3,
        ease: "power2.in",
      });
    } else if (newMode === "controller" && sliderRef.current) {
      gsap.to(sliderRef.current, {
        opacity: 1,
        y: 0,
        duration: 0.3,
        ease: "power2.out",
      });
    }

    gsap.to(contentRef.current, {
      x: `-${index * 85}vw`,
      duration: 0.5,
      ease: "power2.out",
      onComplete: () => {
        if (index * 85 > 180) {
          gsap.set(contentRef.current, { x: "0vw" });
        }
      },
    });
    animateModeChange(state.mode, newMode).then(() =>
      setState((prev) => ({ ...prev, mode: newMode, prevMode: prev.mode }))
    );
    useAnalysisStore.getState().setMode(newMode);
  };

  const handleClose = () => {
    gsap.to(containerRef.current, {
      y: "100vh",
      opacity: 0,
      duration: 0.5,
      ease: "power2.in",
      onComplete: onClose,
    });
  };

  const handlers = useSwipeable({
    onSwipedLeft: () => switchMode(getNextMode),
    onSwipedRight: () => switchMode(getPrevMode),
    delta: 10,
  });

  const handlePlay = async () => {
    const { file, scene, mode, sliderValue, cropRect, setResult, setIsProcessing } = useAnalysisStore.getState();

    console.log('ImageInteractionManager: handlePlay called', { file: file?.name, scene, mode, sliderValue, cropRect });

    if (!file || !scene) {
      console.warn('ImageInteractionManager: file or scene not set');
      alert('ファイルまたはシーンが選択されていません。');
      return;
    }

    setIsProcessing(true); // 処理開始をマーク

    const formData = new FormData();
    formData.append('file', file);
    formData.append('scene', scene);
    formData.append('mode', mode);

    if (mode === 'controller') {
      formData.append('risk_level', sliderValue.toString());
    } else if (mode === 'crop' && cropRect) {
      formData.append('rect', JSON.stringify(cropRect));
    }

    console.log('ImageInteractionManager: Sending formData', Array.from(formData.entries()));

    // ImageInteractionManager.tsx の handlePlay 内
    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        console.error('ImageInteractionManager: API request failed', { status: res.status, statusText: res.statusText });
        alert(`分析に失敗しました: ${res.statusText}`);
        setIsProcessing(false);
        return;
      }

      const blob = await res.blob();
      const dangerHeader = res.headers.get('x-danger');
      const danger = dangerHeader ? Number(dangerHeader) : 0;

      console.log('ImageInteractionManager: API response', { dangerHeader, danger });

      const resultFile = new File([blob], 'result.jpg', { type: blob.type });
      setResult(resultFile, danger);
      setIsProcessing(false); // 成功時にも false に設定
      console.log('ImageInteractionManager: setResult called', { resultFile: resultFile.name, danger });

      if (onPlay) {
        console.log('ImageInteractionManager: Calling onPlay');
        onPlay();
      }
    } catch (error) {
      console.error('ImageInteractionManager: Error during API request', error);
      alert('サーバーとの通信に失敗しました。もう一度お試しください。');
      setIsProcessing(false);
    }
  };

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = parseInt(e.target.value);
    setState((prev) => ({ ...prev, sliderValue: newValue }));
    useAnalysisStore.getState().setSliderValue(newValue);

    if (valueDisplayRef.current) {
      valueDisplayRef.current.textContent = `hide-ness: ${newValue}`;

      if (!state.isSliding) {
        setState((prev) => ({ ...prev, isSliding: true }));
        gsap.fromTo(
          valueDisplayRef.current,
          { y: 20, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.3, ease: "power2.out" }
        );
      }

      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        if (valueDisplayRef.current) {
          gsap.to(valueDisplayRef.current, {
            y: -20,
            opacity: 0,
            duration: 0.3,
            ease: "power2.in",
            onComplete: () => {
              setState((prev) => ({ ...prev, isSliding: false }));
            },
          });
        }
      }, 300);
    }
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    useAnalysisStore.getState().setMode(state.mode);
    useAnalysisStore.getState().setCrop(state.selectedRect ? calculateBoundingBox(state.selectedRect) : null);
  }, [state.mode, state.selectedRect]);

  const calculateBoundingBox = (rect: { x: number; y: number; width: number; height: number; rotation: number }) => {
    const { x, y, width, height, rotation } = rect;
    const rad = (rotation * Math.PI) / 180;
    const cos = Math.cos(rad);
    const sin = Math.sin(rad);

    const corners = [
      { x: x, y: y },
      { x: x + width * cos, y: y + width * sin },
      { x: x + width * cos - height * sin, y: y + width * sin + height * cos },
      { x: x - height * sin, y: y + height * cos },
    ].map(({ x: cx, y: cy }) => ({
      x: x + (cx - x) * cos - (cy - y) * sin,
      y: y + (cx - x) * sin + (cy - y) * cos,
    }));

    const minX = Math.min(...corners.map(c => c.x));
    const maxX = Math.max(...corners.map(c => c.x));
    const minY = Math.min(...corners.map(c => c.y));
    const maxY = Math.max(...corners.map(c => c.y));

    console.log("ImageInteractionManager: Calculated Bounding Box", { x1: minX, y1: minY, x2: maxX, y2: maxY });

    return { x1: minX, y1: minY, x2: maxX, y2: maxY };
  };

  const isReady = !!uploadedFile && !!useAnalysisStore.getState().scene;

  console.log("ImageInteractionManager: isReady", { isReady, uploadedFile: uploadedFile?.name, scene: useAnalysisStore.getState().scene });

  if (!uploadedFile) return null;

  return (
    <div
      className="fixed inset-x-0 top-0 w-screen h-[calc(100vh-65px)] overflow-hidden bg-black z-10"
      {...handlers}
      ref={containerRef}
    >
      <div className="absolute top-4 left-4 flex items-center space-x-4 z-30 pointer-events-auto">
        <button
          onClick={handleClose}
          className="flex items-center bg-black/50 px-1 py-2 rounded-lg hover:bg-black/70"
        >
          <Image src="/back.svg" alt="Back" width={32} height={32} className="mr-2" />
          <span className="text-white text-3xl font-bold" style={{ fontFamily: 'var(--font-inter)' }}>
            Select
          </span>
        </button>
      </div>

      <div className="absolute top-6 right-6 z-30 pointer-events-auto">
        <button
          onClick={handleClose}
          className="bg-white p-2 rounded-full hover:bg-gray-200"
        >
          <Image src="/close.svg" alt="Close" width={24} height={24} />
        </button>
      </div>

      <div className="absolute top-[calc(50%-40vw-48px)] left-[10vw] flex items-center space-x-2 z-30 pointer-events-none">
        <Image
          ref={modeIconRef}
          src={modeIcons[state.mode]}
          alt={`${state.mode} icon`}
          width={24}
          height={24}
        />
        <div
          ref={modeNameRef}
          className="text-2xl text-white"
          style={{ fontFamily: 'var(--font-inter)' }}
        >
          {state.mode.charAt(0).toUpperCase() + state.mode.slice(1)}
        </div>
      </div>

      <div className="fixed left-0 top-0 h-full flex items-center z-20 pointer-events-none">
        <button
          onClick={() => state.mode !== "crop" && switchMode(getPrevMode)}
          className={`backdrop-blur-sm bg-black/50 pl-2 pr-3 py-5 rounded-r-lg pointer-events-auto ${state.mode === "crop" ? "opacity-50 cursor-not-allowed" : ""}`}
        >
          <Image src="/chevron-left.svg" alt="<" width={21.5} height={70} />
        </button>
      </div>

      <div className="fixed right-0 top-0 h-full flex items-center z-20 pointer-events-none">
        <button
          onClick={() => state.mode !== "auto" && switchMode(getNextMode)}
          className={`backdrop-blur-sm bg-black/50 pl-3 pr-2 py-5 rounded-l-lg pointer-events-auto ${state.mode === "auto" ? "opacity-50 cursor-not-allowed" : ""}`}
        >
          <Image src="/chevron-right.svg" alt=">" width={21.5} height={70} />
        </button>
      </div>

      <div ref={contentRef} className="flex w-[270vw] h-full">
        <div className="w-[80vw] h-full flex flex-col items-start justify-center relative mr-[2.5vw] ml-[10vw]">
          {state.imageURL && (
            <div className="relative w-[80vw] h-[80vw]">
              <KonvaStage
                imageUrl={state.imageURL}
                onRectChange={(rect) => {
                  console.log("ImageInteractionManager: onRectChange called", rect);
                  setState((prev) => ({ ...prev, selectedRect: rect }));
                }}
              />
            </div>
          )}
        </div>

        <div className="w-[80vw] h-full flex flex-col items-start justify-center relative mx-[2.5vw]">
          {state.imageURL && (
            <div className="relative w-[80vw] h-[80vw]">
              <img
                src={state.imageURL}
                alt="uploaded"
                className="w-full h-full object-cover rounded-4xl border-16 border-[#ffffff30] ring-2 ring-[#ffffff40]"
              />
            </div>
          )}
        </div>

        <div className="w-[80vw] h-full flex flex-col items-start justify-center relative ml-[2.5vw] mr-[10vw]">
          {state.imageURL && (
            <div className="relative w-[80vw] h-[80vw]">
              <img
                src={state.imageURL}
                alt="uploaded"
                className="w-full h-full object-cover rounded-4xl border-16 border-[#ffffff30] ring-2 ring-[#ffffff40]"
              />
            </div>
          )}
        </div>
      </div>

      <div ref={sliderRef} className="absolute bottom-14 w-[calc(80vw_-_2rem)] left-[calc(2vw_+_1rem)] opacity-0 translate-y-40">
        <div className="flex items-center w-full h-14 rounded-full bg-[#888] px-2 relative border-1 border-[#FFFFFF60]">
          <div className="w-8 h-8 flex ml-2 items-center justify-center z-10">
            <Image src="/eraser.svg" alt="Eraser" width={24} height={24} />
          </div>
          <div className="relative flex-1 h-10 ml-2 rounded-full bg-[#666] flex items-center px-4 border-1 border-[#FFFFFF60]">
            <div className="absolute inset-y-3.5 left-4 right-4 bg-white rounded-full z-0" />
            <input
              type="range"
              min={0}
              max={100}
              value={state.sliderValue}
              onChange={handleSliderChange}
              className="relative z-10 w-full bg-transparent appearance-none"
              style={{ WebkitAppearance: "none" }}
            />
          </div>
        </div>
        <div
          ref={valueDisplayRef}
          className="absolute text-xl text-white opacity-0 left-[calc(50%_+_10vw)] -translate-x-1/2 -top-8 whitespace-nowrap"
          style={{ fontFamily: "var(--font-ibm-plex-mono)" }}
        />
        <style jsx>{`
          input[type="range"]::-webkit-slider-thumb {
            -webkit-appearance: none;
            appearance: none;
            width: 12px;
            height: 24px;
            background: #3D3D3D;
            border-radius: 9999px;
            cursor: pointer;
            margin-top: -7px;
          }
          input[type="range"]::-moz-range-thumb {
            width: 12px;
            height: 24px;
            background: #3D3D3D;
            border-radius: 9999px;
            cursor: pointer;
          }
          input[type="range"]::-webkit-slider-runnable-track {
            height: 10px;
            background: transparent;
          }
          input[type="range"]::-moz-range-track {
            height: 10px;
            background: transparent;
          }
        `}</style>
      </div>

      <div className="absolute bottom-14 right-5 z-20 pointer-events-auto">
        <button
          onClick={handlePlay}
          disabled={!isReady}
          className={`bg-white text-white p-3.5 rounded-full shadow-lg hover:bg-[#ffffffaa] ${!isReady ? "opacity-50 cursor-not-allowed" : ""}`}
        >
          <Image src="/play.svg" alt="Play" width={26} height={26} />
        </button>
      </div>
    </div>
  );
}