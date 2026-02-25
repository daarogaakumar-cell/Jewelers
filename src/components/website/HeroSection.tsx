"use client";

import { useRef } from "react";
import {
  motion,
  useScroll,
  useTransform,
  useReducedMotion,
} from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { useLanguage } from "@/components/providers/LanguageProvider";

/* ── Stable particle data (generated once, outside component) ─────────── */
const PARTICLES: Array<{
  id: number;
  size: number;
  left: number;
  delay: number;
  duration: number;
  opacity: number;
  drift: number;
}> = [
  { id: 0,  size: 2.5, left: 6,  delay: 0,   duration: 11, opacity: 0.55, drift: 18 },
  { id: 1,  size: 1.5, left: 13, delay: 2.5, duration: 9,  opacity: 0.35, drift: -12 },
  { id: 2,  size: 3,   left: 22, delay: 1,   duration: 13, opacity: 0.45, drift: 20 },
  { id: 3,  size: 2,   left: 31, delay: 4,   duration: 10, opacity: 0.40, drift: -8 },
  { id: 4,  size: 1.5, left: 40, delay: 0.5, duration: 12, opacity: 0.30, drift: 15 },
  { id: 5,  size: 2.5, left: 49, delay: 3,   duration: 8,  opacity: 0.50, drift: -18 },
  { id: 6,  size: 2,   left: 57, delay: 1.8, duration: 14, opacity: 0.38, drift: 10 },
  { id: 7,  size: 3,   left: 66, delay: 0.7, duration: 11, opacity: 0.42, drift: -14 },
  { id: 8,  size: 1.5, left: 74, delay: 2.2, duration: 9,  opacity: 0.32, drift: 22 },
  { id: 9,  size: 2,   left: 83, delay: 4.5, duration: 13, opacity: 0.48, drift: -10 },
  { id: 10, size: 2.5, left: 91, delay: 1.3, duration: 10, opacity: 0.36, drift: 16 },
  { id: 11, size: 1.5, left: 18, delay: 3.8, duration: 12, opacity: 0.28, drift: -20 },
  { id: 12, size: 3,   left: 45, delay: 2.8, duration: 15, opacity: 0.44, drift: 12 },
  { id: 13, size: 2,   left: 62, delay: 0.3, duration: 8,  opacity: 0.52, drift: -16 },
  { id: 14, size: 1.5, left: 78, delay: 5,   duration: 11, opacity: 0.34, drift: 14 },
];



