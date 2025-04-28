import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import * as THREE from "three";
import FOG from "vanta/dist/vanta.fog.min";
import logo from "../assets/logo-arcana-screen.png";

const LandingPage = () => {
  const vantaRef = useRef<HTMLDivElement>(null);
  const [vantaEffect, setVantaEffect] = useState<any>(null);

  useEffect(() => {
    if (!vantaEffect && vantaRef.current) {
      setVantaEffect(
        FOG({
          el: vantaRef.current,
          THREE: THREE,
          mouseControls: true,
          touchControls: true,
          gyroControls: false,
          highlightColor: 0x5b7c99,
          midtoneColor: 0x2c3e50,
          lowlightColor: 0x1b263b,
          baseColor: 0x0b0c2a,
          blurFactor: 0.6,
          speed: 0.8,
          zoom: 1.2,
        })
      );
    }
    return () => {
      if (vantaEffect) vantaEffect.destroy();
    };
  }, [vantaEffect]);

  return (
    <div
      ref={vantaRef}
      className="min-h-screen flex flex-col justify-between text-white relative overflow-hidden"
    >
      {/* --- HEADER --- */}
      <div className="flex flex-col items-center text-center pt-10">
        <img
          src={logo}
          alt="ArcanaScreen Logo"
          className="w-36 h-36 drop-shadow-lg mb-6"
        />
        <h1
          className="font-cinzel text-[2.7rem] md:text-[4rem] font-extrabold tracking-tight mb-2 text-[#D9B310] drop-shadow-lg"
          style={{ letterSpacing: '0.03em' }}
        >
          ArcanaScreen
        </h1>
        <p
          className="font-inter text-lg md:text-2xl max-w-md mb-4 text-[#F5F3EF]"
          style={{ textShadow: '0 2px 12px #1C2541bb' }}
        >
          Organize. Improvise. Rule your table.
        </p>
        <div
          className="font-inter text-base md:text-lg font-semibold text-[#3A506B]"
          style={{ textShadow: '0 1px 6px #1C254180' }}
        >
          Start Building Your Screen
        </div>
      </div>

      {/* --- BOTTONE SPAZIO CONTROLLATO --- */}
      <div className="flex flex-col items-center" style={{ paddingTop: '10vh' }}>
        <Link
          to="/app"
          className="font-inter bg-[#D9B310] hover:bg-[#b89c0c] text-[#1C2541] font-bold py-3 px-8 rounded-2xl shadow-lg transition transform hover:scale-105 border-2 border-[#3A506B]"
          style={{ boxShadow: '0 2px 16px #1C2541bb' }}
        >
          Open Editor
        </Link>
      </div>

      {/* --- FOOTER --- */}
      <footer className="text-[#B0B0B0] text-xs text-center py-4 font-inter">
        &copy; {new Date().getFullYear()} ArcanaScreen &mdash; All rights reserved.
      </footer>
    </div>
  );
};

export default LandingPage;
