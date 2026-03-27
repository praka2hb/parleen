"use client";

import { motion, useTransform, useSpring, type MotionValue } from "framer-motion";

type BackgroundTransitionProps = {
  scrollProgress: MotionValue<number>;
};

/**
 * Dynamic background that transitions through tones matching
 * the page's existing color theme (--dark: #0d0d0d, --accent: #e8c49a).
 *
 * All colors stay within the dark cinematic palette of the portfolio,
 * using warm accent tones for subtle radial highlights.
 */
export default function BackgroundTransition({ scrollProgress }: BackgroundTransitionProps) {
  const bg = useTransform(
    scrollProgress,
    [0, 0.35, 0.7, 1],
    [
      "#0d0d0d",   // --dark (matches intro)
      "#2a2824",   // shifting to warm grey
      "#dfd8cb",   // soft warm light grey
      "#f2ebdf",   // yellowish-white cream
    ]
  );

  /* Subtle warm accent radial glow */
  const glowOpacity = useTransform(
    scrollProgress,
    [0, 0.15, 0.4, 0.65, 0.85, 1],
    [0.15, 0.3, 0.12, 0.25, 0.2, 0.1]
  );
  const smoothGlowOpacity = useSpring(glowOpacity, { stiffness: 50, damping: 25 });

  /* Film grain / noise overlay opacity */
  const grainOpacity = useTransform(
    scrollProgress,
    [0, 0.5, 1],
    [0.025, 0.04, 0.025]
  );

  return (
    <>
      {/* Base color layer */}
      <motion.div
        className="hg-bg-base"
        style={{ backgroundColor: bg }}
      />

      {/* Warm accent radial glow — uses --accent color */}
      <motion.div
        className="hg-bg-radial"
        style={{ opacity: smoothGlowOpacity }}
      />

      {/* Film grain overlay */}
      <motion.div
        className="hg-bg-grain"
        style={{ opacity: grainOpacity }}
      />
    </>
  );
}
