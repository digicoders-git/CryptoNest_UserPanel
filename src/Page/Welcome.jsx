import React from "react";
import { useNavigate } from "react-router-dom";

const WelcomeCard = () => {
  const navigate = useNavigate();

  return (
    <div className="w-screen h-screen bg-black overflow-hidden">
      <div className="w-full h-full bg-black flex flex-col">
        <div className="flex-1 flex items-center justify-center">
          <div
            className="rounded-full h-72 w-72 flex items-center justify-center 
                  border-8 border-[#FCE270] shadow-lg bg-black"
          >
            <img
              src="/Nextlogo-removebg-preview.png"
              alt="Cryptologo.png"
              className="h-50 w-50 object-contain"
            />
          </div>
        </div>

        {/* ===== BOTTOM TEXT SECTION ===== */}
        <div className="bg-[#111111] px-6 pt-10 pb-6 rounded-t-3xl border-t border-[#FCE270]/30">
          <h1 className="text-[26px] font-bold text-white leading-tight">
            Welcome To <br /> CryptoNest Token
          </h1>

          <p className="text-gray-400 text-[14px] mt-4 max-w-[280px] leading-relaxed">
            Empowering your digital future. Join the next generation of NFT 
            trading in a secure, high-performance ecosystem built for the elite.
          </p>

          <div className="flex justify-end mt-6">
            <button
              onClick={() => navigate("/login")}
              className="bg-[#FCE270] text-black px-6 py-3 rounded-full text-sm font-semibold shadow-[0_0_15px_rgba(252,226,112,0.3)] hover:bg-[#FBE9A7] transition-all"
            >
              Explore Crypto
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WelcomeCard;
