import React, { useState, useEffect } from "react";
import {
  FaHome,
  FaChartLine,
  FaUsers,
  FaWallet,
  FaImage,
  FaRocket,
  FaLayerGroup,
  FaCoins,
  FaExchangeAlt,
  FaArrowUp,
  FaArrowDown,
  FaChevronLeft,
  FaBell,
  FaSearch,
  FaCrown,
  FaEye,
  FaEyeSlash,
  FaPiggyBank,
} from "react-icons/fa";
import {
  RiDashboardLine,
  RiWallet3Line,
  RiTeamLine,
  RiCopperCoinLine,
  RiNftLine,
  RiExchangeLine,
  RiArrowRightUpLine,
  RiHistoryLine,
  RiRefreshLine,
  RiNotification3Line,
} from "react-icons/ri";
import Swal from "sweetalert2";
import { userAPI, walletAPI, nftAPI, packageAPI } from "../services/api";
import LevelEarningsModal from "../Componect/LevelEarningsModal";
import WalletStatus from "../Componect/WalletStatus";
import useAuthCheck from "../utils/useAuthCheck";

const Dashboard = ({ onBack }) => {
  const token = useAuthCheck();
  const [stats, setStats] = useState({
    balance: 0,
    totalEarnings: 0,
    teamSize: 0,
    activeTeamMembers: 0,
    totalTransactions: 0,
    recentTransactions: [],
    nftCount: 0,
  });
  const [nftStats, setNftStats] = useState({
    total: 0,
    holding: 0,
    sold: 0,
    totalProfit: 0,
  });
  const [tokenProfit, setTokenProfit] = useState(0);
  const [tradingIncome, setTradingIncome] = useState(0);
  const [referralIncome, setReferralIncome] = useState(0);
  const [currentPackage, setCurrentPackage] = useState("basic");
  const [loading, setLoading] = useState(true);
  const [balanceLoaded, setBalanceLoaded] = useState(false);
  const [showLevelModal, setShowLevelModal] = useState(false);
  const [levelEarnings, setLevelEarnings] = useState([]);
  const [hideBalance, setHideBalance] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const [isPulling, setIsPulling] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  if (!token) return null;

  useEffect(() => {
    showOfficialNotice();
    fetchDashboardData();
    fetchNFTStats();
    fetchPackageInfo();
    fetchLevelEarnings();
    fetchTokenProfit();

    const handleBalanceUpdate = (event) => {
      setStats((prev) => ({ ...prev, balance: event.detail.balance }));
    };

    const handlePackageUpdate = (event) => {
      setCurrentPackage(event.detail.package);
    };

    window.addEventListener("balanceUpdate", handleBalanceUpdate);
    window.addEventListener("walletBalanceUpdate", handleBalanceUpdate);
    window.addEventListener("packageUpdate", handlePackageUpdate);

    return () => {
      window.removeEventListener("balanceUpdate", handleBalanceUpdate);
      window.removeEventListener("walletBalanceUpdate", handleBalanceUpdate);
      window.removeEventListener("packageUpdate", handlePackageUpdate);
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
      await Promise.all([
        fetchDashboardData(),
        fetchNFTStats(),
        fetchTokenProfit(),
      ]);
      setTimeout(() => {
        setRefreshing(false);
        setPullDistance(0);
      }, 500);
    } else {
      setPullDistance(0);
    }
    setIsPulling(false);
  };

  const fetchDashboardData = async () => {
    try {
      const [dashboardRes, balanceRes] = await Promise.allSettled([
        userAPI.getDashboard(),
        walletAPI.getBalance()
      ]);

      const dashboardData = dashboardRes.status === 'fulfilled' ? dashboardRes.value.data.stats || {} : {};
      const balanceData = balanceRes.status === 'fulfilled' ? balanceRes.value.data : { balance: 0 };
      const balance = balanceData.balance || parseFloat(localStorage.getItem('demoBalance') || '0');

      let recentTransactions = [];
      try {
        const userTransRes = await userAPI.getTransactions();
        recentTransactions = (userTransRes.data.transactions || [])
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
          .slice(0, 5);
      } catch {
        recentTransactions = [];
      }

      setStats({
        balance,
        teamSize: dashboardData.teamSize || 0,
        activeTeamMembers: dashboardData.activeTeamMembers || 0,
        recentTransactions,
        totalEarnings: dashboardData.totalEarnings || 0,
        nftCount: dashboardData.nftCount || 0,
        totalInvestment: dashboardData.totalInvestment || 0,
        currentPlan: dashboardData.currentPlan || "basic",
      });
      setBalanceLoaded(true);
    } catch {
      try {
        const localBalance = localStorage.getItem("demoBalance") || localStorage.getItem("userBalance");
        let balance = localBalance ? parseFloat(localBalance) : 0;

        if (!localBalance) {
          const balanceRes = await walletAPI.getBalance();
          balance = balanceRes.data.balance || 0;
        }

        setStats((prev) => ({ ...prev, balance }));
        setBalanceLoaded(true);

        const teamRes = await userAPI.getTeam();
        const team = teamRes.data.team || [];

        setStats((prev) => ({
          ...prev,
          teamSize: team.length,
          activeTeamMembers: team.filter((m) => m.isActive).length,
          recentTransactions: [],
        }));
      } catch {
        setBalanceLoaded(true);
      }
    }
  };

  const fetchNFTStats = async () => {
    try {
      const response = await nftAPI.getMyNFTs();
      const apiStats = response.data.stats || {};
      setNftStats({
        total: apiStats.total || 0,
        holding: apiStats.holdNFTs || apiStats.holding || 0,
        sold: apiStats.soldNFTs || apiStats.sold || 0,
        totalProfit: apiStats.totalProfit || 0,
      });
    } catch { }
  };

  const fetchTokenProfit = async () => {
    try {
      const response = await userAPI.getTransactions();
      const transactions = response.data.transactions || [];

      const profit = transactions
        .filter(tx => tx.type === 'nft_sale')
        .reduce((sum, tx) => sum + (tx.amount || 0), 0);
      setTokenProfit(profit);

      const trading = transactions
        .filter(tx => tx.type === 'nft_parent_bonus')
        .reduce((sum, tx) => sum + (tx.amount || 0), 0);
      setTradingIncome(trading);

      const referral = transactions
        .filter(tx => tx.type === 'referral_bonus')
        .reduce((sum, tx) => sum + (tx.amount || 0), 0);
      setReferralIncome(referral);
    } catch {
      setTokenProfit(0);
      setTradingIncome(0);
      setReferralIncome(0);
    }
  };

  const fetchPackageInfo = async () => {
    try {
      const packageRes = await packageAPI.getPlans();
      const userPackage = packageRes.data.currentPlan || "basic";
      setCurrentPackage(userPackage);
    } catch {
      try {
        const response = await userAPI.getProfile();
        const userPackage = response.data.user.currentPackage || response.data.user.planType || "basic";
        setCurrentPackage(userPackage);
      } catch {
        setCurrentPackage("basic");
      }
    }
    setLoading(false);
  };

  const fetchLevelEarnings = async () => {
    try {
      const mockData = [
        { level: 1, amount: 150, description: "Direct referral commission", date: "2024-01-15", members: 5, commission: 10, transactions: [{ from: "User123", amount: 50 }, { from: "User456", amount: 100 }] },
        { level: 2, amount: 75, description: "Second level commission", date: "2024-01-14", members: 3, commission: 5, transactions: [{ from: "User789", amount: 75 }] },
        { level: 3, amount: 25, description: "Third level commission", date: "2024-01-13", members: 1, commission: 2.5, transactions: [{ from: "User101", amount: 25 }] }
      ];
      setLevelEarnings(mockData);
    } catch {
      setLevelEarnings([]);
    }
  };

  const showOfficialNotice = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/notifications/active`);
      const result = await response.json();
      localStorage.removeItem('hasSeenPhase2Notice');
      const hasSeenNotice = localStorage.getItem('hasSeenGTNNotice2027');
      if (hasSeenNotice) return;

      if (result.success && result.data && result.data.length > 0) {
        const notification = result.data[0];
        const formattedMessage = notification.message
          .split('\n')
          .map(line => {
            if (line.trim().startsWith('👉')) return `<li style="font-size: 13px; color: #CCCCCC; margin-bottom: 8px;">${line.trim()}</li>`;
            else if (line.trim()) return `<p style="font-size: 13px; color: #FFFFFF; margin-bottom: 12px; line-height: 1.6;">${line.trim()}</p>`;
            return '';
          })
          .join('');

        setTimeout(() => {
          Swal.fire({
            title: `<strong style="color: #FCE270; font-size: 20px;">${notification.title}</strong>`,
            html: `<div style="text-align: left; line-height: 1.6; padding: 10px;">${formattedMessage}</div>`,
            background: '#1A1A1A',
            color: '#FFFFFF',
            confirmButtonColor: '#FCE270',
            confirmButtonText: '<span style="color: #000000; font-weight: bold;">✅ GOT IT, THANKS!</span>',
            width: window.innerWidth < 640 ? '94%' : '500px',
            padding: '20px',
            customClass: { popup: 'rounded-[24px] border border-white/10' },
          }).then(() => {
            localStorage.setItem('hasSeenGTNNotice2027', 'true');
          });
        }, 800);
      }
    } catch (error) {
      console.error('❌ Dashboard Notice Error:', error);
    }
  };

  const getPackageColor = (pkg) => {
    const colors = {
      basic: '#FCE270',
      silver: '#C0C0C0',
      gold: '#FFD700',
      platinum: '#E5E4E2',
      diamond: '#B9F2FF',
      vip: '#FF6B6B',
    };
    return colors[pkg?.toLowerCase()] || '#FCE270';
  };

  const getPackageIcon = (pkg) => {
    switch (pkg?.toLowerCase()) {
      case 'gold':
      case 'platinum':
      case 'vip':
        return <FaCrown size={14} style={{ color: getPackageColor(pkg) }} />;
      default:
        return <FaRocket size={14} style={{ color: getPackageColor(pkg) }} />;
    }
  };

  if (loading || !balanceLoaded) {
    return (
      <div className="fixed inset-0 bg-[#0A0A0A] flex flex-col items-center justify-center gap-4 z-50">
        <div className="relative">
          <div className="w-20 h-20 rounded-3xl bg-[#FCE270]/10 flex items-center justify-center animate-pulse">
            <RiDashboardLine className="text-[#FCE270] text-3xl" />
          </div>
          <div className="absolute -top-3 -right-3 w-7 h-7 bg-[#FCE270] rounded-full animate-bounce flex items-center justify-center">
            <RiRefreshLine className="text-black text-sm" />
          </div>
        </div>
        <div className="flex flex-col items-center gap-2">
          <div className="w-40 h-3 bg-white/10 rounded-full animate-pulse"></div>
          <div className="w-28 h-2 bg-white/5 rounded-full animate-pulse"></div>
        </div>
        <p className="text-[#FCE270] font-bold animate-pulse text-sm mt-2">Initializing Dashboard...</p>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen bg-[#0A0A0A] max-w-md mx-auto relative"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* PULL TO REFRESH INDICATOR */}
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

      {/* REFRESHING OVERLAY */}
      {refreshing && (
        <div className="fixed top-14 left-0 right-0 flex justify-center z-50 animate-fadeIn">
          <div className="bg-[#1A1A1A] border border-white/10 rounded-full px-4 py-1.5 flex items-center gap-2 shadow-2xl">
            <div className="w-3 h-3 border-2 border-[#FCE270] border-t-transparent rounded-full animate-spin"></div>
            <span className="text-[11px] text-gray-400 font-bold">Refreshing data...</span>
          </div>
        </div>
      )}

      {/* STICKY HEADER */}


      {/* CONTENT */}
      <div className="px-4 pb-28 space-y-4 pt-4">

        {/* BALANCE CARD - HERO */}
        <div className="relative overflow-hidden bg-gradient-to-br from-[#1A1A1A] via-[#161616] to-[#111111] p-6 rounded-[32px] border border-white/5 shadow-2xl ">
          <div className="absolute top-0 right-0 w-48 h-48 bg-[#FCE270]/5 rounded-full -mr-24 -mt-24 blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-[#FCE270]/3 rounded-full -ml-16 -mb-16 blur-2xl"></div>

          <div className="relative z-10">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-[#FCE270]/15 flex items-center justify-center">
                  <RiWallet3Line className="text-[#FCE270]" size={18} />
                </div>
                <span className="text-[10px] text-gray-400 font-black uppercase tracking-widest">Total Balance</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setHideBalance(!hideBalance)}
                  className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center active:scale-90 transition-all"
                >
                  {hideBalance ? <FaEyeSlash className="text-gray-400" size={13} /> : <FaEye className="text-gray-400" size={13} />}
                </button>
                <div className="px-2.5 py-1 rounded-full bg-green-500/10 border border-green-500/20 flex items-center gap-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>
                  <span className="text-[9px] text-green-400 font-black uppercase tracking-wider">Live</span>
                </div>
              </div>
            </div>

            <h1 className="text-[40px] font-black text-white leading-none tracking-tighter mb-1">
              {hideBalance ? '••••••' : (
                <>
                  <span className="text-[#FCE270] text-[28px] align-top">$</span>
                  {stats.balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </>
              )}
            </h1>

            <div className="flex items-center gap-3 mt-4">


            </div>
          </div>
        </div>

        {/* QUICK STATS - 2 COL */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-gradient-to-br from-[#1A1A1A] to-[#151515] p-4 rounded-2xl border border-white/5 flex flex-col items-start justify-center active:scale-[0.97] transition-all">
            <div className="w-11 h-11 rounded-xl bg-blue-500/10 flex items-center justify-center flex-shrink-0 mb-2">
              <RiTeamLine className="text-blue-400" size={20} />
            </div>
            <p className="text-[12px] text-white font-black tracking-wide">Team</p>
            <p className="text-[20px] font-black text-white">{stats.teamSize}</p>
            <p className="text-[9px] text-gray-500 font-bold">{stats.activeTeamMembers} active</p>
          </div>
          <div className="bg-gradient-to-br from-[#1A1A1A] to-[#151515] p-4 rounded-2xl border border-white/5 flex flex-col items-start justify-center active:scale-[0.97] transition-all">
            <div className="w-11 h-11 rounded-xl bg-purple-500/10 flex items-center justify-center flex-shrink-0 mb-2">
              <RiNftLine className="text-purple-400" size={20} />
            </div>
            <p className="text-[12px] text-white font-black tracking-wide">Tokens</p>
            <p className="text-[20px] font-black text-white">{nftStats.total}</p>
            <p className="text-[9px] text-gray-500 font-bold">{nftStats.holding} holding</p>
          </div>
        </div>

        {/* INCOME STATS GRID */}
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: "Token Profit", value: tokenProfit, icon: <RiCopperCoinLine size={18} />, color: "text-green-400", bg: "bg-green-500/10", border: "border-green-500/20" },
            { label: "Referral Income", value: referralIncome, icon: <FaUsers size={16} />, color: "text-blue-400", bg: "bg-blue-500/10", border: "border-blue-500/20" },
            { label: "Trading Income", value: tradingIncome, icon: <RiExchangeLine size={18} />, color: "text-[#FCE270]", bg: "bg-[#FCE270]/10", border: "border-[#FCE270]/20" },
            { label: "Sold Tokens", value: nftStats.sold, icon: <RiNftLine size={18} />, color: "text-purple-400", bg: "bg-purple-500/10", border: "border-purple-500/20" },
          ].map((item, i) => (
            <div key={i} className={`bg-[#1A1A1A] p-4 rounded-2xl border border-white/5 active:scale-[0.97] transition-all`}>
              <div className={`w-9 h-9 rounded-xl ${item.bg} ${item.border} border flex items-center justify-center mb-3 ${item.color}`}>
                {item.icon}
              </div>
              <p className="text-[12px] text-white font-black tracking-wide mb-1">{item.label}</p>
              <p className={`text-[18px] font-black tracking-tight ${item.color}`}>
                ${Number(item.value).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
            </div>
          ))}
        </div>

        {/* RECENT ACTIVITY */}
        <div className="bg-gradient-to-br from-[#1A1A1A] to-[#161616] rounded-[24px] border border-white/5 overflow-hidden shadow-xl">
          <div className="px-5 py-4 border-b border-white/5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <RiHistoryLine className="text-[#FCE270]" size={16} />
              <h3 className="font-black text-[13px] text-white uppercase tracking-wider">Recent Activity</h3>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-[9px] text-gray-500 font-black uppercase tracking-widest">Live</span>
            </div>
          </div>
          <div className="p-2 space-y-1">
            {stats.recentTransactions.length ? (
              stats.recentTransactions.map((t, i) => (
                <div key={i} className="flex items-center justify-between p-3.5 hover:bg-white/[0.02] rounded-2xl transition-all active:bg-white/[0.04]">
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center flex-shrink-0">
                      <FaExchangeAlt className="text-gray-400" size={13} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[13px] font-bold text-gray-200 truncate">{t.description || t.type}</p>
                      <p className="text-[9px] text-gray-500 font-bold uppercase tracking-wider mt-0.5">Confirmed</p>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0 ml-2">
                    <p className="text-[15px] font-black text-[#FCE270] tracking-tight">
                      ${Number(t.amount).toFixed(2)}
                    </p>
                    <p className="text-[8px] text-gray-600 font-bold uppercase tracking-widest mt-0.5">Verified</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-10 text-center">
                <RiHistoryLine size={28} className="text-gray-700 mx-auto mb-2" />
                <p className="text-gray-600 text-[11px] font-black uppercase tracking-widest">No activity yet</p>
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Level Earnings Modal */}
      <LevelEarningsModal
        isOpen={showLevelModal}
        onClose={() => setShowLevelModal(false)}
        levelEarnings={levelEarnings}
      />
    </div>
  );
};

export default Dashboard;