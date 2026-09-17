"use client";

import React, { useRef, useState } from "react";

/**
 * Starlight CreatorStudioHero (2026)
 * A world-class hero component for high-agency creators, founders, and AI architects.
 * Features: Liquid Obsidian base, dynamic cursor glowcard, optical typography, SVG noise overlay,
 * and seamless multi-model agent interaction hooks.
 */

interface StudioStat {
  label: string;
  value: string;
  trend: string;
}

const STATS: StudioStat[] = [
  { label: "Agentic Velocity", value: "340 t/s", trend: "+42% speed" },
  { label: "Design Quality Bar", value: "100/100", trend: "Zero AI Slop" },
  { label: "Frontier Calibration", value: "6 Engines", trend: "Multi-Model Swarm" },
];

export function CreatorStudioHero() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeTab, setActiveTab] = useState<"build" | "orchestrate" | "distribute">("build");

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    containerRef.current.style.setProperty("--mouse-x", `${x}px`);
    containerRef.current.style.setProperty("--mouse-y", `${y}px`);
  };

  return (
    <section
      ref={containerRef}
      onMouseMove={handleMouseMove}
      className="relative min-h-[90vh] w-full overflow-hidden bg-[#090a0f] text-slate-100 px-6 py-20 md:px-12 lg:px-24 flex flex-col justify-center items-center"
      style={{
        backgroundImage: `radial-gradient(800px circle at var(--mouse-x, 50%) var(--mouse-y, 30%), rgba(6, 182, 212, 0.12), rgba(139, 92, 246, 0.06), transparent 70%)`,
      }}
    >
      {/* SVG Noise Grain Overlay */}
      <div
        className="pointer-events-none absolute inset-0 z-0 opacity-5"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Top Badge: Sentence Case with Subtle Glow */}
      <div className="relative z-10 mb-8 inline-flex items-center gap-3 rounded-full border border-cyan-500/30 bg-cyan-950/20 px-4 py-1.5 backdrop-blur-md transition-all duration-300 hover:border-cyan-400/50">
        <span className="flex h-2 w-2 rounded-full bg-cyan-400 animate-pulse" />
        <span className="text-xs font-medium tracking-wide text-cyan-300 font-sans">
          Starlight Creator Studio 2026 · Sovereign Agentic Engine
        </span>
      </div>

      {/* Main Headline: Optical Display Font, Sentence Case */}
      <h1 className="relative z-10 max-w-4xl text-center font-bold tracking-tight text-slate-50 text-4xl sm:text-5xl md:text-6xl lg:text-7xl leading-[1.12] mb-6 font-['Syne',sans-serif]">
        Create without boundaries with sovereign AI intelligence.
      </h1>

      {/* Subheadline: Generous Line Height and Balanced Width */}
      <p className="relative z-10 max-w-2xl text-center text-slate-400 text-lg md:text-xl leading-relaxed mb-10 font-['Space_Grotesk',sans-serif]">
        Seamlessly compose applications, generate brand assets, and coordinate multi-model swarms with Apple-grade polish and instantaneous execution.
      </p>

      {/* Action Buttons: High-Contrast and Tactile States */}
      <div className="relative z-10 flex flex-wrap items-center justify-center gap-4 mb-16">
        <button
          type="button"
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 via-blue-600 to-violet-600 px-8 py-3.5 text-sm font-semibold text-slate-950 shadow-lg shadow-cyan-500/25 transition-all duration-200 hover:scale-[1.02] hover:brightness-110 active:scale-[0.98] cursor-pointer"
        >
          Launch Creator Engine
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
          </svg>
        </button>
        <button
          type="button"
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/15 bg-slate-900/60 px-7 py-3.5 text-sm font-medium text-slate-200 backdrop-blur-lg transition-all duration-200 hover:border-white/30 hover:bg-slate-800/80 active:scale-[0.98] cursor-pointer"
        >
          Explore Live Swarm
        </button>
      </div>

      {/* Glowcard Stats Grid */}
      <div className="relative z-10 grid w-full max-w-4xl grid-cols-1 gap-4 sm:grid-cols-3">
        {STATS.map((stat, i) => (
          <div
            key={i}
            className="group relative overflow-hidden rounded-2xl border border-white/10 bg-slate-900/50 p-6 backdrop-blur-xl transition-all duration-300 hover:border-cyan-500/30 hover:bg-slate-900/70 hover:shadow-xl hover:shadow-cyan-950/30"
          >
            <div className="text-sm font-medium text-slate-400 font-sans mb-1">{stat.label}</div>
            <div className="text-3xl font-bold text-slate-100 font-['Syne',sans-serif] mb-2">{stat.value}</div>
            <div className="text-xs font-semibold text-cyan-400 flex items-center gap-1">
              <span>{stat.trend}</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export default CreatorStudioHero;
