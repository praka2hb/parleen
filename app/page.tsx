"use client";

import { animate, motion, useReducedMotion } from "framer-motion";
import { useEffect, useMemo, useRef, useState } from "react";
import HorizontalScrollSection from "./components/ParallaxGallery";
import "./gallery.css";

const roles = ["Actor.", "Creator.", "Model."];

type CounterState = {
  s1: number;
  s2: number;
  s3: number;
};

/** Pin wrapper height = viewport × ratio — About stays sticky for (ratio − 1) × 100vh of scroll */
const ABOUT_PIN_ZONE_RATIO = 1.78;

function clamp(v: number, min: number, max: number) {
  return Math.max(min, Math.min(max, v));
}

type ScrollTargets = {
  overlayOpacity: number;
  nameY: number;
  descY: number;
  nameOpacity: number;
  descOpacity: number;
};

export default function Home() {
  const aboutRef = useRef<HTMLElement | null>(null);
  const aboutRevealRef = useRef<HTMLDivElement | null>(null);
  const overlayRef = useRef<HTMLDivElement | null>(null);
  const heroNameRef = useRef<HTMLDivElement | null>(null);
  const heroDescRef = useRef<HTMLDivElement | null>(null);
  const targetsRef = useRef<ScrollTargets>({
    overlayOpacity: 0,
    nameY: 0,
    descY: 0,
    nameOpacity: 1,
    descOpacity: 1,
  });
  const smoothRef = useRef<ScrollTargets>({ ...targetsRef.current });
  const [typedRole, setTypedRole] = useState("Actor.");
  const [aboutVisible, setAboutVisible] = useState(false);
  const [counters, setCounters] = useState<CounterState>({ s1: 0, s2: 0, s3: 0 });
  const [hasCounted, setHasCounted] = useState(false);

  useEffect(() => {
    let roleIndex = 0;
    let charIndex = 0;
    let deleting = false;
    let timeoutId: ReturnType<typeof setTimeout> | undefined;

    const tick = () => {
      const current = roles[roleIndex];
      if (!deleting) {
        charIndex += 1;
        setTypedRole(current.slice(0, charIndex));
        if (charIndex === current.length) {
          deleting = true;
          timeoutId = setTimeout(tick, 1900);
          return;
        }
      } else {
        charIndex -= 1;
        setTypedRole(current.slice(0, charIndex));
        if (charIndex === 0) {
          deleting = false;
          roleIndex = (roleIndex + 1) % roles.length;
        }
      }

      timeoutId = setTimeout(tick, deleting ? 55 : 85);
    };

    tick();
    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, []);

  useEffect(() => {
    const node = aboutRevealRef.current;
    if (!node) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setAboutVisible(true);
          }
        });
      },
      { threshold: 0.22 }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (aboutVisible) {
      setHasCounted(true);
    }
  }, [aboutVisible]);

  useEffect(() => {
    const LERP = 0.14;
    const REDUCED =
      typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const getViewportHeight = () =>
      typeof window !== "undefined"
        ? window.visualViewport?.height ?? window.innerHeight
        : 0;

    const computeTargets = (): ScrollTargets => {
      const sy = window.scrollY;
      const heroHeight = getViewportHeight();
      const pinRatio = REDUCED ? 1 : ABOUT_PIN_ZONE_RATIO;
      const pinZonePx = heroHeight * pinRatio;
      const pinFadeDistance = Math.max(1, pinZonePx - heroHeight);

      let overlayOpacity = 0;
      if (sy <= heroHeight) {
        const overlayProgress = Math.min(sy / (heroHeight * 0.6), 1);
        overlayOpacity = overlayProgress * 0.92;
      } else {
        const aboutProgress = clamp((sy - heroHeight) / pinFadeDistance, 0, 1);
        overlayOpacity = Math.max(0, 0.92 - aboutProgress * 0.92);
      }

      const nameY = sy * 0.35;
      const descY = sy * 0.65;
      const nameOpacity = clamp(1 - sy / (heroHeight * 0.5), 0, 1);
      const descOpacity = clamp(1 - sy / (heroHeight * 0.4), 0, 1);

      return { overlayOpacity, nameY, descY, nameOpacity, descOpacity };
    };

    const syncTargets = () => {
      const t = computeTargets();
      targetsRef.current = t;
      if (REDUCED) {
        smoothRef.current = { ...t };
      }
    };

    let rafId = 0;
    let cancelled = false;

    const tick = () => {
      if (cancelled) {
        return;
      }
      const tgt = targetsRef.current;
      const s = smoothRef.current;
      const k = REDUCED ? 1 : LERP;

      s.overlayOpacity += (tgt.overlayOpacity - s.overlayOpacity) * k;
      s.nameY += (tgt.nameY - s.nameY) * k;
      s.descY += (tgt.descY - s.descY) * k;
      s.nameOpacity += (tgt.nameOpacity - s.nameOpacity) * k;
      s.descOpacity += (tgt.descOpacity - s.descOpacity) * k;

      if (overlayRef.current) {
        overlayRef.current.style.opacity = String(s.overlayOpacity);
      }
      if (heroNameRef.current) {
        heroNameRef.current.style.transform = `translate3d(0,-${s.nameY}px,0)`;
        heroNameRef.current.style.opacity = String(s.nameOpacity);
      }
      if (heroDescRef.current) {
        heroDescRef.current.style.transform = `translate3d(0,-${s.descY}px,0)`;
        heroDescRef.current.style.opacity = String(s.descOpacity);
      }

      rafId = window.requestAnimationFrame(tick);
    };

    syncTargets();
    rafId = window.requestAnimationFrame(tick);

    const onScroll = () => syncTargets();
    const onResize = () => syncTargets();

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);
    const vv = window.visualViewport;
    if (vv) {
      vv.addEventListener("resize", onResize);
      vv.addEventListener("scroll", onResize);
    }

    return () => {
      cancelled = true;
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
      if (vv) {
        vv.removeEventListener("resize", onResize);
        vv.removeEventListener("scroll", onResize);
      }
      window.cancelAnimationFrame(rafId);
    };
  }, []);

  useEffect(() => {
    if (!hasCounted) {
      return;
    }

    const controls = [
      animate(0, 5, {
        duration: 1.35,
        ease: [0.16, 1, 0.3, 1],
        onUpdate: (latest) => {
          setCounters((prev) => ({ ...prev, s1: Math.round(latest) }));
        },
      }),
      animate(0, 200, {
        duration: 1.55,
        ease: [0.16, 1, 0.3, 1],
        onUpdate: (latest) => {
          setCounters((prev) => ({ ...prev, s2: Math.round(latest) }));
        },
      }),
      animate(0, 16, {
        duration: 1.55,
        ease: [0.16, 1, 0.3, 1],
        onUpdate: (latest) => {
          setCounters((prev) => ({ ...prev, s3: Math.round(latest) }));
        },
      }),
    ];

    return () => {
      controls.forEach((control) => control.stop());
    };
  }, [hasCounted]);

  const scrollToAbout = () => {
    if (aboutRef.current) {
      aboutRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const reducedMotion = useReducedMotion();

  const aboutVariants = useMemo(() => {
    const ease = [0.22, 1, 0.36, 1] as const;
    const easeOut = [0.16, 1, 0.3, 1] as const;

    const fadeBlurUp = (y: number, blur: number, dur: number) => ({
      hidden: reducedMotion ? { opacity: 0 } : { opacity: 0, y, filter: `blur(${blur}px)` },
      visible: {
        opacity: 1,
        y: 0,
        filter: "blur(0px)",
        transition: { duration: dur, ease },
      },
    });

    return {
      root: {
        hidden: { opacity: 0 },
        visible: {
          opacity: 1,
          transition: {
            /* Text + image columns in parallel; stagger lives inside each column */
            staggerChildren: 0,
            delayChildren: reducedMotion ? 0 : 0.06,
            duration: 0.4,
          },
        },
      },
      textColumn: {
        hidden: {},
        visible: {
          transition: {
            staggerChildren: reducedMotion ? 0 : 0.09,
            delayChildren: reducedMotion ? 0 : 0.05,
          },
        },
      },
      label: fadeBlurUp(22, 10, 0.72),
      heading: fadeBlurUp(38, 14, 0.88),
      rule: {
        hidden: reducedMotion ? { opacity: 0, scaleX: 0 } : { opacity: 0, scaleX: 0 },
        visible: {
          opacity: 1,
          scaleX: 1,
          transition: { duration: 0.65, ease },
        },
      },
      body: fadeBlurUp(28, 8, 0.78),
      statsRow: {
        hidden: {},
        visible: {
          transition: {
            staggerChildren: reducedMotion ? 0 : 0.11,
            delayChildren: reducedMotion ? 0 : 0.02,
          },
        },
      },
      stat: {
        hidden: reducedMotion ? { opacity: 0 } : { opacity: 0, y: 22 },
        visible: {
          opacity: 1,
          y: 0,
          transition: { duration: 0.62, ease },
        },
      },
      tagsRow: {
        hidden: {},
        visible: {
          transition: {
            staggerChildren: reducedMotion ? 0 : 0.045,
          },
        },
      },
      tag: {
        hidden: reducedMotion ? { opacity: 0 } : { opacity: 0, y: 14, scale: 0.94 },
        visible: {
          opacity: 1,
          y: 0,
          scale: 1,
          transition: { duration: 0.48, ease },
        },
      },
      photo: {
        hidden: reducedMotion ? { opacity: 0 } : { opacity: 0, scale: 1.07, x: "3.5%" },
        visible: {
          opacity: 1,
          scale: 1,
          x: 0,
          transition: { duration: 1.05, ease: easeOut },
        },
      },
    };
  }, [reducedMotion]);

  return (
    <main className="pk-root">
      <div id="fixed-photo" />
      <div id="fixed-overlay" ref={overlayRef} style={{ opacity: 0 }} />

      <div id="content-wrap">
        <section id="hero">
          <div className="hero-bottom">
            <div id="hero-name" ref={heroNameRef}>
              <p className="h-tag">Actor · Creator · Model</p>
              <h1 className="h-name">
                <span>Parleen K.</span>
              </h1>
            </div>

            <div id="hero-desc" ref={heroDescRef}>
              <p className="h-desc">
                A multidisciplinary artist bringing characters to life - on screen, on camera, and
                in every frame.
              </p>
            </div>
          </div>
        </section>

        <div className="about-pin-zone">
          <section id="about" ref={aboutRef}>
            <motion.div
              id="about-reveal"
              ref={aboutRevealRef}
              initial="hidden"
              animate={aboutVisible ? "visible" : "hidden"}
              variants={aboutVariants.root}
            >
              <motion.div className="a-text" variants={aboutVariants.textColumn}>
                <motion.p className="a-label" variants={aboutVariants.label}>
                  / About Parleen
                </motion.p>
                <motion.h2 className="a-heading" variants={aboutVariants.heading}>
                  Faces tell stories.
                  <br />
                  Hers tells many.
                </motion.h2>
                <motion.div className="a-rule" variants={aboutVariants.rule} />
                <motion.p className="a-body" variants={aboutVariants.body}>
                  Parleen Kaur is a multidisciplinary creative - an actor with depth, a model with
                  presence, and a content creator with an eye for the real and the beautiful. Based
                  in India, working everywhere.
                </motion.p>
                <motion.div className="a-stats" variants={aboutVariants.statsRow}>
                  <motion.div className="stat" variants={aboutVariants.stat}>
                    <span className="stat-n">{counters.s1}+</span>
                    <span className="stat-l">Years</span>
                  </motion.div>
                  <motion.div className="stat" variants={aboutVariants.stat}>
                    <span className="stat-n">{counters.s2}+</span>
                    <span className="stat-l">Reels</span>
                  </motion.div>
                  <motion.div className="stat" variants={aboutVariants.stat}>
                    <span className="stat-n">{counters.s3}K</span>
                    <span className="stat-l">Followers</span>
                  </motion.div>
                </motion.div>
                {/* <motion.div className="a-tags" variants={aboutVariants.tagsRow}>
                  {["Acting", "Modeling", "Dance", "Lifestyle", "Brand Collab", "Fashion"].map((t) => (
                    <motion.span key={t} className="tag" variants={aboutVariants.tag}>
                      {t}
                    </motion.span>
                  ))}
                </motion.div> */}
              </motion.div>

              <motion.div className="a-photo-wrap" variants={aboutVariants.photo}>
                <div className="a-photo" />
                <div className="a-photo-grad" />
              </motion.div>
            </motion.div>
          </section>
        </div>

        <HorizontalScrollSection />
      </div>
    </main>
  );
}
