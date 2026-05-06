import React, { useState, useEffect } from "react";
import {
  FaUsers,
  FaUserPlus,
  FaCopy,
  FaShare,
  FaCalendarAlt,
  FaChartLine,
  FaGift,
  FaLink,
  FaChevronLeft,
  FaChevronDown,
  FaChevronUp,
  FaCrown,
  FaMedal,
  FaTrophy,
  FaStar,
  FaGem,
  FaBell,
} from "react-icons/fa";
import {
  RiTeamLine,
  RiUserAddLine,
  RiExternalLinkLine,
  RiHistoryLine,
  RiCopperCoinLine,
  RiArrowRightUpLine,
  RiNotification3Line,
  RiRefreshLine,
} from "react-icons/ri";
import Swal from "sweetalert2";
import { userAPI } from "../services/api";

const MyTeam = ({ onBack }) => {
  const [openMember, setOpenMember] = useState(null);
  const [team, setTeam] = useState([]);
  const [referralCode, setReferralCode] = useState("");
  const [stats, setStats] = useState({ total: 0, active: 0 });
  const [loading, setLoading] = useState(true);
  const [pullDistance, setPullDistance] = useState(0);
  const [isPulling, setIsPulling] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchTeam();
    fetchProfile();
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
      await Promise.all([fetchTeam(), fetchProfile()]);
      setTimeout(() => {
        setRefreshing(false);
        setPullDistance(0);
      }, 500);
    } else {
      setPullDistance(0);
    }
    setIsPulling(false);
  };

  const fetchTeam = async () => {
    try {
      const response = await userAPI.getTeam();
      console.log("✅ Team API Response:", response.data);

      const teamData = response.data.teamMembers || [];
      setTeam(teamData);
      setStats({
        total: teamData.length,
        active: teamData.filter((m) => m.isActive).length,
      });

      console.log("✅ Team Stats:", {
        total: teamData.length,
        active: teamData.filter((m) => m.isActive).length,
        members: teamData,
      });
    } catch (error) {
      console.error("❌ Error fetching team:", error);
      setTeam([]);
      setStats({ total: 0, active: 0 });
    }
    setLoading(false);
  };

  const fetchProfile = async () => {
    try {
      const response = await userAPI.getProfile();
      const userReferralCode = response.data.user.referralCode || "LOADING";
      setReferralCode(userReferralCode);
      console.log("✅ Referral Code:", userReferralCode);
    } catch (error) {
      console.error("❌ Error fetching profile:", error);
      setReferralCode("ERROR");
    }
  };

  const copyReferralCode = () => {
    navigator.clipboard.writeText(referralCode);
    Swal.fire({
      icon: "success",
      title: "Copied!",
      text: "Referral code copied to clipboard",
      background: '#1A1A1A',
      color: '#fff',
      timer: 1500,
      showConfirmButton: false,
    });
  };

  const copyReferralLink = () => {
    const link = `${window.location.origin}/SingUp?ref=${referralCode}`;
    navigator.clipboard.writeText(link);
    Swal.fire({
      icon: "success",
      title: "Link Copied!",
      text: "Referral link copied to clipboard",
      background: '#1A1A1A',
      color: '#fff',
      timer: 1500,
      showConfirmButton: false,
    });
  };

  const shareReferralLink = async () => {
    const link = `${window.location.origin}/SingUp?ref=${referralCode}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: "Join our NFT Trading Platform",
          text: "Start earning with NFT trading! Use my referral link to get started.",
          url: link,
        });
      } catch (error) {
        copyReferralLink();
      }
    } else {
      copyReferralLink();
    }
  };

  const getMemberLevelColor = (level) => {
    const colors = {
      1: '#FCE270',
      2: '#C0C0C0',
      3: '#FFD700',
      4: '#E5E4E2',
      5: '#B9F2FF',
    };
    return colors[level] || '#FCE270';
  };

  const getLevelBadge = (level) => {
    if (level >= 5) return <FaCrown size={12} style={{ color: '#FFD700' }} />;
    if (level >= 3) return <FaMedal size={12} style={{ color: '#C0C0C0' }} />;
    if (level >= 2) return <FaStar size={12} style={{ color: '#FCE270' }} />;
    return <FaGem size={12} style={{ color: '#FCE270' }} />;
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-[#0A0A0A] flex flex-col items-center justify-center gap-4 z-50">
        <div className="relative">
          <div className="w-20 h-20 rounded-3xl bg-[#FCE270]/10 flex items-center justify-center animate-pulse">
            <RiTeamLine className="text-[#FCE270] text-3xl" />
          </div>
          <div className="absolute -top-3 -right-3 w-8 h-8 bg-[#FCE270] rounded-full animate-bounce flex items-center justify-center shadow-lg">
            <RiUserAddLine className="text-black text-sm" />
          </div>
        </div>
        <div className="flex flex-col items-center gap-2">
          <div className="w-36 h-3 bg-white/10 rounded-full animate-pulse"></div>
          <div className="w-24 h-2 bg-white/5 rounded-full animate-pulse"></div>
        </div>
        <p className="text-[#FCE270] font-bold animate-pulse text-sm mt-2">Loading Team Data...</p>
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
            <span className="text-[11px] text-gray-400 font-bold">Updating team...</span>
          </div>
        </div>
      )}

      {/* STICKY HEADER */}


      {/* CONTENT */}
      <div className="px-4 pb-28 space-y-4">

        {/* TEAM STATS CARDS */}
        <div className="grid grid-cols-2 gap-3 mt-3">
          <div className="relative overflow-hidden bg-gradient-to-br from-[#1A1A1A] to-[#151515] p-5 rounded-2xl border border-white/5 active:scale-[0.97] transition-all">
            <div className="absolute top-0 right-0 w-20 h-20 bg-blue-500/5 rounded-full -mr-10 -mt-10 blur-2xl"></div>
            <div className="relative z-10 flex flex-col items-center text-center">
              <div className="w-11 h-11 rounded-xl bg-blue-500/10 flex items-center justify-center mb-3 border border-blue-500/10">
                <FaUsers className="text-blue-400" size={18} />
              </div>
              <p className="text-[12px] text-white font-black tracking-wide mb-1">Total Members</p>
              <p className="text-[28px] font-black text-white leading-none">{stats.total}</p>
            </div>
          </div>
          <div className="relative overflow-hidden bg-gradient-to-br from-[#1A1A1A] to-[#151515] p-5 rounded-2xl border border-white/5 active:scale-[0.97] transition-all">
            <div className="absolute top-0 right-0 w-20 h-20 bg-green-500/5 rounded-full -mr-10 -mt-10 blur-2xl"></div>
            <div className="relative z-10 flex flex-col items-center text-center">
              <div className="w-11 h-11 rounded-xl bg-green-500/10 flex items-center justify-center mb-3 border border-green-500/10">
                <FaUserPlus className="text-green-400" size={18} />
              </div>
              <p className="text-[12px] text-white font-black tracking-wide mb-1">Active Now</p>
              <p className="text-[28px] font-black text-green-400 leading-none">{stats.active}</p>
            </div>
          </div>
        </div>



        {/* REFERRAL SECTION */}
        <div className="relative overflow-hidden bg-gradient-to-br from-[#1A1A1A] via-[#161616] to-[#111111] p-5 rounded-2xl border border-white/5 shadow-xl">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#FCE270]/5 rounded-full -mr-16 -mt-16 blur-3xl"></div>

          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-[#FCE270]/10 flex items-center justify-center border border-[#FCE270]/20">
                <FaGift className="text-[#FCE270]" size={18} />
              </div>
              <div>
                <h3 className="font-black text-[14px] text-white">Invite & Earn</h3>
                <p className="text-[12px] text-white font-black tracking-wide">Share your referral</p>
              </div>
            </div>

            {/* Referral Code Display */}
            <div className="bg-black/50 p-4 rounded-xl mb-4 border border-white/5">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Your Code</span>
                <button
                  onClick={copyReferralCode}
                  className="flex items-center gap-1.5 bg-[#FCE270]/10 px-3 py-1 rounded-full active:scale-90 transition-all"
                >
                  <FaCopy size={9} className="text-[#FCE270]" />
                  <span className="text-[9px] font-black text-[#FCE270] uppercase">Copy</span>
                </button>
              </div>
              <p className="text-[22px] font-black text-white tracking-[0.3em] font-mono select-all">{referralCode}</p>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={copyReferralLink}
                className="bg-white/[0.03] border border-white/5 h-12 rounded-xl font-black text-[11px] text-gray-300 uppercase tracking-wider flex items-center justify-center gap-2 active:scale-95 transition-all hover:bg-white/[0.06]"
              >
                <FaLink size={13} className="text-[#FCE270]" /> Copy Link
              </button>
              <button
                onClick={shareReferralLink}
                className="bg-[#FCE270] h-12 rounded-xl font-black text-[11px] text-black uppercase tracking-wider flex items-center justify-center gap-2 active:scale-95 transition-all hover:bg-[#f7d64a]"
              >
                <FaShare size={13} /> Share Now
              </button>
            </div>
          </div>
        </div>

        {/* TEAM MEMBERS LIST */}
        <div>
          <div className="flex items-center justify-between mb-3 px-1">
            <h3 className="font-black text-[12px] text-white uppercase tracking-wider flex items-center gap-2">
              <RiTeamLine className="text-[#FCE270]" size={16} />
              Team Members
            </h3>
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-[10px] text-gray-500 font-black uppercase tracking-widest">{stats.active} Online</span>
            </div>
          </div>

          {team.length > 0 ? (
            <div className="space-y-2">
              {team.map((member, index) => {
                const isOpen = openMember === (member._id || index);
                const levelColor = getMemberLevelColor(member.level || 1);

                return (
                  <div
                    key={member._id || index}
                    className="bg-gradient-to-br from-[#1A1A1A] to-[#151515] rounded-2xl border border-white/5 overflow-hidden active:scale-[0.98] transition-all"
                  >
                    <div
                      onClick={() => setOpenMember(isOpen ? null : member._id || index)}
                      className="p-4 flex items-center gap-3 cursor-pointer"
                    >
                      {/* Avatar */}
                      <div className="relative flex-shrink-0">
                        <div
                          className="w-11 h-11 rounded-xl flex items-center justify-center text-sm font-black uppercase shadow-lg"
                          style={{
                            background: `linear-gradient(135deg, ${levelColor}20, ${levelColor}05)`,
                            color: levelColor,
                            border: `1px solid ${levelColor}20`
                          }}
                        >
                          {member.name?.charAt(0) || member.email?.charAt(0) || "U"}
                        </div>
                        <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-[#151515] flex items-center justify-center border border-white/5">
                          {getLevelBadge(member.level || 1)}
                        </div>
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <h4 className="font-black text-white truncate text-[13px] tracking-tight">
                          {member.name || "Member"}
                        </h4>
                        <p className="text-[10px] text-gray-500 truncate font-bold">
                          {member.email}
                        </p>
                      </div>

                      {/* Status + Expand */}
                      <div className="flex items-center gap-2.5 flex-shrink-0">
                        <div className={`w-2 h-2 rounded-full ${member.isActive ? 'bg-green-500 shadow-[0_0_6px_rgba(34,197,94,0.5)]' : 'bg-gray-700'}`}></div>
                        {isOpen ? (
                          <FaChevronUp className="text-gray-500" size={12} />
                        ) : (
                          <FaChevronDown className="text-gray-500" size={12} />
                        )}
                      </div>
                    </div>

                    {/* Expanded Details */}
                    {isOpen && (
                      <div className="px-4 pb-4 border-t border-white/5 bg-black/20">
                        <div className="grid grid-cols-2 gap-2 pt-3">
                          <div className="bg-white/[0.02] rounded-xl p-3 text-center">
                            <p className="text-[8px] text-gray-500 font-black uppercase tracking-widest mb-1">Level</p>
                            <p className="text-[16px] font-black text-white">L{member.level || 1}</p>
                          </div>
                          <div className="bg-white/[0.02] rounded-xl p-3 text-center">
                            <p className="text-[8px] text-gray-500 font-black uppercase tracking-widest mb-1">Team Size</p>
                            <p className="text-[16px] font-black text-[#FCE270]">{member.teamSize || 0}</p>
                          </div>
                          <div className="bg-white/[0.02] rounded-xl p-3 text-center">
                            <p className="text-[8px] text-gray-500 font-black uppercase tracking-widest mb-1">Joined</p>
                            <p className="text-[12px] font-black text-gray-300">
                              {member.joinedAt ? new Date(member.joinedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : '---'}
                            </p>
                          </div>
                          <div className="bg-white/[0.02] rounded-xl p-3 text-center">
                            <p className="text-[8px] text-gray-500 font-black uppercase tracking-widest mb-1">Status</p>
                            <p className={`text-[11px] font-black uppercase ${member.isActive ? 'text-green-400' : 'text-gray-600'}`}>
                              {member.isActive ? 'Active' : 'Inactive'}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-16 bg-gradient-to-br from-[#1A1A1A] to-[#151515] rounded-2xl border border-white/5">
              <div className="w-20 h-20 rounded-full bg-white/[0.02] flex items-center justify-center mx-auto mb-4 border border-white/5">
                <FaUserPlus className="text-gray-600" size={28} />
              </div>
              <p className="text-gray-500 font-black text-sm uppercase tracking-wider">No Members Yet</p>
              <p className="text-gray-600 text-[10px] font-bold mt-1 max-w-[200px] mx-auto">
                Share your referral code to start building your team
              </p>
              <button
                onClick={shareReferralLink}
                className="mt-4 bg-[#FCE270]/10 border border-[#FCE270]/20 rounded-xl px-5 py-2.5 text-[#FCE270] text-[11px] font-black uppercase tracking-wider active:scale-95 transition-all"
              >
                Invite Now
              </button>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default MyTeam;