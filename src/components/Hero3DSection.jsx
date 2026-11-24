import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import NrorBottleShowcase from './NrorBottleShowcase';

gsap.registerPlugin(ScrollTrigger);

export default function Hero3DSection() {
  const sectionRef = useRef(null);
  const copyRef = useRef(null);
  const scrollCueRef = useRef(null);
  const progressBarRef = useRef(null);

  // Refs for the exact NROR PNG bottle 2.5D entrance & scroll animations
  const bottleWrapRef = useRef(null);
  const bottleScrollRef = useRef(null);
  const auraRef = useRef(null);
  const shadowRef = useRef(null);

  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mq.matches);

    const ctx = gsap.context(() => {
      if (mq.matches) return;

      // 1. Cinematic On-Load Entrance Timeline (Typography + Exact NROR Bottle arrival)
      const introTl = gsap.timeline({ defaults: { ease: 'power4.out' } });

      introTl
        .from(
          bottleWrapRef.current,
          {
            y: 48,
            scale: 0.92,
            opacity: 0,
            duration: 1.45,
            ease: 'power3.out',
          },
          0.08
        )
        .from(
          auraRef.current,
          {
            scale: 0.78,
            opacity: 0,
            duration: 1.5,
            ease: 'power2.out',
          },
          0.1
        )
        .from(
          '.hero-eyebrow',
          {
            y: 26,
            opacity: 0,
            duration: 0.9,
          },
          0.15
        )
        .from(
          '.hero-title-line',
          {
            yPercent: 115,
            opacity: 0,
            duration: 1.1,
            stagger: 0.14,
          },
          0.28
        )
        .from(
          '.hero-subtitle',
          {
            y: 28,
            opacity: 0,
            duration: 0.95,
          },
          0.58
        )
        .fromTo(
          '.hero-cta',
          {
            y: 22,
            opacity: 0,
          },
          {
            y: 0,
            opacity: 1,
            duration: 0.85,
            stagger: 0.12,
            clearProps: 'transform,opacity',
          },
          0.74
        )
        .from(
          scrollCueRef.current,
          {
            opacity: 0,
            y: 12,
            duration: 0.8,
          },
          1.0
        );

      // 2. Pinned GSAP ScrollTrigger Choreography (2.5D non-distorting showcase)
      const scrollTl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top top',
          end: '+=160%',
          pin: true,
          scrub: 1.15,
          anticipatePin: 1,
          invalidateOnRefresh: true,
        },
      });

      // Act 1 (0 -> 0.6): Subtle zoom-in & poised vertical-axis turn without distortion
      if (bottleScrollRef.current) {
        scrollTl
          .to(
            bottleScrollRef.current,
            {
              scale: 1.08,
              y: -16,
              rotationY: -12,
              rotation: -2.5,
              duration: 0.55,
              ease: 'power2.inOut',
            },
            0
          )
          // Act 2 (0.6 -> 1.0): Graceful return turn & gentle lift into next section
          .to(
            bottleScrollRef.current,
            {
              scale: 1.02,
              y: -26,
              rotationY: 8,
              rotation: 1.2,
              duration: 0.45,
              ease: 'power2.inOut',
            },
            0.55
          );
      }

      // Warm studio backlight blooms subtly as you scroll
      if (auraRef.current) {
        scrollTl.to(
          auraRef.current,
          {
            scale: 1.18,
            opacity: 1,
            duration: 1,
            ease: 'sine.inOut',
          },
          0
        );
      }

      // Update subtle vertical gold progress indicator
      if (progressBarRef.current) {
        scrollTl.to(
          progressBarRef.current,
          {
            scaleY: 1,
            ease: 'none',
            duration: 1,
          },
          0
        );
      }

      // Fade out bottom scroll cue as soon as user starts scrolling
      if (scrollCueRef.current) {
        scrollTl.to(
          scrollCueRef.current,
          {
            opacity: 0,
            y: 10,
            duration: 0.14,
            ease: 'power2.out',
          },
          0
        );
      }

      // Gentle upward parallax on typography at the very end for seamless handoff to About
      if (copyRef.current) {
        scrollTl.to(
          copyRef.current,
          {
            y: -24,
            opacity: 0.75,
            duration: 0.25,
            ease: 'power2.inOut',
          },
          0.75
        );
      }
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      id="hero"
      ref={sectionRef}
      className="relative min-h-screen lg:h-screen w-full flex items-center overflow-hidden bg-primaryColor"
    >
      {/* Ambient Dark-Burgundy Studio Atmosphere (Blends seamlessly with #350810) */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[18%] right-[12%] w-[520px] h-[520px] bg-gradient-to-br from-[#780F27]/20 to-transparent rounded-full blur-3xl" />
        <div className="absolute bottom-[8%] left-[6%] w-[420px] h-[420px] bg-[#780F27]/12 rounded-full blur-3xl" />
        <div className="absolute inset-0 bg-gradient-to-b from-primaryColor/70 via-transparent to-primaryColor" />
      </div>

      {/* Two-Column Editorial Hero Layout */}
      <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-20 w-full pt-24 pb-14 lg:py-0">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-6 items-center">
          {/* Left Column: Existing NROR Typography & Actions (Preserved) */}
          <div
            ref={copyRef}
            className="lg:col-span-6 text-center lg:text-left space-y-5 sm:space-y-6"
          >
            <p className="hero-eyebrow text-[11px] sm:text-xs uppercase tracking-eyebrow text-goldColor font-semibold">
              AN INDIAN FRAGRANCE HOUSE
            </p>

            <h1 className="font-serif text-4xl sm:text-5xl md:text-5xl lg:text-6xl xl:text-[68px] font-bold tracking-tight leading-[1.06]">
              <span className="hero-line-mask block">
                <span className="hero-title-line text-shimmer inline-block bg-gradient-to-r from-[#f5dfa9] via-[#e2be79] via-[#c58b59] to-[#9e5b4e] bg-clip-text text-transparent">
                  LEAVE A LASTING
                </span>
              </span>
              <span className="hero-line-mask block">
                <span className="hero-title-line text-shimmer inline-block bg-gradient-to-r from-[#f5dfa9] via-[#e2be79] via-[#c58b59] to-[#9e5b4e] bg-clip-text text-transparent">
                  IMPRESSION
                </span>
              </span>
            </h1>

            <p className="hero-subtitle text-xs sm:text-sm md:text-[15px] text-silverColor/90 leading-relaxed font-light max-w-lg mx-auto lg:mx-0">
              Crafted for those who define their own identity. Experience fragrance, elegance and individuality with NROR.
            </p>

            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
              <a
                href="#collection"
                className="hero-cta w-full sm:w-auto px-8 py-3.5 gold-gradient-btn text-xs uppercase tracking-[0.16em] rounded-xs text-center transition-transform duration-300 hover:scale-[1.03] active:scale-[0.97]"
              >
                EXPLORE COLLECTION
              </a>
              <a
                href="#about"
                className="hero-cta w-full sm:w-auto px-8 py-3.5 border border-goldColor/50 hover:border-goldColor hover:bg-goldColor/10 text-silverColor text-xs uppercase tracking-[0.16em] rounded-xs text-center transition-[color,background-color,border-color,transform] duration-300 font-medium hover:scale-[1.03] active:scale-[0.97]"
              >
                DISCOVER NROR
              </a>
            </div>
          </div>

          {/* Right Column: Exact NROR Bottle PNG with 2.5D Floating, Parallax & GSAP Scroll */}
          <div className="lg:col-span-6 flex items-center justify-center w-full pt-10 sm:pt-12 lg:pt-20">
            <NrorBottleShowcase
              bottleWrapRef={bottleWrapRef}
              bottleScrollRef={bottleScrollRef}
              auraRef={auraRef}
              shadowRef={shadowRef}
              reducedMotion={reducedMotion}
            />
          </div>
        </div>
      </div>

      {/* Subtle Vertical Scroll Progress Rail (Desktop Right Edge) */}
      <div
        aria-hidden="true"
        className="hidden lg:flex flex-col items-center gap-3 absolute right-7 top-1/2 -translate-y-1/2 z-20 pointer-events-none"
      >
        <div className="w-[1.5px] h-28 bg-goldColor/20 rounded-full overflow-hidden">
          <div
            ref={progressBarRef}
            className="w-full h-full bg-gradient-to-b from-[#f5dfa9] to-goldColor origin-top scale-y-0"
          />
        </div>
      </div>

      {/* Bottom Scroll Prompt */}
      <div
        ref={scrollCueRef}
        aria-hidden="true"
        className="hidden sm:flex absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex-col items-center gap-2 pointer-events-none"
      >
        <span className="w-[1px] h-7 bg-gradient-to-b from-goldColor/80 to-transparent animate-pulse" />
      </div>
    </section>
  );
}
