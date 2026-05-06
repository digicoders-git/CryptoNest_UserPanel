import React, { useState, useEffect } from 'react';
import {
  FaUsers, FaChartLine, FaDollarSign, FaEye, FaCopy, FaShare,
  FaChevronLeft, FaCrown, FaStar, FaGem, FaTrophy, FaMedal,
  FaNetworkWired, FaUserCheck, FaUserPlus, FaChartPie,
} from 'react-icons/fa';
import {
  RiTeamLine, RiLineChartLine, RiCoinLine, RiHandCoinLine,
  RiLinkM, RiShieldUserLine, RiInformationLine, RiCheckDoubleLine,
  RiCloseCircleLine, RiNotification3Line, RiRefreshLine,
  RiVipCrownLine, RiFundsLine, RiBarChart2Line,
} from 'react-icons/ri';
import Swal from 'sweetalert2';
import { userAPI } from '../services/api';

const MLMTree = ({ onBack }) => {
  const [treeData, setTreeData] = useState(null);
  const [earnings, setEarnings] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [pullDistance, setPullDistance] = useState(0);
  const [isPulling, setIsPulling] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedLevel, setSelectedLevel] = useState(null);

  useEffect(() => {
    fetchMLMData();
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
      await fetchMLMData();
      setTimeout(() => {
        setRefreshing(false);
        setPullDistance(0);
      }, 500);
    } else {
      setPullDistance(0);
    }
    setIsPulling(false);
  };

  const fetchMLMData = async () => {
    try {
      const treeRes = await userAPI.getMLMTree();
      const earningsRes = await userAPI.getMLMEarnings();

      const treeData = treeRes.data.tree || {};
      const earningsData = earningsRes.data || {};

      setTreeData(treeData);
      setEarnings(earningsData.earnings || []);

      const totalEarnings = earningsData.totalEarnings || 0;
      const directReferrals = treeData.directReferrals || [];
      const calculatedEarnings = (earningsData.earnings || []).reduce((sum, e) => sum + (e.amount || 0), 0);
      const finalTotalEarnings = totalEarnings > 0 ? totalEarnings : calculatedEarnings;

      setStats({
        totalReferrals: directReferrals.length,
        activeReferrals: directReferrals.filter(m => m.isActive).length,
        totalEarnings: finalTotalEarnings,
        missedEarnings: earningsData.missedEarnings || 0,
        referralCode: treeData.user?.referralCode || earningsData.referralCode || ''
      });

    } catch (error) {
      try {
        const teamRes = await userAPI.getTeam();
        const team = teamRes.data.team || [];
        const demoEarnings = Array.from({ length: 10 }, (_, i) => ({
          level: i + 1,
          amount: Math.floor(Math.random() * 100),
          count: Math.floor(Math.random() * 10)
        }));

        setTreeData({ directReferrals: team });
        setEarnings(demoEarnings);
        setStats({
          totalReferrals: team.length,
          activeReferrals: team.filter(m => m.isActive).length,
          totalEarnings: demoEarnings.reduce((sum, e) => sum + e.amount, 0),
          missedEarnings: 0,
          referralCode: teamRes.data.referralCode || 'DEMO123'
        });
      } catch (fallbackError) {
        const defaultEarnings = Array.from({ length: 10 }, (_, i) => ({
          level: i + 1,
          amount: i === 0 ? 50 : i === 1 ? 25 : i === 2 ? 15 : Math.max(0, 10 - i),
          count: i === 0 ? 5 : i === 1 ? 3 : i === 2 ? 2 : Math.max(0, 3 - i)
        }));
        setEarnings(defaultEarnings);
        setStats({
          totalReferrals: 0,
          activeReferrals: 0,
          totalEarnings: defaultEarnings.reduce((sum, e) => sum + e.amount, 0),
          missedEarnings: 0,
          referralCode: 'DEMO123'
        });
      }
    }
    setLoading(false);
  };

  const getLevelColor = (level) => {
    const colors = {
      1: { bg: 'bg-[#FCE270]', text: 'text-black', border: 'border-[#FCE270]', glow: 'bg-[#FCE270]', icon: <FaCrown size={12} /> },
      2: { bg: 'bg-gray-300', text: 'text-black', border: 'border-gray-400', glow: 'bg-gray-400', icon: <FaStar size={12} /> },
      3: { bg: 'bg-orange-500', text: 'text-white', border: 'border-orange-500', glow: 'bg-orange-500', icon: <FaMedal size={12} /> },
    };
    return colors[level] || { bg: 'bg-white/10', text: 'text-white', border: 'border-white/20', glow: 'bg-white/20', icon: <FaGem size={12} /> };
  };

  const showLevelDetails = (level) => {
    const levelData = earnings.find(e => e.level === level);
    const amount = levelData?.amount || 0;
    const count = levelData?.count || 0;
    const levelColor = getLevelColor(level);

    Swal.fire({
      background: '#1A1A1A',
      color: '#fff',
      showConfirmButton: true,
      confirmButtonColor: '#FCE270',
      confirmButtonText: '<span style="color: #000; font-weight: 900;">CLOSE</span>',
      html: `
        <div style="font-family: 'sans-serif'; text-align: left;">
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px; border-bottom: 1px solid rgba(255,255,255,0.05); padding-bottom: 15px;">
            <div>
              <p style="font-size: 10px; font-weight: 900; color: #fff; text-transform: uppercase; letter-spacing: 0.1em; margin: 0;">NETWORK INSIGHT</p>
              <h2 style="font-size: 20px; font-weight: 900; color: #fff; margin: 0; text-transform: uppercase;">LEVEL ${level} <span style="color: #FCE270;">ANALYSIS</span></h2>
            </div>
            <div style="width: 45px; height: 45px; background: rgba(252,226,112,0.1); border-radius: 12px; display: flex; align-items: center; justify-content: center; border: 1px solid rgba(252,226,112,0.2);">
               <span style="color: #FCE270; font-weight: 900; font-size: 16px;">L${level}</span>
            </div>
          </div>
          
          <div style="display: grid; grid-cols: 2; gap: 10px; margin-bottom: 20px;">
            <div style="background: #000; padding: 15px; border-radius: 16px; border: 1px solid rgba(255,255,255,0.05);">
              <p style="font-size: 9px; font-weight: 900; color: #fff; text-transform: uppercase; margin-bottom: 5px;">TOTAL REVENUE</p>
              <p style="font-size: 22px; font-weight: 900; color: #FCE270; margin: 0; letter-spacing: -0.02em;">$${amount}</p>
            </div>
            <div style="background: #000; padding: 15px; border-radius: 16px; border: 1px solid rgba(255,255,255,0.05); margin-top: 10px;">
              <p style="font-size: 9px; font-weight: 900; color: #fff; text-transform: uppercase; margin-bottom: 5px;">ACTIVE MEMBERS</p>
              <p style="font-size: 22px; font-weight: 900; color: #fff; margin: 0;">${count}</p>
            </div>
          </div>

          <div style="background: #252525; padding: 15px; border-radius: 16px; border-left: 3px solid #FCE270;">
            <p style="font-size: 10px; font-weight: 900; color: #fff; text-transform: uppercase; margin-bottom: 10px;">COMMISSION STRUCTURE</p>
            <div style="display: flex; flex-direction: column; gap: 8px;">
               <div style="display: flex; justify-content: space-between; font-size: 12px; font-weight: 700;">
                 <span style="color: #fff;">BONUS PER NODE</span>
                 <span style="color: #FCE270;">$${count > 0 ? (amount / count).toFixed(2) : '0.00'}</span>
               </div>
               <div style="display: flex; justify-content: space-between; font-size: 12px; font-weight: 700;">
                 <span style="color: #fff;">COMMISSION RATE</span>
                 <span style="color: #fff;">${level <= 3 ? '5%' : level <= 6 ? '3%' : '2%'}</span>
               </div>
            </div>
          </div>
        </div>
      `,
      width: '400px'
    });
  };

  const copyReferralLink = () => {
    const link = `${window.location.origin}/SingUp?ref=${stats.referralCode}`;
    navigator.clipboard.writeText(link);
    Swal.fire({
      icon: 'success',
      title: 'COPIED!',
      background: '#1A1A1A',
      color: '#fff',
      showConfirmButton: false,
      timer: 1500,
      toast: true,
      position: 'top-end'
    });
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-[#0A0A0A] flex flex-col items-center justify-center gap-4 z-50">
        <div className="relative">
          <div className="w-20 h-20 rounded-3xl bg-[#FCE270]/10 flex items-center justify-center animate-pulse">
            <FaNetworkWired className="text-[#FCE270] text-3xl" />
          </div>
          <div className="absolute -top-3 -right-3 w-7 h-7 bg-[#FCE270] rounded-full animate-bounce flex items-center justify-center">
            <RiRefreshLine className="text-black text-sm" />
          </div>
        </div>
        <div className="flex flex-col items-center gap-2">
          <div className="w-36 h-3 bg-white/10 rounded-full animate-pulse"></div>
          <div className="w-24 h-2 bg-white/5 rounded-full animate-pulse"></div>
        </div>
        <p className="text-[#FCE270] font-black uppercase tracking-widest text-[10px] mt-2 animate-pulse">Syncing Hierarchy...</p>
      </div>
    );
  }

  // Active rate percentage
  const activeRate = stats.totalReferrals > 0
    ? Math.round((stats.activeReferrals / stats.totalReferrals) * 100)
    : 0;

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

        {/* TOTAL EARNINGS HERO */}
        <div className="relative overflow-hidden bg-gradient-to-br from-[#1A1A1A] via-[#161616] to-[#111111] p-5 rounded-[24px] border border-white/5 shadow-2xl mt-3">
          <div className="absolute top-0 right-0 w-40 h-40 bg-[#FCE270]/5 rounded-full -mr-20 -mt-20 blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-28 h-28 bg-green-500/5 rounded-full -ml-14 -mb-14 blur-2xl"></div>

          <div className="relative z-10 text-center">
            <div className="w-14 h-14 rounded-2xl bg-[#FCE270]/10 border border-[#FCE270]/20 flex items-center justify-center mx-auto mb-3 shadow-lg">
              <RiFundsLine className="text-[#FCE270]" size={24} />
            </div>
            <p className="text-[12px] text-white font-black tracking-wide mb-1">Total Network Earnings</p>
            <p className="text-[36px] font-black text-[#FCE270] tracking-tighter leading-none">
              ${Number(stats.totalEarnings || 0).toLocaleString()}
            </p>
          </div>
        </div>

        {/* STATS GRID */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-gradient-to-br from-[#1A1A1A] to-[#151515] p-4 rounded-2xl border border-white/5 active:scale-[0.97] transition-all">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
                <FaUsers className="text-blue-400" size={16} />
              </div>
              <div>
                <p className="text-[11px] text-white font-black tracking-wide">Team</p>
                <p className="text-[20px] font-black text-white">{stats.totalReferrals || 0}</p>
              </div>
            </div>
            {/* Activity bar */}
            <div className="mt-3 bg-white/5 rounded-full h-1.5 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue-500 to-green-400 rounded-full transition-all duration-700"
                style={{ width: `${activeRate}%` }}
              ></div>
            </div>
            <p className="text-[11px] text-white font-bold mt-1.5">{activeRate}% Active</p>
          </div>

          <div className="bg-gradient-to-br from-[#1A1A1A] to-[#151515] p-4 rounded-2xl border border-white/5 active:scale-[0.97] transition-all">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-green-500/10 border border-green-500/20 flex items-center justify-center">
                <FaUserCheck className="text-green-400" size={16} />
              </div>
              <div>
                <p className="text-[11px] text-white font-black tracking-wide">Active</p>
                <p className="text-[20px] font-black text-green-400">{stats.activeReferrals || 0}</p>
              </div>
            </div>
            <p className="text-[11px] text-white font-bold mt-3">Direct referrals</p>
          </div>
        </div>

        {/* REFERRAL CODE CARD */}
        <div className="relative overflow-hidden bg-gradient-to-br from-[#FCE270] to-[#E5C94D] p-5 rounded-[24px] shadow-xl shadow-[#FCE270]/10">
          <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -mr-12 -mt-12 blur-2xl"></div>
          <div className="absolute bottom-0 left-0 w-20 h-20 bg-black/10 rounded-full -ml-10 -mb-10 blur-xl"></div>

          <div className="relative z-10">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <RiLinkM size={16} className="text-black" />
                <h3 className="font-black text-black text-[11px] uppercase tracking-wider">Referral Link</h3>
              </div>
              <span className="bg-black/10 px-2.5 py-1 rounded-full text-[8px] font-black text-black/60 uppercase tracking-wider">
                Invite & Earn
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex-1 bg-black/10 p-3 rounded-2xl text-[11px] font-black text-black truncate uppercase tracking-wider">
                {stats.referralCode || 'SYNCING...'}
              </div>
              <button
                onClick={copyReferralLink}
                className="w-12 h-12 bg-black rounded-2xl flex items-center justify-center active:scale-90 transition-all shadow-lg hover:bg-black/90"
              >
                <FaCopy className="text-[#FCE270]" size={16} />
              </button>
            </div>
          </div>
        </div>

        {/* LEVEL PERFORMANCE */}
        <div>
          <h3 className="font-black text-[12px] text-white uppercase tracking-wider flex items-center gap-2 mb-3">
            <RiBarChart2Line size={14} className="text-[#FCE270]" />
            Level Performance
          </h3>

          {/* Top 3 Levels - Premium Cards */}
          <div className="grid grid-cols-3 gap-2.5 mb-3">
            {[1, 2, 3].map((level) => {
              const levelData = earnings.find(e => e.level === level);
              const amount = levelData?.amount || 0;
              const count = levelData?.count || 0;
              const lvlColor = getLevelColor(level);

              return (
                <div
                  key={level}
                  onClick={() => showLevelDetails(level)}
                  className={`relative overflow-hidden p-4 rounded-2xl text-center border cursor-pointer active:scale-[0.97] transition-all ${level === 1
                    ? 'bg-gradient-to-br from-[#1A1A1A] to-[#151515] border-[#FCE270]/30'
                    : 'bg-gradient-to-br from-[#1A1A1A] to-[#151515] border-white/5'
                    }`}
                >
                  {level === 1 && (
                    <div className="absolute top-0 right-0 w-16 h-16 bg-[#FCE270]/5 rounded-full -mr-8 -mt-8 blur-xl"></div>
                  )}
                  <div className={`w-9 h-9 rounded-xl ${lvlColor.bg} flex items-center justify-center mx-auto mb-2 text-[11px] font-black ${lvlColor.text} shadow-lg relative z-10`}>
                    {lvlColor.icon}
                  </div>
                  <p className="text-[9px] text-gray-500 font-black uppercase tracking-wider mb-1 relative z-10">L{level}</p>
                  <p className="text-[16px] font-black text-white tracking-tight relative z-10">${amount}</p>
                  <p className="text-[8px] text-gray-500 font-bold mt-0.5 relative z-10">{count} nodes</p>
                </div>
              );
            })}
          </div>

          {/* Levels 4-10 - Compact Grid */}
          <div className="grid grid-cols-7 gap-1.5">
            {[4, 5, 6, 7, 8, 9, 10].map((level) => {
              const levelData = earnings.find(e => e.level === level);
              const amount = levelData?.amount || 0;

              return (
                <div
                  key={level}
                  onClick={() => showLevelDetails(level)}
                  className="bg-[#1A1A1A] border border-white/5 py-3 rounded-xl text-center cursor-pointer active:scale-95 transition-all hover:border-[#FCE270]/20"
                >
                  <p className="text-[7px] text-gray-500 font-black uppercase tracking-wider mb-1">L{level}</p>
                  <p className="text-[10px] font-black text-white">${amount}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* MISSED EARNINGS CARD */}
        {stats.missedEarnings > 0 && (
          <div className="bg-gradient-to-r from-red-500/5 to-red-500/10 border border-red-500/20 rounded-2xl p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
                <RiCloseCircleLine className="text-red-400" size={18} />
              </div>
              <div>
                <p className="text-[9px] text-gray-500 font-black uppercase tracking-widest">Missed Earnings</p>
                <p className="text-[18px] font-black text-red-400">${stats.missedEarnings}</p>
              </div>
            </div>
            <FaChevronLeft className="text-gray-600 rotate-180" size={12} />
          </div>
        )}

        {/* DIRECT PARTNERS */}
        <div>
          <h3 className="font-black text-[12px] text-white uppercase tracking-wider flex items-center gap-2 mb-3">
            <FaUsers size={13} className="text-[#FCE270]" />
            Direct Partners
            <span className="text-[10px] text-gray-500">({stats.totalReferrals || 0})</span>
          </h3>

          {treeData?.directReferrals?.length > 0 ? (
            <div className="space-y-2">
              {treeData.directReferrals.map((member, index) => (
                <div
                  key={index}
                  className="bg-gradient-to-br from-[#1A1A1A] to-[#151515] rounded-2xl border border-white/5 p-4 flex items-center justify-between active:scale-[0.98] transition-all"
                >
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <div className="w-11 h-11 rounded-xl bg-black/50 border border-white/5 flex items-center justify-center">
                        <RiShieldUserLine className="text-gray-500" size={20} />
                      </div>
                      {member.isActive && (
                        <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-[#151515] flex items-center justify-center">
                          <FaUserCheck className="text-white" size={7} />
                        </div>
                      )}
                    </div>
                    <div>
                      <p className="font-black text-[13px] text-white">{member.name}</p>
                      <p className="text-[9px] text-gray-500 font-bold lowercase">{member.email}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`px-2.5 py-1 rounded-lg text-[8px] font-black uppercase tracking-wider mb-1 ${member.isActive
                      ? 'bg-green-500/10 border border-green-500/20 text-green-400'
                      : 'bg-red-500/10 border border-red-500/20 text-red-400'
                      }`}>
                      {member.isActive ? 'Active' : 'Inactive'}
                    </div>
                    <p className="text-[9px] text-gray-600 font-black uppercase tracking-wider">
                      Team: {member.teamSize || 0}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-gradient-to-br from-[#1A1A1A] to-[#151515] rounded-2xl border border-white/5">
              <div className="w-16 h-16 rounded-full bg-white/[0.02] flex items-center justify-center mx-auto mb-3 border border-white/5">
                <FaUserPlus size={22} className="text-gray-600" />
              </div>
              <p className="text-sm font-black text-white uppercase">No Partners Yet</p>
              <p className="text-[11px] text-white font-bold mt-1 max-w-[200px] mx-auto">
                Share your referral link to start building your network
              </p>
              <button
                onClick={copyReferralLink}
                className="mt-4 bg-[#FCE270]/10 border border-[#FCE270]/20 rounded-xl px-4 py-2 text-[#FCE270] text-[10px] font-black uppercase tracking-wider active:scale-95 transition-all"
              >
                Copy Referral Link
              </button>
            </div>
          )}
        </div>

        {/* NETWORK RULES */}
        <div className="relative overflow-hidden bg-gradient-to-br from-[#1A1A1A] to-[#161616] rounded-2xl border border-white/5 p-5">
          <div className="absolute top-0 right-0 w-20 h-20 bg-[#FCE270]/3 rounded-full -mr-10 -mt-10 blur-xl"></div>
          <div className="relative z-10 flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#FCE270]/10 border border-[#FCE270]/20 flex items-center justify-center flex-shrink-0">
              <RiInformationLine className="text-[#FCE270]" size={18} />
            </div>
            <div>
              <h4 className="text-[11px] font-black text-white uppercase tracking-wider mb-2">Network Rules</h4>
              <div className="space-y-1.5">
                {[
                  '10-Level deep revenue sharing',
                  'Real-time NFT sales commissions',
                  'Passive global reward pool entry',
                  'Unlimited direct growth capacity',
                ].map((benefit, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <RiCheckDoubleLine className="text-[#FCE270]/50 flex-shrink-0" size={12} />
                    <span className="text-[10px] text-gray-400 font-bold">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default MLMTree;