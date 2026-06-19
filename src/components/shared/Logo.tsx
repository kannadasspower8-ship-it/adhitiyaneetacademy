import Link from "next/link";

interface LogoProps {
  className?: string;
  light?: boolean;
}

export function Logo({ className = "", light = false }: LogoProps) {
  return (
    <Link href="/" className={`flex items-center gap-2.5 sm:gap-3 group ${className}`}>
      {/* Crest SVG */}
      <div className="relative w-10 h-10 sm:w-12 sm:h-12 flex-shrink-0">
        <svg viewBox="0 0 100 100" className="w-full h-full">
          {/* Laurel Wreath (Gold) */}
          {/* Left Laurel */}
          <path
            d="M 35 75 C 22 62 22 38 35 25 M 34 68 C 24 57 26 43 35 32"
            fill="none"
            stroke="#D4AF37"
            strokeWidth="3"
            strokeLinecap="round"
          />
          {/* Left Laurel Leaves */}
          <path d="M 28 65 Q 22 62 25 57 C 28 58 29 61 28 65 Z" fill="#D4AF37" />
          <path d="M 24 53 Q 18 51 21 46 C 24 47 25 50 24 53 Z" fill="#D4AF37" />
          <path d="M 25 41 Q 20 38 23 33 C 26 34 27 37 25 41 Z" fill="#D4AF37" />
          <path d="M 30 29 Q 27 24 31 20 C 33 22 33 26 30 29 Z" fill="#D4AF37" />

          {/* Right Laurel */}
          <path
            d="M 65 75 C 78 62 78 38 65 25 M 66 68 C 76 57 74 43 65 32"
            fill="none"
            stroke="#D4AF37"
            strokeWidth="3"
            strokeLinecap="round"
          />
          {/* Right Laurel Leaves */}
          <path d="M 72 65 Q 78 62 75 57 C 72 58 71 61 72 65 Z" fill="#D4AF37" />
          <path d="M 76 53 Q 82 51 79 46 C 76 47 75 50 76 53 Z" fill="#D4AF37" />
          <path d="M 75 41 Q 80 38 77 33 C 74 34 73 37 75 41 Z" fill="#D4AF37" />
          <path d="M 70 29 Q 73 24 69 20 C 67 22 67 26 70 29 Z" fill="#D4AF37" />

          {/* Inner Circle */}
          <circle cx="50" cy="50" r="21" fill={light ? "#0b132b" : "#ffffff"} stroke="#D4AF37" strokeWidth="2.5" />

          {/* Letter 'A' */}
          <text
            x="50"
            y="58"
            fontFamily="Georgia, serif"
            fontWeight="bold"
            fontSize="24"
            fill={light ? "#ffffff" : "#0b132b"}
            textAnchor="middle"
          >
            A
          </text>

          {/* Graduation Cap at the top */}
          <polygon
            points="50,13 67,20 50,27 33,20"
            fill={light ? "#ffffff" : "#0b132b"}
            stroke="#D4AF37"
            strokeWidth="1.5"
          />
          <path
            d="M 41,23 L 41,27 C 41,30 59,30 59,27 L 59,23"
            fill={light ? "#ffffff" : "#0b132b"}
            stroke="#D4AF37"
            strokeWidth="1"
          />
          <path
            d="M 50,20 L 64,22 L 67,31"
            fill="none"
            stroke="#D4AF37"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
          <polygon points="65,31 69,31 67,35" fill="#D4AF37" />
        </svg>
      </div>

      <div className="flex flex-col">
        <span className={`font-heading font-extrabold text-base sm:text-lg leading-none tracking-tight ${light ? "text-white" : "text-[#0B132B]"}`}>
          ADHITYA
        </span>
        <span className="text-[9px] sm:text-[10px] tracking-[0.15em] font-extrabold uppercase text-accent mt-0.5">
          NEET ACADEMY
        </span>
      </div>
    </Link>
  );
}
