"use client"

import React, { useId } from "react"

export type MascotState = "idle" | "username" | "password" | "peek" | "loading"

interface SmkMascotProps {
  state: MascotState
  className?: string
  message?: string
}

export const SmkMascot: React.FC<SmkMascotProps> = ({ state, className = "", message }) => {
  const gradientId = useId()

  // Default speech bubble texts based on state
  const defaultMessages: Record<MascotState, string> = {
    idle: "Halo Sahabat SMK! Yuk masuk ke portal survei.",
    username: "Sedang mengetik akun atau NPSN ya?",
    password: "Aku tutup mata ya, rahasiamu aman!",
    peek: "Hehe, ngintip dikit biar sandinya nggak keliru!",
    loading: "Sedang memverifikasi data... Semangat!",
  }

  const activeMessage = message || defaultMessages[state]

  // Dynamic eye and pupil calculations based on state
  const isCoveringEyes = state === "password"
  const isPeeking = state === "peek"
  const isWatchingForm = state === "username"
  const isLoading = state === "loading"

  // Pupil offsets
  let leftPupilX = 142
  let leftPupilY = 162
  let rightPupilX = 188
  let rightPupilY = 162

  if (isWatchingForm) {
    // Looking down-right toward the login form
    leftPupilX = 146
    leftPupilY = 165
    rightPupilX = 192
    rightPupilY = 165
  }

  return (
    <div className={`relative flex flex-col items-center select-none ${className}`}>
      {/* Speech Bubble */}
      <div className="mb-3 transition-all duration-300 ease-out transform">
        <div className="relative bg-white text-slate-800 text-xs font-semibold px-4 py-2.5 rounded-2xl shadow-xl shadow-blue-950/20 border border-amber-200/80 max-w-[240px] text-center flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#FFB703] animate-pulse shrink-0" />
          <span>{activeMessage}</span>
          {/* Bubble tail pointing down to mascot */}
          <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[8px] border-t-white" />
        </div>
      </div>

      {/* SVG Mascot Character */}
      <div className="w-full max-w-[290px] relative transition-transform duration-300">
        <svg
          viewBox="0 0 320 380"
          className="w-full h-auto overflow-visible drop-shadow-2xl"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id={`hatGrad-${gradientId}`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#1E77BD" />
              <stop offset="100%" stopColor="#0B5C9E" />
            </linearGradient>
            <linearGradient id={`uniformGrad-${gradientId}`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#0B5C9E" />
              <stop offset="100%" stopColor="#073B66" />
            </linearGradient>
            <linearGradient id={`goldGrad-${gradientId}`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FFE066" />
              <stop offset="100%" stopColor="#FFB703" />
            </linearGradient>
          </defs>

          {/* Peeking Wall / Border edge (illustrates clinging from the edge) */}
          <g className="opacity-40">
            <line x1="72" y1="20" x2="72" y2="370" stroke="#FFFFFF" strokeWidth="4" strokeDasharray="6 6" strokeLinecap="round" />
          </g>

          {/* Mascot Body Group with gentle hovering tilt */}
          <g
            className="transition-transform duration-500 ease-out origin-[160px_200px]"
            style={{
              transform: isWatchingForm
                ? "rotate(2.5deg) translateY(4px)"
                : isCoveringEyes
                ? "translateY(2px)"
                : isLoading
                ? "translateY(-6px)"
                : "rotate(0deg)",
            }}
          >
            {/* Torso / Uniform: Kemeja Putih SMK + Rompi/Blazer Biru Kemendikbud */}
            <g id="body-uniform">
              {/* Shoulders & White Shirt Body */}
              <path
                d="M100 280 Q160 270 220 280 L235 380 L85 380 Z"
                fill="#FFFFFF"
                stroke="#CBD5E1"
                strokeWidth="2"
              />

              {/* Blue SMK Vest / Rompi Kejuruan */}
              <path
                d="M102 284 L132 380 L86 380 L98 288 Z"
                fill={`url(#uniformGrad-${gradientId})`}
              />
              <path
                d="M218 284 L188 380 L234 380 L222 288 Z"
                fill={`url(#uniformGrad-${gradientId})`}
              />

              {/* Shirt Collar */}
              <path
                d="M130 258 L160 285 L144 290 L126 268 Z"
                fill="#F8FAFC"
                stroke="#94A3B8"
                strokeWidth="1.5"
              />
              <path
                d="M190 258 L160 285 L176 290 L194 268 Z"
                fill="#F8FAFC"
                stroke="#94A3B8"
                strokeWidth="1.5"
              />

              {/* Dasi SMK Biru Abu */}
              <path
                d="M154 282 L166 282 L169 340 L160 354 L151 340 Z"
                fill="#0B5C9E"
              />
              <path
                d="M151 280 L169 280 L165 292 L155 292 Z"
                fill="#FFB703"
              />

              {/* Badge SMK BISA / Tut Wuri Handayani di saku kiri */}
              <rect x="194" y="310" width="18" height="22" rx="4" fill="#FFFFFF" stroke="#0B5C9E" strokeWidth="1.5" />
              <path d="M197 317 L209 317 M203 313 L203 325" stroke="#FFB703" strokeWidth="2" strokeLinecap="round" />
            </g>

            {/* Neck */}
            <rect x="146" y="235" width="28" height="30" rx="6" fill="#F8C49D" />

            {/* Head & Face */}
            <g id="head">
              {/* Ears */}
              <circle cx="106" cy="175" r="14" fill="#F8C49D" />
              <circle cx="106" cy="175" r="8" fill="#EEA77B" opacity="0.6" />
              <circle cx="214" cy="175" r="14" fill="#F8C49D" />
              <circle cx="214" cy="175" r="8" fill="#EEA77B" opacity="0.6" />

              {/* Face Shape */}
              <ellipse cx="160" cy="178" rx="54" ry="58" fill="#FDD6BA" />

              {/* Cheeks Blush */}
              <circle cx="122" cy="188" r="9" fill="#FB7185" opacity="0.45" />
              <circle cx="198" cy="188" r="9" fill="#FB7185" opacity="0.45" />

              {/* Nose */}
              <path d="M158 174 Q160 180 164 179" stroke="#E09467" strokeWidth="2.5" fill="none" strokeLinecap="round" />

              {/* Mouth */}
              {isLoading ? (
                // Happy Open Mouth :D
                <path d="M148 194 Q160 214 172 194 Z" fill="#991B1B" />
              ) : isCoveringEyes ? (
                // Shy smile ~
                <path d="M152 196 Q160 203 168 196" stroke="#991B1B" strokeWidth="2.5" fill="none" strokeLinecap="round" />
              ) : (
                // Cheerful friendly smile
                <path d="M149 194 Q160 206 171 194" stroke="#831843" strokeWidth="3" fill="none" strokeLinecap="round" />
              )}

              {/* Eyes & Eyebrows */}
              {isLoading ? (
                // Cheerful closed arch eyes (^ _ ^)
                <g>
                  <path d="M130 162 Q142 148 154 162" stroke="#1E293B" strokeWidth="3.5" fill="none" strokeLinecap="round" />
                  <path d="M166 162 Q178 148 190 162" stroke="#1E293B" strokeWidth="3.5" fill="none" strokeLinecap="round" />
                </g>
              ) : isCoveringEyes ? (
                // Hidden behind hands, but subtle sleepy lines
                <g opacity="0.4">
                  <path d="M132 165 Q142 160 152 165" stroke="#475569" strokeWidth="2.5" fill="none" />
                  <path d="M168 165 Q178 160 188 165" stroke="#475569" strokeWidth="2.5" fill="none" />
                </g>
              ) : isPeeking ? (
                // One eye closed, one eye wide open peeking!
                <g>
                  {/* Left eye wink/closed */}
                  <path d="M132 165 Q142 173 152 165" stroke="#0F172A" strokeWidth="3.5" fill="none" strokeLinecap="round" />
                  {/* Right eye open peeking through fingers */}
                  <ellipse cx="184" cy="160" rx="12" ry="14" fill="#FFFFFF" stroke="#0F172A" strokeWidth="2" />
                  <ellipse cx="186" cy="160" rx="7" ry="8" fill="#0B5C9E" />
                  <circle cx="188" cy="157" r="2.5" fill="#FFFFFF" />
                  <path d="M174 144 Q185 138 196 144" stroke="#0F172A" strokeWidth="2.5" fill="none" strokeLinecap="round" />
                </g>
              ) : (
                // Normal Open Expressive Eyes
                <g>
                  {/* Left Eyebrow */}
                  <path d="M130 144 Q142 138 152 143" stroke="#0F172A" strokeWidth="3" fill="none" strokeLinecap="round" />
                  {/* Right Eyebrow */}
                  <path d="M168 143 Q178 138 190 144" stroke="#0F172A" strokeWidth="3" fill="none" strokeLinecap="round" />

                  {/* Left Eye White & Pupil */}
                  <ellipse cx="142" cy="162" rx="13" ry="15" fill="#FFFFFF" stroke="#0F172A" strokeWidth="2" />
                  <ellipse cx={leftPupilX} cy={leftPupilY} rx="7.5" ry="9" fill="#0B5C9E" />
                  <circle cx={leftPupilX + 2.5} cy={leftPupilY - 3} r="3" fill="#FFFFFF" />
                  <circle cx={leftPupilX - 2} cy={leftPupilY + 3} r="1.5" fill="#FFFFFF" opacity="0.8" />

                  {/* Right Eye White & Pupil */}
                  <ellipse cx="188" cy="162" rx="13" ry="15" fill="#FFFFFF" stroke="#0F172A" strokeWidth="2" />
                  <ellipse cx={rightPupilX} cy={rightPupilY} rx="7.5" ry="9" fill="#0B5C9E" />
                  <circle cx={rightPupilX + 2.5} cy={rightPupilY - 3} r="3" fill="#FFFFFF" />
                  <circle cx={rightPupilX - 2} cy={rightPupilY + 3} r="1.5" fill="#FFFFFF" opacity="0.8" />
                </g>
              )}

              {/* Front Bangs Hair */}
              <path
                d="M106 148 Q125 142 142 146 Q160 135 178 144 Q196 138 214 150 Q205 130 160 128 Q115 130 106 148 Z"
                fill="#1E293B"
              />
            </g>

            {/* Topi SMK Biru Kemendikbud */}
            <g id="smk-cap">
              {/* Back cap dome */}
              <path
                d="M102 140 C100 80, 220 80, 218 140 Z"
                fill={`url(#hatGrad-${gradientId})`}
                stroke="#073B66"
                strokeWidth="2.5"
              />

              {/* Cap Fold Seam Lines */}
              <path d="M160 90 L160 135" stroke="#1E77BD" strokeWidth="2" opacity="0.6" />
              <path d="M125 102 Q140 120 148 135" stroke="#1E77BD" strokeWidth="1.5" opacity="0.5" />
              <path d="M195 102 Q180 120 172 135" stroke="#1E77BD" strokeWidth="1.5" opacity="0.5" />

              {/* Gold Ribbon / Lis Emas Topi */}
              <path
                d="M102 136 Q160 144 218 136 L219 143 Q160 151 101 143 Z"
                fill={`url(#goldGrad-${gradientId})`}
              />

              {/* Cap Visor / Pet Topi melengkung kedepan */}
              <path
                d="M96 140 Q160 165 224 140 Q160 152 96 140 Z"
                fill="#073B66"
                stroke="#0B5C9E"
                strokeWidth="1.5"
              />

              {/* Golden Tut Wuri Handayani / Star Emblem on Cap */}
              <circle cx="160" cy="116" r="11" fill={`url(#goldGrad-${gradientId})`} stroke="#FFFFFF" strokeWidth="1.5" />
              {/* Star / Wings emblem shape */}
              <path
                d="M160 108 L163 114 L169 114 L164 118 L166 124 L160 120 L154 124 L156 118 L151 114 L157 114 Z"
                fill="#0B5C9E"
              />
            </g>

            {/* Arms and Hands: Dynamic Peeking / Eye-covering Hands */}
            <g id="hands-interaction">
              {isCoveringEyes ? (
                // === STATE: PASSWORD -> Hands covering eyes ===
                <g className="transition-all duration-300">
                  {/* Left Arm & Hand over Left Eye */}
                  <path
                    d="M90 280 Q96 200 130 170"
                    stroke="#FFFFFF"
                    strokeWidth="24"
                    strokeLinecap="round"
                    fill="none"
                  />
                  <ellipse cx="134" cy="165" rx="17" ry="14" fill="#FDD6BA" stroke="#E2E8F0" strokeWidth="2" />
                  {/* Fingers */}
                  <path d="M125 158 Q135 155 145 158" stroke="#E09467" strokeWidth="1.5" fill="none" />
                  <path d="M125 165 Q135 162 145 165" stroke="#E09467" strokeWidth="1.5" fill="none" />
                  <path d="M127 172 Q136 170 144 172" stroke="#E09467" strokeWidth="1.5" fill="none" />

                  {/* Right Arm & Hand over Right Eye */}
                  <path
                    d="M230 280 Q224 200 190 170"
                    stroke="#FFFFFF"
                    strokeWidth="24"
                    strokeLinecap="round"
                    fill="none"
                  />
                  <ellipse cx="186" cy="165" rx="17" ry="14" fill="#FDD6BA" stroke="#E2E8F0" strokeWidth="2" />
                  {/* Fingers */}
                  <path d="M175 158 Q185 155 195 158" stroke="#E09467" strokeWidth="1.5" fill="none" />
                  <path d="M175 165 Q185 162 195 165" stroke="#E09467" strokeWidth="1.5" fill="none" />
                  <path d="M176 172 Q184 170 193 172" stroke="#E09467" strokeWidth="1.5" fill="none" />
                </g>
              ) : isPeeking ? (
                // === STATE: PEEK -> Left hand covering, Right hand slightly open with spread fingers ===
                <g className="transition-all duration-300">
                  {/* Left hand still covers left eye */}
                  <path
                    d="M90 280 Q96 200 130 170"
                    stroke="#FFFFFF"
                    strokeWidth="24"
                    strokeLinecap="round"
                    fill="none"
                  />
                  <ellipse cx="134" cy="165" rx="17" ry="14" fill="#FDD6BA" stroke="#E2E8F0" strokeWidth="2" />

                  {/* Right hand pulled down to cheek, peeking! */}
                  <path
                    d="M230 280 Q226 220 200 188"
                    stroke="#FFFFFF"
                    strokeWidth="24"
                    strokeLinecap="round"
                    fill="none"
                  />
                  <ellipse cx="204" cy="184" rx="16" ry="13" fill="#FDD6BA" stroke="#E2E8F0" strokeWidth="2" />
                  <circle cx="212" cy="180" r="4" fill="#FDD6BA" />
                </g>
              ) : isLoading ? (
                // === STATE: LOADING -> Thumbs Up / Cheer pose ===
                <g className="transition-all duration-300">
                  {/* Left Hand Holding Edge */}
                  <ellipse cx="78" cy="270" rx="14" ry="11" fill="#FDD6BA" stroke="#E2E8F0" strokeWidth="2" />
                  {/* Right Hand Thumbs up */}
                  <path
                    d="M230 290 Q240 220 226 210"
                    stroke="#FFFFFF"
                    strokeWidth="22"
                    strokeLinecap="round"
                    fill="none"
                  />
                  <ellipse cx="226" cy="204" rx="13" ry="12" fill="#FDD6BA" />
                  {/* Thumb sticking up */}
                  <path d="M226 204 L226 190 Q228 186 232 190 L232 204 Z" fill="#FDD6BA" />
                </g>
              ) : (
                // === STATE: DEFAULT / IDLE / USERNAME -> Hands Clinging onto the Left Border / Screen Edge ===
                <g className="transition-all duration-300">
                  {/* Left hand gripping the vertical left barrier/screen */}
                  <g id="left-clinging-hand">
                    <path
                      d="M106 280 Q84 255 74 240"
                      stroke="#FFFFFF"
                      strokeWidth="22"
                      strokeLinecap="round"
                      fill="none"
                    />
                    {/* Clinging Fingers on edge x=72 */}
                    <ellipse cx="72" cy="232" rx="10" ry="7" fill="#FDD6BA" stroke="#E2E8F0" strokeWidth="1.5" />
                    <ellipse cx="72" cy="242" rx="10" ry="7" fill="#FDD6BA" stroke="#E2E8F0" strokeWidth="1.5" />
                    <ellipse cx="73" cy="252" rx="9" ry="7" fill="#FDD6BA" stroke="#E2E8F0" strokeWidth="1.5" />
                    <circle cx="79" cy="242" r="7" fill="#FDD6BA" />
                  </g>

                  {/* Right hand resting forward */}
                  <g id="right-clinging-hand">
                    <path
                      d="M214 286 Q170 310 130 300"
                      stroke="#FFFFFF"
                      strokeWidth="20"
                      strokeLinecap="round"
                      fill="none"
                    />
                    <ellipse cx="124" cy="298" rx="13" ry="10" fill="#FDD6BA" stroke="#E2E8F0" strokeWidth="1.5" />
                    <circle cx="118" cy="296" r="4.5" fill="#FDD6BA" />
                  </g>
                </g>
              )}
            </g>
          </g>
        </svg>
      </div>
    </div>
  )
}

export default SmkMascot

