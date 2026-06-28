import Link from "next/link";
import Image from "next/image";

interface LogoProps {
  className?: string;
  light?: boolean;
}

export function Logo({ className = "", light = false }: LogoProps) {
  return (
    <Link href="/" className={`flex items-center group ${className}`}>
      <div className="relative h-10 w-[117px] sm:h-12 sm:w-[140px] flex-shrink-0">
        <Image
          src="/logo.png"
          alt="ADHITYA NEET ACADEMY"
          fill
          sizes="(max-width: 640px) 117px, 140px"
          className={`object-contain transition-all duration-300 ${
            light ? "brightness-0 invert opacity-80 group-hover:opacity-100" : ""
          }`}
          priority
        />
      </div>
    </Link>
  );
}
