"use client";

import { motion, useTransform, useSpring, type MotionValue } from "framer-motion";
import Image from "next/image";
import { useRef, useState } from "react";

export type FloatingImageProps = {
  src: string;
  alt: string;
  width: number;
  height: number;
  /** top position as percentage of canvas height (0–100) */
  top: number;
  /** left position as percentage of canvas width (0–100) */
  left: number;
  /** parallax speed — different speeds create depth layers */
  speed: number;
  /** initial rotation in degrees */
  rotation?: number;
  /** z-index layer */
  zIndex?: number;
  /** image title */
  label?: string;
  /** category tag */
  category?: string;
  /** short description shown below the image */
  description?: string;
  /** parent scroll progress (0→1) */
  scrollProgress: MotionValue<number>;
  /** whether this is a "hero" large image */
  isHero?: boolean;
};

export default function FloatingImage({
  src,
  alt,
  width,
  height,
  top,
  left,
  speed,
  rotation = 0,
  zIndex,
  label,
  category,
  description,
  scrollProgress,
  isHero = false,
}: FloatingImageProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [hovered, setHovered] = useState(false);

  const computedZ = zIndex ?? Math.round(speed * 10) + 1;

  /* ── Per-image parallax inside the horizontal canvas ──
     Each image gets a small extra X offset based on its speed,
     creating depth within the horizontal movement itself.
     Reduced range so images stay closer together. */
  const extraX = useTransform(
    scrollProgress,
    [0, 1],
    [0, (speed - 0.5) * -100]
  );
  const smoothExtraX = useSpring(extraX, { stiffness: 45, damping: 22, mass: 0.6 });

  /* Removed rotation shift to keep images straight */
  const scaleVal = useTransform(
    scrollProgress,
    [0, 0.25, 0.5, 0.75, 1],
    [1, 1 + speed * 0.02, 1, 1 + speed * 0.015, 1]
  );
  const smoothScale = useSpring(scaleVal, { stiffness: 80, damping: 30 });

  /* Subtle Y drift for organic feel — constrained to ±10px */
  const driftY = useTransform(
    scrollProgress,
    [0, 0.3, 0.6, 1],
    [0, speed * -10, speed * 8, 0]
  );
  const smoothDriftY = useSpring(driftY, { stiffness: 50, damping: 24 });

  /* Opacity — fade in at start, stay completely solid */
  const opacity = useTransform(
    scrollProgress,
    [0, 0.04, 1],
    [0.3, 1, 1]
  );


  return (
    <motion.div
      ref={ref}
      className={`hg-float ${isHero ? "hg-float--hero" : "hg-float--accent"}`}
      style={{
        position: "absolute",
        top: `${top}%`,
        left: `${left}%`,
        zIndex: computedZ,
        x: smoothExtraX,
        y: smoothDriftY,
        rotate: 0, /* Forced straight (no tilt) */
        scale: smoothScale,
        opacity,
        willChange: "transform, opacity",
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <motion.div
        className="hg-float__inner"
        animate={hovered ? { scale: 1.035, y: -4 } : { scale: 1, y: 0 }}
        transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
      >
        <Image
          src={src}
          alt={alt}
          width={width}
          height={height}
          className="hg-float__img"
          quality={90}
          priority={speed > 0.7}
          sizes={isHero ? "(max-width: 768px) 55vw, 30vw" : "(max-width: 768px) 35vw, 18vw"}
        />
      </motion.div>

      {/* ── Label block visible below the image ── */}
      {label && (
        <div className="hg-float__desc">
          <span className="hg-float__label">{label}</span>
        </div>
      )}
    </motion.div>
  );
}
