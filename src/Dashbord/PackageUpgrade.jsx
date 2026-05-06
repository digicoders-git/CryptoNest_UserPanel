import React, { useState, useEffect } from "react";
import {
  FaCheck, FaDollarSign, FaRocket, FaGem, FaChevronLeft,
  FaCrown, FaStar, FaBolt, FaInfinity, FaChartLine,
  FaShieldAlt, FaHeadset, FaUsers, FaCoins, FaFire,
} from "react-icons/fa";
import {
  RiShieldFlashLine, RiVipCrown2Line, RiWallet3Line,
  RiCheckDoubleLine, RiGeminiLine, RiArrowUpSLine,
  RiNotification3Line, RiRefreshLine, RiVipDiamondLine,
  RiFundsLine, RiSparklingLine, RiCheckLine, RiInformationLine,
} from "react-icons/ri";
import Swal from "sweetalert2";
import { packageAPI } from "../services/api";
import useAuthCheck from "../utils/useAuthCheck";

const PackageUpgrade = ({ onBack }) => {
  const token = useAuthCheck();
  const [packages, setPackages] = useState({});
  const [currentPackage, setCurrentPackage] = useState("basic");
  const [userBalance, setUserBalance] = useState(0);
  const [loading, setLoading] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const [isPulling, setIsPulling] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  if (!token) return null;

  useEffect(() => {
    fetchPackages();

    const handleBalanceUpdate = (e) => {
      setUserBalance(e.detail.balance);
    };

    window.addEventListener("balanceUpdate", handleBalanceUpdate);
    window.addEventListener("walletBalanceUpdate", handleBalanceUpdate);

    return () => {
      window.removeEventListener("balanceUpdate", handleBalanceUpdate);
      window.removeEventListener("walletBalanceUpdate", handleBalanceUpdate);
    };
  }, []);

  // 📲 Pull to Refresh
  const handleTouchStart = (e) => {
    if (window.scrollY === 0) setIsPulling(true);
  };
  const handleTouchMove = (e) => {
    if (!isPulling) return;
    const distance = e.touches[0].clientY - 80;
    if (distance > 0 && distance < 120) setPullDistance(distance);
  };
  const handleTouchEnd = async () => {
    if (pullDistance > 80 && !refreshing) {
      setRefreshing(true);
      setPullDistance(60);
      await fetchPackages();
      setTimeout(() => {
        setRefreshing(false);
        setPullDistance(0);
      }, 500);
    } else {
      setPullDistance(0);
    }
    setIsPulling(false);
  };

  const fetchPackages = async () => {
    try {
      const res = await packageAPI.getPlans();
      const data = res.data;

      setPackages({
        basic: data.plans?.basic || {
          amount: 10,
          purchaseLimit: 500,
          unlimited: false,
        },
        premium: data.plans?.premium || {
          amount: 20,
          purchaseLimit: null,
          unlimited: true,
        },
      });

      setCurrentPackage(data.currentPlan || "basic");
      setUserBalance(data.userBalance || 0);
    } catch {
      setPackages({
        basic: { amount: 10, purchaseLimit: 500, unlimited: false },
        premium: { amount: 20, purchaseLimit: null, unlimited: true },
      });
      setCurrentPackage("basic");
      setUserBalance(0);
    }
  };

  const upgradePackage = async (type) => {
    const info = packages[type];

    if (userBalance < info.amount) {
      Swal.fire({
        icon: "error",
        title: "Insufficient Balance",
        text: `You need $${info.amount} to upgrade.`,
        background: '#1A1A1A',
        color: '#fff',
        confirmButtonColor: "#FCE270",
        confirmButtonText: '<span style="color: #000; font-weight: 900;">OK</span>',
      });
      return;
    }

    const result = await Swal.fire({
      title: `<span style="font-size: 18px; font-weight: 900; color: #fff; text-transform: uppercase;">Upgrade to ${type}</span>`,
      html: `<p style="color: #aaa; font-size: 14px;">This will cost <strong style="color: #FCE270;">$${info.amount}</strong> from your balance.</p>`,
      icon: "question",
      background: '#1A1A1A',
      showCancelButton: true,
      confirmButtonColor: "#FCE270",
      cancelButtonColor: "#333",
      confirmButtonText: '<span style="color: #000; font-weight: 900;">CONFIRM</span>',
      cancelButtonText: '<span style="color: #fff; font-weight: 900;">CANCEL</span>',
    });

    if (result.isConfirmed) {
      setLoading(true);
      try {
        await packageAPI.upgrade();
        const newBalance = userBalance - info.amount;
        setUserBalance(newBalance);

        window.dispatchEvent(
          new CustomEvent("balanceUpdate", {
            detail: { balance: newBalance },
          }),
        );

        Swal.fire({
          icon: "success",
          title: "Tier Upgraded! 🚀",
          text: "Welcome to your new premium tier.",
          background: '#1A1A1A',
          color: '#fff',
          confirmButtonColor: "#FCE270",
          confirmButtonText: '<span style="color: #000; font-weight: 900;">AWESOME</span>',
        });
        fetchPackages();
      } catch {
        Swal.fire({
          icon: "error",
          title: "Upgrade Failed",
          text: "Something went wrong. Please try again.",
          background: '#1A1A1A',
          color: '#fff',
          confirmButtonColor: "#FCE270",
          confirmButtonText: '<span style="color: #000; font-weight: 900;">CLOSE</span>',
        });
      }
      setLoading(false);
    }
  };

  const getTierColor = (type) => {
    const colors = {
      basic: { primary: '#FCE270', secondary: '#FCE270', bg: 'bg-[#FCE270]/10', border: 'border-[#FCE270]/20', text: 'text-[#FCE270]', icon: <RiShieldFlashLine size={22} /> },
      silver: { primary: '#C0C0C0', secondary: '#A8A8A8', bg: 'bg-gray-400/10', border: 'border-gray-400/20', text: 'text-gray-300', icon: <FaStar size={22} /> },
      gold: { primary: '#FFD700', secondary: '#FFA500', bg: 'bg-yellow-500/10', border: 'border-yellow-500/20', text: 'text-yellow-400', icon: <FaCrown size={22} /> },
      platinum: { primary: '#E5E4E2', secondary: '#B9B9B9', bg: 'bg-white/10', border: 'border-white/20', text: 'text-gray-200', icon: <RiVipCrown2Line size={22} /> },
      diamond: { primary: '#B9F2FF', secondary: '#87CEEB', bg: 'bg-cyan-400/10', border: 'border-cyan-400/20', text: 'text-cyan-400', icon: <FaGem size={22} /> },
      premium: { primary: '#FCE270', secondary: '#FFD700', bg: 'bg-[#FCE270]/10', border: 'border-[#FCE270]/20', text: 'text-[#FCE270]', icon: <RiVipCrown2Line size={22} /> },
    };
    return colors[type] || colors.basic;
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-[#0A0A0A] flex flex-col items-center justify-center gap-4 z-50">
        <div className="relative">
          <div className="w-20 h-20 rounded-3xl bg-[#FCE270]/10 flex items-center justify-center animate-pulse">
            <RiVipCrown2Line className="text-[#FCE270] text-3xl" />
          </div>
          <div className="absolute -top-3 -right-3 w-7 h-7 bg-[#FCE270] rounded-full animate-bounce flex items-center justify-center">
            <RiRefreshLine className="text-black text-sm" />
          </div>
        </div>
        <p className="text-[#FCE270] font-black uppercase tracking-widest text-[10px] mt-2 animate-pulse">Processing Upgrade...</p>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen bg-[#0A0A0A] max-w-md mx-auto relative pt-2"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* PULL TO REFRESH */}
      {pullDistance > 0 && (
        <div
          className="fixed top-0 left-0 right-0 flex justify-center z-50 transition-all"
          style={{ transform: `translateY(${pullDistance * 0.5}px)` }}
        >
          <div
            className={`w-9 h-9 rounded-full border-2 border-[#FCE270] flex items-center justify-center bg-[#1A1A1A] shadow-2xl ${refreshing ? 'animate-spin' : ''}`}
            style={{ transform: `rotate(${pullDistance * 3}deg)` }}
          >
            <RiRefreshLine className="text-[#FCE270]" size={16} />
          </div>
        </div>
      )}

      {refreshing && (
        <div className="fixed top-14 left-0 right-0 flex justify-center z-50 animate-fadeIn">
          <div className="bg-[#1A1A1A] border border-white/10 rounded-full px-4 py-1.5 flex items-center gap-2 shadow-2xl">
            <div className="w-3 h-3 border-2 border-[#FCE270] border-t-transparent rounded-full animate-spin"></div>
            <span className="text-[11px] text-gray-400 font-bold">Refreshing...</span>
          </div>
        </div>
      )}

      {/* STICKY HEADER */}


      {/* CONTENT */}
      <div className="px-4 pb-28 space-y-4">

        {/* BALANCE + CURRENT TIER CARD */}
        <div className="relative overflow-hidden bg-gradient-to-br from-[#1A1A1A] via-[#161616] to-[#111111] p-5 rounded-[24px] border border-white/5 shadow-2xl mt-3">
          <div className="absolute top-0 right-0 w-40 h-40 bg-[#FCE270]/5 rounded-full -mr-20 -mt-20 blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-green-500/5 rounded-full -ml-16 -mb-16 blur-2xl"></div>

          <div className="relative z-10 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-black/50 border border-[#FCE270]/20 flex items-center justify-center shadow-lg">
                <RiWallet3Line className="text-[#FCE270]" size={22} />
              </div>
              <div>
                <p className="text-[12px] text-white font-black tracking-wide mb-1">Balance</p>
                <p className="text-[24px] font-black text-white tracking-tight leading-none">
                  ${Number(userBalance).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
              </div>
            </div>
            <div className="flex flex-col items-center">
              <div className={`px-3 py-1.5 rounded-xl border mb-2 flex items-center justify-center ${getTierColor(currentPackage).bg} ${getTierColor(currentPackage).border}`}>
                <span className={`text-[9px] font-black uppercase tracking-wider ${getTierColor(currentPackage).text}`}>
                  {currentPackage}
                </span>
              </div>
              <p className="text-[10px] text-white font-black tracking-wide">Current Tier</p>
            </div>
          </div>
        </div>

        {/* TIER COMPARISON */}
        <div className="space-y-4">
          {Object.entries(packages).map(([type, info]) => {
            const active = currentPackage === type;
            const afford = userBalance >= info.amount;
            const tier = getTierColor(type);

            return (
              <div
                key={type}
                className={`relative overflow-hidden rounded-[28px] border-2 transition-all ${active
                  ? `bg-gradient-to-br from-[#1A1A1A] to-[#151515] ${tier.border}`
                  : 'bg-gradient-to-br from-[#1A1A1A]/80 to-[#151515]/80 border-white/5'
                  }`}
              >
                {/* Active Glow */}
                {active && (
                  <div
                    className="absolute top-0 right-0 w-40 h-40 rounded-full -mr-20 -mt-20 blur-3xl opacity-15"
                    style={{ backgroundColor: tier.primary }}
                  ></div>
                )}

                {active && (
                  <div
                    className="relative z-20 flex justify-end px-4 pt-4"
                  >
                    <div
                      className="px-3 py-1 rounded-full flex items-center gap-1.5"
                      style={{ backgroundColor: `${tier.primary}20`, border: `1px solid ${tier.primary}40` }}
                    >
                      <RiCheckLine size={12} style={{ color: tier.primary }} />
                      <span className="text-[9px] font-black uppercase tracking-wider" style={{ color: tier.primary }}>
                        Active
                      </span>
                    </div>
                  </div>
                )}

                <div className="relative z-10 p-6">
                  {/* Tier Header */}
                  <div className="flex items-center gap-4 mb-5">
                    <div
                      className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg"
                      style={{
                        backgroundColor: `${tier.primary}15`,
                        border: `1px solid ${tier.primary}30`,
                        color: tier.primary
                      }}
                    >
                      {tier.icon}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-[20px] font-black text-white uppercase tracking-tight">{type}</h3>
                      <p className="text-[9px] text-white font-black tracking-wide">
                        {info.unlimited ? (
                          <span className="flex items-center gap-1">
                            <FaInfinity size={10} className="text-[#FCE270]" /> Unlimited Trading
                          </span>
                        ) : (
                          `Buy Limit: $${info.purchaseLimit}`
                        )}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-[28px] font-black text-white tracking-tighter">
                        ${info.amount}
                      </p>
                      <p className="text-[9px] text-white font-black tracking-wide">One-time</p>
                    </div>
                  </div>

                  {/* Features Grid */}
                  <div className="grid grid-cols-2 gap-2 mb-5">
                    {[
                      { icon: <FaChartLine size={12} />, label: 'Marketplace Access', value: 'Full' },
                      { icon: <FaCoins size={12} />, label: 'Token Rewards', value: 'Active' },
                      { icon: <FaUsers size={12} />, label: 'Network Earnings', value: 'Multi-Level' },
                      {
                        icon: type === 'premium' ? <FaHeadset size={12} /> : <FaShieldAlt size={12} />,
                        label: 'Support',
                        value: type === 'premium' ? 'VIP 24/7' : 'Standard'
                      },
                    ].map((feat, idx) => (
                      <div key={idx} className="flex items-center gap-2 bg-white/[0.02] rounded-xl p-2.5 border border-white/5">
                        <span style={{ color: tier.primary }}>{feat.icon}</span>
                        <div>
                          <p className="text-[9px] text-white font-black tracking-wide">{feat.label}</p>
                          <p className="text-[10px] text-white font-black">{feat.value}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Action Button */}
                  {!active ? (
                    <button
                      onClick={() => upgradePackage(type)}
                      disabled={!afford}
                      className={`w-full h-13 rounded-2xl font-black text-[12px] uppercase tracking-widest active:scale-95 transition-all shadow-lg flex items-center justify-center gap-2 ${afford
                        ? "bg-[#FCE270] text-black hover:bg-[#f7d64a] shadow-[#FCE270]/20"
                        : "bg-white/5 text-gray-600 border border-white/5 cursor-not-allowed"
                        }`}
                    >
                      {afford ? (
                        <>
                          <RiArrowUpSLine size={18} />
                          <span>Upgrade for ${info.amount}</span>
                        </>
                      ) : (
                        <>
                          <RiInformationLine size={16} />
                          <span>Insufficient Balance</span>
                        </>
                      )}
                    </button>
                  ) : (
                    <div className={`w-full h-13 flex items-center justify-center gap-2 rounded-2xl border text-[12px] font-black uppercase tracking-widest ${tier.bg} ${tier.border} ${tier.text}`}>
                      <RiCheckDoubleLine size={18} />
                      Current Plan
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* BENEFITS GRID */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-gradient-to-br from-[#1A1A1A] to-[#151515] p-4 rounded-2xl border border-white/5 text-center active:scale-[0.97] transition-all">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center mx-auto mb-2.5">
              <FaUsers className="text-blue-400" size={16} />
            </div>
            <p className="text-[9px] text-gray-500 font-black uppercase tracking-widest mb-1">Network</p>
            <p className="text-[11px] text-white font-bold">Higher MLM Levels</p>
          </div>
          <div className="bg-gradient-to-br from-[#1A1A1A] to-[#151515] p-4 rounded-2xl border border-white/5 text-center active:scale-[0.97] transition-all">
            <div className="w-10 h-10 rounded-xl bg-[#FCE270]/10 border border-[#FCE270]/20 flex items-center justify-center mx-auto mb-2.5">
              <FaBolt className="text-[#FCE270]" size={16} />
            </div>
            <p className="text-[9px] text-gray-500 font-black uppercase tracking-widest mb-1">Earnings</p>
            <p className="text-[11px] text-white font-bold">Elite Rewards</p>
          </div>
        </div>

        {/* GUARANTEE BADGE */}
        <div className="flex items-center justify-center gap-2 py-3">
          <FaShieldAlt className="text-gray-600" size={12} />
          <span className="text-[9px] text-gray-600 font-black uppercase tracking-widest">Secure Upgrade • Instant Activation</span>
        </div>

      </div>
    </div>
  );
};

export default PackageUpgrade;