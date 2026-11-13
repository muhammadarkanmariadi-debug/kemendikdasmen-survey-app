"use client"

import React, { useId } from "react"

export type MascotState = "idle" | "username" | "password" | "peek" | "loading"

interface SmkMascotProps {
  state?: MascotState
  className?: string
  message?: string
  barColor?: string
  roleSubtitle?: string
}

export const SmkMascot: React.FC<SmkMascotProps> = ({
  state = "idle",
  className = "",
  message,
  barColor = "#0B5C9E",
  roleSubtitle = "Siswa SMK &bull; Sahabat Survei",
}) => {
  const compId = useId()

  // Default friendly speech bubble messages matching school survey theme
  const defaultMessages: Record<MascotState, string> = {
    idle: "Halo Sahabat SMK! Yuk isi survei mutu bersama kami.",
    username: "Siap! Sedang mengetik akun atau kata kunci ya?",
    password: "Tenang, aku jaga kerahasiaan sandimu!",
    peek: "Hehe, ngintip dikit biar sandi tidak keliru!",
    loading: "Sedang memproses data... Tetap semangat!",
  }

  const activeMessage = message || defaultMessages[state]

  // State flags
  const isCoveringEyes = state === "password"
  const isPeeking = state === "peek"
  const isLookingAtForm = state === "username"
  const isLoading = state === "loading"

  // Pupil offsets
  let pupilX = 168
  let pupilY = 175
  if (isLookingAtForm) {
    pupilX = 172
    pupilY = 178
  }

  return (
    <div className={`relative flex flex-col items-center select-none ${className}`}>
      {/* Friendly Speech Bubble */}
      <div className="mb-2 transition-all duration-300 ease-out transform">
        <div className="relative bg-white text-slate-800 text-xs font-semibold px-4 py-2 rounded-2xl shadow-lg shadow-slate-900/10 border border-slate-200/80 max-w-[260px] text-center flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#0B5C9E] animate-pulse shrink-0" />
          <span className="leading-snug">{activeMessage}</span>
          {/* Bubble tail pointing down towards the mascot */}
          <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[5px] border-l-transparent border-r-[5px] border-r-transparent border-t-[6px] border-t-white" />
        </div>
      </div>

      {/* SVG Mascot Character Peeking from Vertical Bar */}
      <div className="w-full relative transition-transform duration-300">
        <svg
          viewBox="0 0 340 380"
          className="w-full h-auto overflow-visible drop-shadow-xl"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            {/* Skin Shading Gradients */}
            <linearGradient id={`skinGrad-${compId}`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FDDCC4" />
              <stop offset="100%" stopColor="#F6B894" />
            </linearGradient>

            {/* Hair Gradient */}
            <linearGradient id={`hairGrad-${compId}`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#503322" />
              <stop offset="100%" stopColor="#2E1C12" />
            </linearGradient>

            {/* SMK Tie Gradient (Abu-Abu SMK) */}
            <linearGradient id={`tieGrad-${compId}`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#64748B" />
              <stop offset="100%" stopColor="#475569" />
            </linearGradient>

            {/* Uniform White Shirt Shadow */}
            <linearGradient id={`shirtGrad-${compId}`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FFFFFF" />
              <stop offset="100%" stopColor="#F1F5F9" />
            </linearGradient>

            {/* Bar Accent Gradient */}
            <linearGradient id={`barGrad-${compId}`} x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor={barColor} />
              <stop offset="100%" stopColor="#073B66" />
            </linearGradient>

            <filter id={`softShadow-${compId}`} x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="3" dy="4" stdDeviation="4" floodOpacity="0.15" />
            </filter>
          </defs>

          {/* Group: Mascot Peeking Behind the Vertical Bar */}
          <g className="transition-transform duration-500 ease-out origin-[160px_200px]">
            {/* --- TORSO & SERAGAM SMK --- */}
            {/* Body / Kemeja Putih Seragam SMK */}
            <g id="smk-torso">
              {/* Main White Shirt Body */}
              <path
                d="M32 240 Q100 230 185 242 Q230 252 260 290 L235 380 L32 380 Z"
                fill={`url(#shirtGrad-${compId})`}
                stroke="#E2E8F0"
                strokeWidth="2"
              />

              {/* Shirt Seams & Fold lines */}
              <path d="M120 280 L115 380" stroke="#E2E8F0" strokeWidth="2" strokeDasharray="3 3" />
              <path d="M185 242 L180 380" stroke="#CBD5E1" strokeWidth="1.5" />

              {/* Seragam SMK Shirt Collar (Kerah Putih) */}
              <path
                d="M100 232 L132 270 L118 274 L92 240 Z"
                fill="#FFFFFF"
                stroke="#CBD5E1"
                strokeWidth="1.5"
              />
              <path
                d="M168 234 L134 270 L148 274 L176 242 Z"
                fill="#FFFFFF"
                stroke="#CBD5E1"
                strokeWidth="1.5"
              />

              {/* Dasi Seragam Sekolah Abu-Abu SMK */}
              <path
                d="M128 268 L140 268 L145 345 L134 360 L123 345 Z"
                fill={`url(#tieGrad-${compId})`}
              />
              {/* Tie Knot */}
              <polygon points="126,266 142,266 138,279 130,279" fill="#334155" />

              {/* Saku Kemeja Seragam SMK di Dada Kiri (kanan visual) */}
              <g id="saku-badge" transform="translate(162, 292)">
                {/* Pocket */}
                <rect x="0" y="0" width="28" height="34" rx="4" fill="#FFFFFF" stroke="#CBD5E1" strokeWidth="1.5" />
                {/* Badge OSIS / Logo Tut Wuri Handayani SMK */}
                <rect x="6" y="5" width="16" height="22" rx="3" fill="#0B5C9E" />
                <path d="M14 8 L14 24 M8 13 L20 13" stroke="#FFB703" strokeWidth="1.5" strokeLinecap="round" />
                <circle cx="14" cy="19" r="2.5" fill="#EF4444" />
                <polygon points="14,9 11,13 17,13" fill="#FFB703" />
              </g>

              {/* Shoulder & Sleeves */}
              <path
                d="M32 240 Q60 236 100 232"
                stroke="#CBD5E1"
                strokeWidth="2"
                fill="none"
              />
            </g>

            {/* --- NECK --- */}
            <path d="M120 215 L148 215 L146 245 L122 245 Z" fill={`url(#skinGrad-${compId})`} />
            {/* Neck shadow under jaw */}
            <path d="M120 215 Q134 225 148 215 L147 222 Q134 230 121 222 Z" fill="#E89E78" opacity="0.6" />

            {/* --- HEAD & FACE --- */}
            <g id="head" transform="rotate(-3 135 170)">
              {/* Left & Right Ears */}
              <circle cx="92" cy="176" r="12" fill="#F8B690" />
              <circle cx="92" cy="176" r="6" fill="#DE8C63" opacity="0.6" />
              <circle cx="178" cy="174" r="12" fill="#F8B690" />
              <circle cx="178" cy="174" r="6" fill="#DE8C63" opacity="0.6" />

              {/* Face Contour */}
              <path
                d="M96 150 C94 110 176 110 174 150 C174 195 156 220 135 220 C114 220 96 195 96 150 Z"
                fill={`url(#skinGrad-${compId})`}
              />

              {/* Cute Cheek Blushes */}
              <ellipse cx="110" cy="186" rx="8" ry="5" fill="#FB7185" opacity="0.5" />
              <ellipse cx="160" cy="186" rx="8" ry="5" fill="#FB7185" opacity="0.5" />

              {/* Nose */}
              <path d="M133 170 Q135 178 138 177" stroke="#DE8C63" strokeWidth="2.5" fill="none" strokeLinecap="round" />

              {/* Mouth based on state */}
              {isLoading ? (
                // Big Happy Open Mouth :D
                <path d="M124 190 Q135 208 146 190 Z" fill="#991B1B" />
              ) : isCoveringEyes ? (
                // Shy soft smile ~
                <path d="M127 192 Q135 198 143 192" stroke="#991B1B" strokeWidth="2.5" fill="none" strokeLinecap="round" />
              ) : (
                // Friendly warm open smile with teeth
                <g>
                  <path d="M124 190 Q135 205 146 190 Z" fill="#881337" />
                  <path d="M127 190 Q135 194 143 190 Z" fill="#FFFFFF" />
                </g>
              )}

              {/* Eyes & Eyebrows */}
              {isLoading ? (
                // Happy closed arched eyes (^ _ ^)
                <g>
                  <path d="M110 162 Q120 152 130 162" stroke="#1E293B" strokeWidth="3" fill="none" strokeLinecap="round" />
                  <path d="M140 162 Q150 152 160 162" stroke="#1E293B" strokeWidth="3" fill="none" strokeLinecap="round" />
                </g>
              ) : isCoveringEyes ? (
                // Shy sleeping eyes
                <g opacity="0.6">
                  <path d="M112 165 Q120 160 128 165" stroke="#475569" strokeWidth="2.5" fill="none" strokeLinecap="round" />
                  <path d="M142 165 Q150 160 158 165" stroke="#475569" strokeWidth="2.5" fill="none" strokeLinecap="round" />
                </g>
              ) : isPeeking ? (
                // Wink / Peeking: Left eye wink, right eye open wide!
                <g>
                  <path d="M112 166 Q120 173 128 166" stroke="#0F172A" strokeWidth="3.5" fill="none" strokeLinecap="round" />
                  <ellipse cx="152" cy="162" rx="10" ry="12" fill="#FFFFFF" stroke="#0F172A" strokeWidth="2" />
                  <circle cx="153" cy="162" r="6" fill="#0B5C9E" />
                  <circle cx="155" cy="159" r="2" fill="#FFFFFF" />
                  <path d="M144 148 Q152 142 160 147" stroke="#0F172A" strokeWidth="2.5" fill="none" strokeLinecap="round" />
                </g>
              ) : (
                // Normal Expressive Friendly Eyes
                <g>
                  {/* Eyebrows */}
                  <path d="M108 150 Q118 143 128 149" stroke="#332219" strokeWidth="3" fill="none" strokeLinecap="round" />
                  <path d="M142 149 Q152 143 162 150" stroke="#332219" strokeWidth="3" fill="none" strokeLinecap="round" />

                  {/* Left Eye */}
                  <ellipse cx="119" cy="165" rx="9" ry="11" fill="#FFFFFF" stroke="#0F172A" strokeWidth="1.8" />
                  <circle cx={isLookingAtForm ? 122 : 120} cy={isLookingAtForm ? 166 : 165} r="5.5" fill="#0B5C9E" />
                  <circle cx={isLookingAtForm ? 124 : 122} cy={isLookingAtForm ? 163 : 162} r="2" fill="#FFFFFF" />

                  {/* Right Eye */}
                  <ellipse cx="151" cy="165" rx="9" ry="11" fill="#FFFFFF" stroke="#0F172A" strokeWidth="1.8" />
                  <circle cx={isLookingAtForm ? 154 : 152} cy={isLookingAtForm ? 166 : 165} r="5.5" fill="#0B5C9E" />
                  <circle cx={isLookingAtForm ? 156 : 154} cy={isLookingAtForm ? 163 : 162} r="2" fill="#FFFFFF" />
                </g>
              )}

              {/* Stylish Indonesian Student Hair Cut */}
              <g id="hair">
                {/* Hair Base & Bangs */}
                <path
                  d="M93 150 C90 98 180 95 177 150 C172 132 165 125 152 128 C144 122 130 120 122 130 C114 124 100 132 93 150 Z"
                  fill={`url(#hairGrad-${compId})`}
                />
                {/* Hair Volume / Strands */}
                <path
                  d="M102 116 Q134 94 168 114"
                  stroke="#6B4423"
                  strokeWidth="2.5"
                  fill="none"
                  strokeLinecap="round"
                />
              </g>
            </g>

            {/* --- RIGHT ARM: SHADING EYES / LOOKING FORWARD (Pose Meneropong seperti referensi) --- */}
            <g id="arm-shading-eyes">
              {/* Upper Arm from Right Shoulder */}
              <path
                d="M210 265 Q235 235 240 185"
                stroke={`url(#shirtGrad-${compId})`}
                strokeWidth="26"
                strokeLinecap="round"
                fill="none"
              />
              <path
                d="M210 265 Q235 235 240 185"
                stroke="#CBD5E1"
                strokeWidth="1.5"
                strokeLinecap="round"
                fill="none"
              />

              {/* Forearm bent toward forehead */}
              <path
                d="M240 185 Q220 145 168 136"
                stroke={`url(#skinGrad-${compId})`}
                strokeWidth="20"
                strokeLinecap="round"
                fill="none"
              />

              {/* Shirt Sleeve Cuff at Elbow */}
              <ellipse cx="238" cy="186" rx="14" ry="9" fill="#FFFFFF" stroke="#CBD5E1" strokeWidth="1.5" transform="rotate(-20 238 186)" />

              {/* Right Hand: Placed horizontally at eyebrow shading eyes looking forward */}
              <g id="shading-hand" transform="translate(142, 126)">
                {/* Hand Palm / Back of hand */}
                <path
                  d="M0 10 Q14 2 32 4 Q38 10 32 16 Q14 15 0 14 Z"
                  fill={`url(#skinGrad-${compId})`}
                  stroke="#DE8C63"
                  strokeWidth="1.5"
                />
                {/* Fingers held together flat shading the brow */}
                <path d="M4 8 L28 6" stroke="#DE8C63" strokeWidth="1.5" strokeLinecap="round" />
                <path d="M6 12 L26 10" stroke="#DE8C63" strokeWidth="1.2" strokeLinecap="round" />
                {/* Thumb slightly curved */}
                <path d="M2 13 Q6 17 12 16" stroke="#DE8C63" strokeWidth="1.2" strokeLinecap="round" fill="none" />
              </g>
            </g>

            {/* --- LEFT ARM & HAND: GRIPPING / HOOKING ONTO THE VERTICAL BAR --- */}
            {/* The Left arm comes from behind the vertical bar */}
            <g id="left-arm-behind">
              <path
                d="M32 250 Q18 220 28 175"
                stroke={`url(#shirtGrad-${compId})`}
                strokeWidth="22"
                strokeLinecap="round"
                fill="none"
              />
            </g>
          </g>

          {/* --- THE VERTICAL ACCENT BAR (Peeking Border Stripe like Reference) --- */}
          {/* Matches the vertical accent stripe in the user's reference image */}
          <g id="peeking-bar" filter={`url(#softShadow-${compId})`}>
            {/* Outer Bar Body */}
            <rect
              x="18"
              y="12"
              width="16"
              height="356"
              rx="8"
              fill={`url(#barGrad-${compId})`}
            />
            {/* Glossy highlight on the bar */}
            <line
              x1="22"
              y1="24"
              x2="22"
              y2="356"
              stroke="#FFFFFF"
              strokeWidth="2"
              strokeLinecap="round"
              opacity="0.35"
            />
          </g>

          {/* --- LEFT HAND FINGERS WRAPPING AROUND THE BAR --- */}
          {/* 4 cute fingers wrapping tightly around the right side of the vertical bar from behind! */}
          <g id="fingers-on-bar">
            {/* Finger 1 (Index) */}
            <rect x="26" y="152" width="16" height="8" rx="4" fill="#F8B690" stroke="#DE8C63" strokeWidth="1.5" />
            <line x1="28" y1="156" x2="36" y2="156" stroke="#FFFFFF" strokeWidth="1" strokeLinecap="round" opacity="0.6" />

            {/* Finger 2 (Middle) */}
            <rect x="26" y="163" width="18" height="8.5" rx="4.25" fill="#F8B690" stroke="#DE8C63" strokeWidth="1.5" />
            <line x1="28" y1="167" x2="38" y2="167" stroke="#FFFFFF" strokeWidth="1" strokeLinecap="round" opacity="0.6" />

            {/* Finger 3 (Ring) */}
            <rect x="26" y="174" width="17" height="8" rx="4" fill="#F8B690" stroke="#DE8C63" strokeWidth="1.5" />
            <line x1="28" y1="178" x2="37" y2="178" stroke="#FFFFFF" strokeWidth="1" strokeLinecap="round" opacity="0.6" />

            {/* Finger 4 (Little) */}
            <rect x="26" y="185" width="14" height="7.5" rx="3.75" fill="#F8B690" stroke="#DE8C63" strokeWidth="1.5" />
            <line x1="28" y1="189" x2="34" y2="189" stroke="#FFFFFF" strokeWidth="1" strokeLinecap="round" opacity="0.6" />
          </g>
        </svg>
      </div>

      {/* Subtitle Badge */}
      <div className="mt-1 flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-[11px] font-semibold border border-slate-200">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
        <span dangerouslySetInnerHTML={{ __html: roleSubtitle }} />
      </div>
    </div>
  )
}

export default SmkMascot
