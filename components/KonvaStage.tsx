// path: /components/KonvaStage.tsx

"use client";
import { useRef, useEffect, useState } from "react";
import { Stage, Layer, Image as KonvaImage, Rect } from "react-konva";
import useImage from "use-image";
import { Transformer } from "react-konva";
import gsap from "gsap";
import { useAnalysisStore } from '@/stores/useAnalysisStore';

export default function KonvaStage({
  imageUrl,
  onRectChange,
}: {
  imageUrl: string;
  onRectChange: (rect: { x: number; y: number; width: number; height: number; rotation: number }) => void; // rotation を追加
}) {
  const [image] = useImage(imageUrl);
  const [rect, setRect] = useState({ x: 0, y: 0, width: 100, height: 100, rotation: 0 });
  const rectRef = useRef<any>(null);
  const trRef = useRef<any>(null);
  const [stageSize, setStageSize] = useState({ width: 300, height: 300 });
  const [imageSize, setImageSize] = useState({ width: 0, height: 0 });

  // ウィンドウサイズに基づくステージサイズの更新
  useEffect(() => {
    const updateSize = () => {
      const vw = window.innerWidth * 0.8 - 32;
      setStageSize({ width: vw, height: vw });
    };
    updateSize();
    window.addEventListener("resize", updateSize);
    return () => window.removeEventListener("resize", updateSize);
  }, []);

  // 画像サイズの計算と選択範囲の初期位置設定
  useEffect(() => {
    if (image) {
      const aspectRatio = image.width / image.height;
      const stageAspectRatio = stageSize.width / stageSize.height;

      let newWidth, newHeight;
      if (aspectRatio > stageAspectRatio) {
        newHeight = stageSize.height;
        newWidth = newHeight * aspectRatio;
      } else {
        newWidth = stageSize.width;
        newHeight = newWidth / aspectRatio;
      }

      setImageSize({ width: newWidth, height: newHeight });

      const rectSize = Math.min(newWidth, newWidth) * 0.5;
      const rectX = (stageSize.width - rectSize) / 2;
      const rectY = (stageSize.height - rectSize) / 2;

      setRect({
        x: rectX,
        y: rectY,
        width: rectSize,
        height: rectSize,
        rotation: 0,
      });
    }
  }, [image, stageSize]);

  useEffect(() => {
    onRectChange(rect);
    useAnalysisStore.getState().setCrop(calculateBoundingBox(rect));
  }, [rect]);

  useEffect(() => {
    if (rectRef.current) {
      gsap.to(rectRef.current, {
        dashOffset: -50,
        duration: 1,
        repeat: -1,
        ease: "none",
      });
      gsap.to(rectRef.current, {
        shadowColor: "rgba(255, 255, 255, 0.8)",
        shadowBlur: 10,
        shadowOffsetX: 0,
        shadowOffsetY: 0,
        shadowOpacity: 0.5,
        repeat: -1,
        yoyo: true,
        duration: 1,
        ease: "sine.inOut",
      });
    }
  }, []);

  useEffect(() => {
    if (trRef.current && rectRef.current) {
      trRef.current.nodes([rectRef.current]);
      trRef.current.getLayer()?.batchDraw();
    }
  }, []);

  // 回転後のBounding Boxを計算
  const calculateBoundingBox = (rect: { x: number; y: number; width: number; height: number; rotation: number }) => {
    const { x, y, width, height, rotation } = rect;
    const rad = (rotation * Math.PI) / 180; // 度数をラジアンに変換
    const cos = Math.cos(rad);
    const sin = Math.sin(rad);

    // 4つのコーナー座標を計算
    const corners = [
      { x: x, y: y }, // 左上
      { x: x + width * cos, y: y + width * sin }, // 右上（幅方向の回転を考慮）
      { x: x + width * cos - height * sin, y: y + width * sin + height * cos }, // 右下
      { x: x - height * sin, y: y + height * cos }, // 左下
    ].map(({ x: cx, y: cy }) => ({
      x: x + (cx - x) * cos - (cy - y) * sin,
      y: y + (cx - x) * sin + (cy - y) * cos,
    }));

    // 最小/最大座標を求める
    const minX = Math.min(...corners.map(c => c.x));
    const maxX = Math.max(...corners.map(c => c.x));
    const minY = Math.min(...corners.map(c => c.y));
    const maxY = Math.max(...corners.map(c => c.y));

    console.log("Calculated Bounding Box:", { x1: minX, y1: minY, x2: maxX, y2: maxY }); // デバッグログ

    return { x1: minX, y1: minY, x2: maxX, y2: maxY };
  };

  return (
    <div className="rounded-4xl border-16 border-[#ffffff30] w-full h-full ring-2 ring-[#ffffff40] overflow-hidden">
      <Stage width={stageSize.width} height={stageSize.height}>
        <Layer>
          {image && (
            <KonvaImage
              image={image}
              width={imageSize.width}
              height={imageSize.height}
              x={(stageSize.width - imageSize.width) / 2}
              y={(stageSize.height - imageSize.height) / 2}
              shadowOffset={{ x: 0, y: 0 }}
              cornerRadius={32}
            />
          )}
          <Rect
            ref={rectRef}
            {...rect}
            stroke="#ffffff"
            strokeWidth={2}
            dash={[10, 5]}
            dashOffset={0}
            cornerRadius={10}
            draggable
            rotation={rect.rotation}
            onDragEnd={(e) => {
              setRect((prev) => ({
                ...prev,
                x: e.target.x(),
                y: e.target.y(),
              }));
            }}
            onTransformEnd={(e) => {
              const node = e.target;
              const scaleX = node.scaleX();
              const scaleY = node.scaleY();
              const rotation = node.rotation();
              node.scaleX(1);
              node.scaleY(1);
              setRect({
                x: node.x(),
                y: node.y(),
                width: Math.max(5, node.width() * scaleX),
                height: Math.max(5, node.height() * scaleY),
                rotation,
              });
            }}
          />
          <Transformer
            ref={trRef}
            boundBoxFunc={(oldBox, newBox) => {
              if (newBox.width < 5 || newBox.height < 5) {
                return oldBox;
              }
              return newBox;
            }}
          />
        </Layer>
      </Stage>
    </div>
  );
}