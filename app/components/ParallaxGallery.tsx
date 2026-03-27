"use client";

import { useRef } from "react";
import {
  motion,
  useScroll,
  useTransform,
} from "framer-motion";
import FloatingImage from "./FloatingImage";
import BackgroundTransition from "./BackgroundTransition";

/* ═══════════════════════════════════════════════════════════════════
   GALLERY DATA
   Images moved slightly to the right to make room for the intro.
   Values fit within 320vw × 100vh canvas.
   ═══════════════════════════════════════════════════════════════════ */
const galleryItems = [
  // ── Hero images ──
  {
    src: "/gallery-1.jpeg",
    alt: "Editorial portrait",
    width: 360,
    height: 460,
    top: 5,
    left: 20,
    speed: 0.85,
    rotation: -1.5,
    label: "Noir Series",
    category: "Editorial",
    description: "Dramatic shadow play, moody cinematic lighting.",
    isHero: true,
    zIndex: 8,
  },
  {
    src: "/gallery-44.jpeg",
    alt: "Dance in motion",
    width: 380,
    height: 480,
    top: 4,
    left: 50,
    speed: 0.7,
    rotation: 1,
    label: "Motion",
    category: "Dance",
    description: "Capturing the raw energy and grace of movement.",
    isHero: true,
    zIndex: 9,
  },
  {
    src: "/gallery-7.jpeg",
    alt: "Cinematic headshot",
    width: 360,
    height: 460,
    top: 6,
    left: 82,
    speed: 0.9,
    rotation: -0.6,
    label: "Cinematic",
    category: "Acting",
    description: "Film-still aesthetic with anamorphic warmth.",
    isHero: true,
    zIndex: 10,
  },
  // ── Accent images ──
  {
    src: "/gallery-2.jpeg",
    alt: "Golden hour fashion",
    width: 240,
    height: 300,
    top: 45,
    left: 35,
    speed: 0.4,
    rotation: 2.5,
    label: "Golden Hour",
    category: "Fashion",
    description: "Warmth and wind — flowing textures.",
    isHero: false,
    zIndex: 5,
  },
  {
    src: "/gallery-3.jpeg",
    alt: "Film noir close-up",
    width: 220,
    height: 280,
    top: 48,
    left: 65,
    speed: 0.25,
    rotation: -2.8,
    label: "Monochrome",
    category: "Fine Art",
    description: "High-contrast black & white intensity.",
    isHero: false,
    zIndex: 3,
  },
  {
    src: "/gallery-5.jpeg",
    alt: "Urban night neon reflections",
    width: 250,
    height: 320,
    top: 44,
    left: 92,
    speed: 0.5,
    rotation: 1.8,
    label: "Neon Nights",
    category: "Street",
    description: "Urban edge meets neon glow.",
    isHero: false,
    zIndex: 6,
  }
];

/* ═══════════════════════════════════════════
   Ambient floating particles
   ═══════════════════════════════════════════ */
function AmbientParticles() {
  const particles = Array.from({ length: 14 }, (_, i) => ({
    id: i,
    top: `${10 + Math.random() * 80}%`,
    left: `${Math.random() * 100}%`,
    size: 1.5 + Math.random() * 2.5,
    dur: 16 + Math.random() * 20,
    delay: Math.random() * 8,
    opacity: 0.04 + Math.random() * 0.1,
  }));

  return (
    <div className="hg-particles" aria-hidden>
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="hg-particle"
          style={{
            position: "absolute",
            top: p.top,
            left: p.left,
            width: p.size,
            height: p.size,
          }}
          animate={{
            y: [0, -20, 0, 15, 0],
            x: [0, 10, -8, 6, 0],
            opacity: [p.opacity, p.opacity * 1.8, p.opacity, p.opacity * 0.6, p.opacity],
          }}
          transition={{
            duration: p.dur,
            delay: p.delay,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
}

/* ═══════════════════════════════════════════
   Scroll progress indicator bar
   ═══════════════════════════════════════════ */
function ScrollIndicator({
  scrollProgress,
}: {
  scrollProgress: ReturnType<typeof useScroll>["scrollYProgress"];
}) {
  const scaleX = useTransform(scrollProgress, [0, 1], [0, 1]);
  const opacity = useTransform(scrollProgress, [0, 0.02, 0.95, 1], [0, 1, 1, 0]);

  return (
    <motion.div className="hg-progress" style={{ opacity }}>
      <motion.div className="hg-progress__bar" style={{ scaleX }} />
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════
   MAIN COMPONENT — HorizontalScrollSection
   ═══════════════════════════════════════════════════ */

/** Scroll fuel multiplier: 2.5x viewport height for 6 images */
const SCROLL_MULTIPLIER = 2.5;
/** Canvas width decreased to 220vw to fit exactly 6 images */
const CANVAS_WIDTH_VW = 220;

const introContainerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.2,
    },
  },
};

const introItemVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] as const },
  },
};

