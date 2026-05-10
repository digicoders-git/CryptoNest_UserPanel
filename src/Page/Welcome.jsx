import React from 'react';
import { TrendingUp, Shield, Zap, Bitcoin, ArrowRight, BarChart3 } from 'lucide-react';
import { Link } from 'react-router-dom';

const WelcomeScreen = () => {
  return (
    <div className="min-h-screen bg-black text-white overflow-hidden">

      {/* Background Gradient Effects */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-yellow-900/10 via-black to-black" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-yellow-900/20 via-transparent to-transparent" />

      {/* Main Container */}
      <div className="relative min-h-screen flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8">

        {/* Logo & Brand Section */}
        <div className="text-center mb-8 sm:mb-12 animate-fade-in">
          <div className="flex items-center justify-center mb-2 mt-6">

            {/* <Bitcoin className="w-10 h-10 sm:w-12 sm:h-12 text-white" /> */}
            <img src="/Nextlogo-removebg-preview.png" alt="Logo" className="w-21 h-21 sm:w-12 sm:h-12" />

          </div>



          <p className="text-lg sm:text-lg md:text-2xl text-gray-400 font-light tracking-wide">
            Trade Smarter. Trade Faster.
          </p>


        </div>

        {/* Features Grid - 3 Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 w-full max-w-4xl mb-10 sm:mb-16 px-1">

          {/* Feature 1 */}
          <div className="bg-gradient-to-br from-gray-900 to-gray-800 border border-gray-700/50 rounded-2xl p-5 sm:p-6 backdrop-blur-sm hover:border-[#FCE270]/50 transition-all duration-300 group">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-yellow-600/20 rounded-xl flex items-center justify-center mb-4 group-hover:bg-yellow-600/30 transition-colors">
              <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 text-[#FCE270]" />
            </div>
            <h3 className="text-base sm:text-lg font-semibold mb-2">Live Trading</h3>
            <p className="text-xs sm:text-sm text-gray-400">Real-time market data with lightning fast execution</p>
          </div>

          {/* Feature 2 */}
          <div className="bg-gradient-to-br from-gray-900 to-gray-800 border border-gray-700/50 rounded-2xl p-5 sm:p-6 backdrop-blur-sm hover:border-[#FCE270]/50 transition-all duration-300 group">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-yellow-600/20 rounded-xl flex items-center justify-center mb-4 group-hover:bg-yellow-600/30 transition-colors">
              <Shield className="w-5 h-5 sm:w-6 sm:h-6 text-[#FCE270]" />
            </div>
            <h3 className="text-base sm:text-lg font-semibold mb-2">Secure Wallet</h3>
            <p className="text-xs sm:text-sm text-gray-400">Bank-grade security for your digital assets</p>
          </div>


        </div>

        {/* Live Crypto Ticker */}


        {/* CTA Buttons */}
        <div className="w-full max-w-sm mx-auto space-y-3 sm:space-y-4">
          <Link
            to="/SingUp"
            className="w-full bg-gradient-to-r from-yellow-600 to-[#FCE270] text-black font-bold py-4 rounded-xl hover:from-yellow-700 hover:to-yellow-500 transform hover:scale-[1.02] transition-all duration-300 shadow-lg shadow-yellow-500/25 flex items-center justify-center gap-2 text-base sm:text-lg"
          >
            Get Started
            <ArrowRight className="w-5 h-5" />
          </Link>

          <Link
            to="/Login"
            className="w-full bg-transparent border border-gray-700 text-gray-300 font-semibold py-4 rounded-xl hover:bg-gray-900 hover:border-gray-600 transition-all duration-300 flex items-center justify-center text-base sm:text-lg"
          >
            I already have an account
          </Link>
        </div>

        {/* Trust Badge */}
        <div className="mt-8 sm:mt-12 mb-4 text-center">
          <div className="flex items-center justify-center gap-2 text-gray-500">
            {/* <BarChart3 className="w-4 h-4" /> */}
            <p className="text-xs sm:text-sm">Trusted by 50,000+ active traders worldwide</p>
          </div>
        </div>


      </div>
    </div>
  );
};

export default WelcomeScreen;