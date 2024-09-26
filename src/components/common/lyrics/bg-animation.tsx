import React, { useEffect, useRef, useState } from "react";
import {
  circleTransition,
  topToBottomTransition,
  leftToRightTransition,
  diagonalTransition,
  radialExpansionTransition,
  fadeOutRotateTransition,
  waveTransition,
  spiralTransition,
} from "@/lib/animations/bg-transition";

interface BackgroundTransitionProps {
  targetColor?: string;
  transitionType?:
    | "circle"
    | "topToBottom"
    | "leftToRight"
    | "diagonalTransition"
    | "radialExpansionTransition"
    | "fadeInZoomTransition"
    | "fadeOutRotateTransition"
    | "waveTransition"
}

const BackgroundTransition: React.FC<BackgroundTransitionProps> = ({
  targetColor,
  transitionType = "circle",
}) => {
  const bgRef = useRef<HTMLDivElement | null>(null);
  const svgRef = useRef<SVGSVGElement | null>(null);
  const overlayRef = useRef<HTMLDivElement | null>(null);
  const [currentColor, setCurrentColor] = useState<string>("");

  useEffect(() => {
    if (bgRef.current && targetColor) {
      const onComplete = () => {
        setCurrentColor(targetColor);
      };

      switch (transitionType) {
        case "circle":
          if (svgRef.current) {
            circleTransition(svgRef.current, targetColor, onComplete);
          }
          break;
        case "topToBottom":
          if (overlayRef.current) {
            topToBottomTransition(overlayRef.current, targetColor, onComplete);
          }
          break;
        case "leftToRight":
          if (overlayRef.current) {
            leftToRightTransition(overlayRef.current, targetColor, onComplete);
          }
          break;
        case "diagonalTransition":
          if (overlayRef.current) {
            diagonalTransition(overlayRef.current, targetColor, onComplete);
          }
          break;
        case "radialExpansionTransition":
          if (overlayRef.current) {
            radialExpansionTransition(
              overlayRef.current,
              targetColor,
              onComplete
            );
          }
          break;
        case "waveTransition":
          if (overlayRef.current) {
            waveTransition(overlayRef.current, targetColor, onComplete);
          }
          break;
    
      }
    }
  }, [targetColor, transitionType]);

  return (
    <div
      ref={bgRef}
      className="fixed -z-0 top-0 left-0 flex justify-center items-center duration-300 transition-colors"
      style={{
        zIndex: -1,
        width: "100vw",
        height: "100vh",
        backgroundColor: currentColor,
        overflow: "hidden",
      }}
    >
      <svg
        ref={svgRef}
        width="100%"
        height="100%"
        style={{ position: "absolute", top: 0, left: 0 }}
      />
      <div ref={overlayRef} />
    </div>
  );
};

export default BackgroundTransition;