export default function HorizontalScrollSection() {
  const sectionRef = useRef<HTMLDivElement>(null);

  /* Track scroll progress through the tall wrapper div */
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end end"],
  });

  /* Calculate dynamic background for the entire portfolio wrapper */
  const wrapperBg = useTransform(
    scrollYProgress,
    [0, 0.35, 0.7, 1],
    [
      "#0d0d0d",   // --dark
      "#2a2824",   // warm grey
      "#dfd8cb",   // light warm grey
      "#f2ebdf",   // yellowish-white cream
    ]
  );

  /* Map vertical scroll → horizontal translateX directly.
     Letting native scroll (Lenis) do the smoothing to prevent "rubber banding"
     or disconnects between scroll up/down and the pinned state. */
  const endPercent = ((CANVAS_WIDTH_VW - 100) / CANVAS_WIDTH_VW) * 100;
  const rawX = useTransform(
    scrollYProgress,
    [0, 1],
    ["0%", `-${endPercent}%`]
  );

  return (
    <motion.section 
       className="pk-portfolio-wrapper" 
       style={{ 
         backgroundColor: wrapperBg, 
         isolation: "isolate", 
         position: "relative", 
         zIndex: 10 
       }}
    >
      {/* ── Vertical Full-Viewport Intro Section ── */}
      <div className="hg-intro-section" style={{ overflow: "hidden" }}>
        {/* Same atmosphere as the gallery */}
        <div className="hg-bg-base" style={{ backgroundColor: "#0d0d0d" }} />
        <div className="hg-bg-radial" style={{ opacity: 0.15 }} />
        <div className="hg-bg-grain" style={{ opacity: 0.025 }} />
        <AmbientParticles />

        <motion.div
          className="hg-intro-block"
          variants={introContainerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.6 }}
        >
          <motion.p className="hg-intro__label" variants={introItemVariants}>
            / Portfolio
          </motion.p>
          <motion.h2 className="hg-intro__title" variants={introItemVariants}>
            Through&nbsp;<em>the Lens</em>
          </motion.h2>
          <motion.div className="hg-intro__rule" variants={introItemVariants} />
          <motion.p className="hg-intro__sub" variants={introItemVariants}>
            Scroll down to explore a curated collection of moments.
          </motion.p>
        </motion.div>
      </div>

      {/* ── Horizontal Scroll Parallax Section ── */}
      <div
        ref={sectionRef}
        className="hg-scroll-wrapper"
        style={{ height: `${100 * SCROLL_MULTIPLIER}vh` }}
      >
        {/* Sticky viewport — stays pinned while user scrolls */}
        <div className="hg-sticky">
          {/* Dynamic background transitions */}
          <BackgroundTransition scrollProgress={scrollYProgress} />

          {/* Ambient particles */}
          <AmbientParticles />

          {/* Progress bar */}
          <ScrollIndicator scrollProgress={scrollYProgress} />

          {/* The wide horizontal canvas */}
          <motion.div
            className="hg-canvas"
            style={{
              x: rawX,
              width: `${CANVAS_WIDTH_VW}vw`,
            }}
          >
            {/* Floating images take full height now */}
            {galleryItems.map((item) => (
              <FloatingImage
                key={item.src}
                scrollProgress={scrollYProgress}
                {...item}
              />
            ))}
          </motion.div>

          {/* Vignette edges for framing - fade out smoothly as background lightens */}
          <motion.div
            style={{
              opacity: useTransform(scrollYProgress, [0, 0.35], [1, 0]),
              pointerEvents: "none"
            }}
          >
            <div className="hg-vignette hg-vignette--left" />
            <div className="hg-vignette hg-vignette--right" />
            <div className="hg-vignette hg-vignette--top" />
            <div className="hg-vignette hg-vignette--bottom" />
          </motion.div>
        </div>
      </div>
    </motion.section>
  );
}
