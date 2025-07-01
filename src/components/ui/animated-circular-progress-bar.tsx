"use client";

import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface AnimatedCircularProgressBarProps {
  max: number;
  min?: number;
  value: number;
  gaugePrimaryColor?: string;
  gaugeSecondaryColor?: string;
  className?: string;
}

export default function AnimatedCircularProgressBar({
  max = 100,
  min = 0,
  value = 0,
  gaugePrimaryColor = "#3b82f6",
  gaugeSecondaryColor = "#e5e7eb",
  className,
}: AnimatedCircularProgressBarProps) {
  const circumference = 2 * Math.PI * 45;
  const percentPx = circumference / 100;
  const currentPercent = ((value - min) / (max - min)) * 100;

  return (
    <div
      className={cn(
        "relative size-40 text-2xl font-semibold",
        className,
      )}
      style={
        {
          "--circle-size": "100px",
          "--circumference": circumference,
          "--percent-to-px": `${percentPx}px`,
        } as React.CSSProperties
      }
    >
      <svg
        fill="none"
        className="size-full"
        strokeWidth="2"
        viewBox="0 0 100 100"
      >
        {gaugeSecondaryColor && (
          <circle
            cx="50"
            cy="50"
            r="45"
            stroke={gaugeSecondaryColor}
            strokeWidth="10"
            className="opacity-20"
          />
        )}
        <motion.circle
          cx="50"
          cy="50"
          r="45"
          stroke={gaugePrimaryColor}
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={circumference}
          transform="rotate(-90 50 50)"
          initial={{ strokeDashoffset: circumference }}
          animate={{
            strokeDashoffset: circumference - (currentPercent / 100) * circumference,
          }}
          transition={{
            duration: 1,
            ease: "easeInOut",
          }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <motion.span
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="text-xl font-bold"
        >
          {Math.round(currentPercent)}%
        </motion.span>
      </div>
    </div>
  );
} 