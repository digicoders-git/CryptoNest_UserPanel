import React from "react";
import { useNavigate } from "react-router-dom";

const WelcomeCard = () => {
  const navigate = useNavigate();

  return (
    <div className="w-screen h-screen bg-black overflow-hidden font-sans">
      {/* Mobile Container - iPhone like bezel effect */}
      <div className="relative w-full h-full bg-black">


        {/* Dynamic Island (Modern iPhone) */}
        <div className="absolute top-1 left-1/2 transform -translate-x-1/2 z-10">
          <div className="w-[110px] h-[35px] bg-black rounded-full"></div>
        </div>

        {/* Main Content */}
        <div className="w-full h-full flex flex-col">

          {/* Logo Section with Animation */}
          <div className="flex-1 flex items-center justify-center relative">
            {/* Background glow effect */}
            <div className="absolute w-80 h-80 bg-[#FCE270]/5 rounded-full blur-3xl"></div>

            {/* Animated ring effect */}
            <div className="relative">
              <div className="absolute inset-0 rounded-full border-2 border-[#FCE270]/20 animate-ping"></div>
              <div className="absolute inset-0 rounded-full border-4 border-[#FCE270]/40 animate-pulse"></div>
              <div
                className="rounded-full h-64 w-64 flex items-center justify-center 
                  border-[6px] border-[#FCE270] shadow-[0_0_30px_rgba(252,226,112,0.3)] 
                  bg-gradient-to-br from-black to-gray-900 relative z-10"
              >
                <img
                  src="/Nextlogo-removebg-preview.png"
                  alt="CryptoNest Logo"
                  className="h-48 w-48 object-contain drop-shadow-2xl"
                />
              </div>
            </div>
          </div>

          {/* Bottom Sheet - Mobile App Style */}
          <div className="bg-gradient-to-t from-[#0a0a0a] to-[#111111] px-6 pt-8 pb-10 rounded-t-3xl shadow-2xl border-t border-[#FCE270]/20">

            {/* Drag indicator */}
            <div className="flex justify-center mb-6">
              <div className="w-12 h-1 bg-gray-600 rounded-full"></div>
            </div>

            {/* Title with gradient */}
            <h1 className="text-3xl font-bold leading-tight">
              <span className="bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
                Welcome To
              </span>
              <br />
              <span className="bg-gradient-to-r from-[#FCE270] to-[#FCE270]/70 bg-clip-text text-transparent">
                CryptoNest Token
              </span>
            </h1>

            {/* Description */}
            <p className="text-gray-400 text-sm mt-4 leading-relaxed">
              Empowering your digital future. Join the next generation of NFT
              trading in a secure, high-performance ecosystem built for the elite.
            </p>

            {/* Features List - Mobile Style */}
            <div className="mt-6 space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-[#FCE270]/20 flex items-center justify-center">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#FCE270]"></div>
                </div>
                <span className="text-gray-300 text-xs">Secure & Decentralized</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-[#FCE270]/20 flex items-center justify-center">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#FCE270]"></div>
                </div>
                <span className="text-gray-300 text-xs">High Performance Trading</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-[#FCE270]/20 flex items-center justify-center">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#FCE270]"></div>
                </div>
                <span className="text-gray-300 text-xs">Elite Community Access</span>
              </div>
            </div>

            {/* Button Section */}
            <div className="mt-8">
              <button
                onClick={() => navigate("/login")}
                className="w-full bg-gradient-to-r from-[#FCE270] to-[#FCE270]/80 text-black 
                  py-4 rounded-2xl text-base font-bold 
                  shadow-[0_10px_20px_rgba(252,226,112,0.2)] 
                  hover:shadow-[0_15px_25px_rgba(252,226,112,0.3)]
                  active:scale-95 transition-all duration-200
                  flex items-center justify-center gap-2"
              >
                <span>Explore Crypto</span>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </button>

              {/* Footer Text */}
              <p className="text-center text-gray-600 text-[10px] mt-6">
                By continuing, you agree to our Terms & Conditions
              </p>
            </div>
          </div>
        </div>

        {/* Home Indicator (iPhone style) */}
        <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2">
          <div className="w-32 h-1 bg-gray-700 rounded-full"></div>
        </div>
      </div>
    </div>
  );
};

export default WelcomeCard;