export function HeroSection() {
  const { t } = useLanguage();
  const sectionRef = useRef<HTMLElement>(null);
  const prefersReduced = useReducedMotion();

  /* Parallax — GPU-composited translateY only, no layout thrash */
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });

  const bgY      = useTransform(scrollYProgress, [0, 1], prefersReduced ? ["0%", "0%"] : ["0%", "30%"]);
  const contentY = useTransform(scrollYProgress, [0, 1], prefersReduced ? ["0%", "0%"] : ["0%", "10%"]);

  return (
    <section
      ref={sectionRef}
      className="relative overflow-hidden bg-charcoal-900 min-h-[65vh] md:min-h-[72vh] flex items-center"
    >
      {/* ─────────────────────── Parallax Background ─────────────────────── */}
      <motion.div
        className="absolute inset-0 scale-[1.15]"
        style={{ y: bgY, willChange: "transform" }}
      >
        <Image
          src="/Herobg.png"
          alt="Elegant diamond jewelry on silk"
          fill
          className="object-cover object-center"
          priority
          sizes="100vw"
        />
      </motion.div>

      {/* ─────────────────────── Layered Overlays ────────────────────────── */}
      <div className="absolute inset-0 bg-linear-to-r from-black/95 via-black/72 to-black/22 pointer-events-none" />
      <div className="absolute inset-0 bg-linear-to-t from-black/80 via-transparent to-black/25 pointer-events-none" />
      <div className="absolute inset-0 bg-linear-to-br from-yellow-950/20 via-transparent to-transparent pointer-events-none" />

      {/* ─────────────────────── Ambient Gold Glows ──────────────────────── */}
      <div className="absolute -left-40 top-1/3 h-140 w-140 rounded-full bg-gold-500/10 blur-[160px] pointer-events-none" />
      <div className="absolute left-1/3 bottom-0 h-72 w-72 rounded-full bg-gold-400/8 blur-[100px] pointer-events-none" />
      <div className="absolute right-1/3 top-1/4 h-100 w-100 rounded-full bg-gold-300/5 blur-[180px] pointer-events-none" />

      {/* ─────────────────────── Floating Gold Particles ─────────────────── */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
        {PARTICLES.map((p) => (
          <div
            key={p.id}
            className="absolute rounded-full hero-particle"
            style={{
              width: `${p.size}px`,
              height: `${p.size}px`,
              left: `${p.left}%`,
              bottom: "-6px",
              background: `radial-gradient(circle, rgba(255,220,100,${p.opacity + 0.2}) 0%, rgba(212,163,55,${p.opacity}) 100%)`,
              boxShadow: `0 0 ${p.size * 3}px rgba(212,163,55,${p.opacity})`,
              animationDelay: `${p.delay}s`,
              animationDuration: `${p.duration}s`,
              "--drift": `${p.drift}px`,
            } as React.CSSProperties}
          />
        ))}
      </div>

      {/* ─────────────────────── Main Content ────────────────────────────── */}
      <div className="relative mx-auto max-w-7xl px-5 py-14 sm:px-8 lg:px-12 lg:py-20 w-full">
        <div>

          {/* ── Text Column ─────────────────────────────────────────────── */}
          <motion.div
            style={{ y: contentY, willChange: "transform" }}
            className="max-w-2xl"
          >
            {/* Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 36 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
              className="font-heading text-[3.25rem] font-bold leading-[1.05] tracking-tight text-white sm:text-[4.5rem] md:text-[5rem] lg:text-[5.5rem]"
            >
              <span
                className="inline-block bg-gold-300 text-charcoal-900 px-3 pb-1 mr-3"
                style={{ textShadow: "none" }}
              >
                {t("hero.heading1")}
              </span>
              <span
                className="hero-shimmer-text bg-linear-to-br from-yellow-100 via-gold-300 to-gold-500 bg-clip-text text-transparent"
                style={{ filter: "drop-shadow(0 0 28px rgba(212,163,55,0.6))" }}
              >
                {t("hero.heading2")}
              </span>
              <br />
              <span className="text-white/82">{t("hero.heading3")}</span>
            </motion.h1>

            {/* Gold rule */}
            <motion.div
              initial={{ scaleX: 0, opacity: 0 }}
              animate={{ scaleX: 1, opacity: 1 }}
              transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: 0.5 }}
              className="mt-8 h-[1.5px] w-36 origin-left"
              style={{
                background: "linear-gradient(90deg, #D4A017 0%, rgba(212,160,23,0.4) 60%, transparent 100%)",
              }}
            />

            {/* Subheading */}
            <motion.p
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.48 }}
              className="mt-6 max-w-105 text-sm font-light leading-[1.85] tracking-wider text-white/80 sm:text-base"
            >
              {t("hero.subheading")}
            </motion.p>

            {/* CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.62 }}
              className="mt-10 flex flex-col gap-4 sm:flex-row"
            >
              {/* Primary — gold with shimmer sweep */}
              <Link
                href="/categories"
                className="group relative inline-flex items-center justify-center gap-2.5 overflow-hidden rounded-full bg-linear-to-r from-gold-500 to-gold-600 px-8 py-3.5 text-sm font-semibold tracking-wide text-charcoal-900 shadow-[0_0_40px_rgba(212,163,55,0.38)] transition-all duration-300 hover:shadow-[0_0_64px_rgba(212,163,55,0.62)] hover:scale-[1.03] active:scale-[0.97]"
              >
                <span
                  className="pointer-events-none absolute inset-0 translate-x-[-110%] bg-linear-to-r from-transparent via-white/30 to-transparent skew-x-[-20deg] transition-transform duration-700 group-hover:translate-x-[110%]"
                  aria-hidden="true"
                />
                {t("hero.explore")}
                <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
              </Link>

              {/* Secondary — ghost */}
              <Link
                href="/contact"
                className="inline-flex items-center justify-center gap-2 rounded-full border border-white/20 px-8 py-3.5 text-sm font-medium tracking-wide text-white/75 backdrop-blur-sm transition-all duration-300 hover:border-gold-400/50 hover:bg-gold-400/8 hover:text-white"
              >
                {t("hero.visitStore")}
              </Link>
            </motion.div>

            {/* Trust Stats */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.95 }}
              className="mt-14 flex flex-wrap items-stretch gap-0"
            >
              {[
                { value: "20+", label: t("hero.yearsTrust") },
                { value: "BIS", label: t("hero.hallmarkCertified") },
                { value: "916", label: t("hero.pureGold") },
              ].map((stat, i) => (
                <div key={i} className="flex items-stretch">
                  <div className="flex flex-col gap-1 pr-6 sm:pr-10">
                    <span
                      className="font-heading text-[1.75rem] font-bold leading-none text-gold-300 sm:text-[2rem]"
                      style={{ textShadow: "0 0 28px rgba(212,163,55,0.65)" }}
                    >
                      {stat.value}
                    </span>
                    <span className="text-[9px] font-medium tracking-[0.28em] uppercase text-white/60">
                      {stat.label}
                    </span>
                  </div>
                  {i < 2 && (
                    <div className="mr-6 sm:mr-10 w-px self-stretch bg-linear-to-b from-transparent via-white/15 to-transparent" />
                  )}
                </div>
              ))}
            </motion.div>
          </motion.div>


        </div>
      </div>

      {/* ─────────────────────── Marquee strip ───────────────────────────── */}
      <div
        className="absolute bottom-12 sm:bottom-8 left-0 right-0 overflow-hidden pointer-events-none"
        aria-hidden="true"
      >
        <div className="hero-marquee flex whitespace-nowrap">
          {Array.from({ length: 8 }).map((_, i) => (
            <span
              key={i}
              className="mx-8 shrink-0 text-[9px] font-medium tracking-[0.45em] uppercase text-white/12"
            >
              Handcrafted Jewelry&nbsp;&nbsp;·&nbsp;&nbsp;BIS Hallmarked&nbsp;&nbsp;·&nbsp;&nbsp;Pure Gold &amp; Silver&nbsp;&nbsp;·&nbsp;&nbsp;Diamond Certified&nbsp;&nbsp;·&nbsp;&nbsp;Since 2004
            </span>
          ))}
        </div>
      </div>

      {/* ─────────────────────── Bottom accent line ──────────────────────── */}
      <div
        className="absolute bottom-0 left-0 right-0 h-px"
        style={{
          background:
            "linear-gradient(90deg, transparent 0%, rgba(212,163,55,0.55) 30%, rgba(255,220,100,0.8) 50%, rgba(212,163,55,0.55) 70%, transparent 100%)",
        }}
      />
    </section>
  );
}
