import React, { useState, useEffect } from "react";
import {
  FaCoins, FaDollarSign, FaLock, FaClock, FaChevronLeft,
  FaSearch, FaFilter, FaBell, FaGem, FaCrown, FaStar,
  FaChartPie, FaWallet, FaArrowUp, FaFire, FaShieldAlt,
} from "react-icons/fa";
import {
  RiCoinLine, RiWallet3Line, RiShieldFlashLine, RiShoppingBag3Line,
  RiStackLine, RiInformationLine, RiCheckDoubleLine, RiArrowRightUpLine,
  RiMoneyDollarCircleLine, RiNotification3Line, RiRefreshLine,
  RiVipDiamondLine, RiFundsLine, RiSafeLine, RiSparklingLine,
} from "react-icons/ri";
import Swal from "sweetalert2";
import api, { nftAPI } from "../services/api";

const MyNFTs = ({ onBack }) => {
  const [myNFTs, setMyNFTs] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [selling, setSelling] = useState(null);
  const [pullDistance, setPullDistance] = useState(0);
  const [isPulling, setIsPulling] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchMyNFTs();
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
      await fetchMyNFTs();
      setTimeout(() => {
        setRefreshing(false);
        setPullDistance(0);
      }, 500);
    } else {
      setPullDistance(0);
    }
    setIsPulling(false);
  };

  const fetchMyNFTs = async () => {
    try {
      const response = await nftAPI.getMyNFTs();
      const nfts = response.data.nfts || [];
      const apiStats = response.data.stats || {};

      const nftsWithProfit = nfts.map((nft) => {
        const potentialProfit = nft.sellPrice ? nft.sellPrice * 0.7 : 0;
        return {
          ...nft,
          profit: nft.profit || potentialProfit,
          potentialProfit: potentialProfit,
        };
      });

      const calculatedStats = {
        total: nftsWithProfit.length,
        holdNFTs: nftsWithProfit.filter((nft) => nft.holdStatus === "hold").length,
        sellNFTs: nftsWithProfit.filter((nft) => nft.holdStatus === "sell").length,
        stakedNFTs: nftsWithProfit.filter((nft) => nft.isStaked).length,
        soldNFTs: nftsWithProfit.filter((nft) => nft.status === "sold").length,
        totalValue: nftsWithProfit.reduce((sum, nft) => sum + (nft.buyPrice || 0), 0),
        totalProfit: nftsWithProfit.filter((nft) => nft.status === "sold").reduce((sum, nft) => sum + (nft.profit || 0), 0),
        potentialProfit: nftsWithProfit.filter((nft) => nft.holdStatus === "sell").reduce((sum, nft) => sum + (nft.potentialProfit || 0), 0),
      };

      const finalStats = {
        total: apiStats.total || calculatedStats.total,
        holdNFTs: apiStats.holdNFTs || calculatedStats.holdNFTs,
        sellNFTs: apiStats.sellNFTs || calculatedStats.sellNFTs,
        stakedNFTs: apiStats.stakedNFTs || calculatedStats.stakedNFTs,
        soldNFTs: apiStats.soldNFTs || calculatedStats.soldNFTs,
        totalValue: apiStats.totalValue || calculatedStats.totalValue,
        totalProfit: apiStats.totalProfit || calculatedStats.totalProfit,
        potentialProfit: calculatedStats.potentialProfit,
      };

      setMyNFTs(nftsWithProfit);
      setStats(finalStats);
    } catch (error) {
      const demoNFTs = [
        { _id: "1", nftId: "NFT-DEMO-001", holdStatus: "hold", status: "sold", buyPrice: 10, sellPrice: 20, generation: 1, isStaked: false, profit: 0, potentialProfit: 14, createdAt: new Date().toISOString() },
        { _id: "2", nftId: "NFT-DEMO-002", holdStatus: "sell", status: "sold", buyPrice: 10, sellPrice: 20, generation: 1, isStaked: false, profit: 0, potentialProfit: 14, createdAt: new Date().toISOString() },
      ];
      setMyNFTs(demoNFTs);
      setStats({ total: 2, holdNFTs: 1, sellNFTs: 1, stakedNFTs: 0, soldNFTs: 0, totalValue: 20, totalProfit: 0, potentialProfit: 14 });
    }
    setLoading(false);
  };

  const checkSellConditions = (nft) => {
    if (nft.isStaked) return { allowed: false, reason: "NFT is currently staked", suggestion: "Unstake the NFT first before selling." };
    if (nft.status === "burned") return { allowed: false, reason: "NFT has been burned", suggestion: "Burned NFTs cannot be sold." };
    if (nft.status === "listed") return { allowed: false, reason: "NFT is already listed", suggestion: "Remove from marketplace first." };
    if (nft.holdStatus !== "sell") return { allowed: false, reason: "Collector Asset (Locked)", suggestion: "Only 'sell' status assets can be listed." };
    return { allowed: true, reason: "Ready", suggestion: "Asset is ready to be sold" };
  };

  const sellNFT = async (nftId) => {
    const nft = myNFTs.find((n) => n.nftId === nftId);
    if (!nft) return;

    const canSell = checkSellConditions(nft);
    if (!canSell.allowed) {
      Swal.fire({
        icon: "warning",
        title: "RESTRICTED",
        text: canSell.reason,
        background: '#1A1A1A',
        color: '#fff',
        confirmButtonColor: "#FCE270",
        confirmButtonText: '<span style="color: #000; font-weight: 900;">OK</span>',
      });
      return;
    }

    const result = await Swal.fire({
      background: '#1A1A1A',
      color: '#fff',
      title: '<span style="font-size: 18px; font-weight: 900; color: #fff; text-transform: uppercase;">LIST ASSET</span>',
      html: `
        <div style="text-align: left; font-family: sans-serif;">
          <div style="background: #000; padding: 20px; border-radius: 20px; border: 1px solid rgba(255,255,255,0.05); margin-bottom: 20px; text-align: center;">
             <p style="font-size: 10px; font-weight: 900; color: #666; text-transform: uppercase; margin-bottom: 8px;">ESTIMATED REVENUE</p>
             <p style="font-size: 28px; font-weight: 900; color: #FCE270; margin: 0;">$${(nft.sellPrice * 0.7).toFixed(2)}</p>
             <p style="font-size: 9px; color: #444; margin-top: 5px;">(70% OF $${nft.sellPrice})</p>
          </div>
          <div style="background: #252525; padding: 15px; border-radius: 16px; border-left: 3px solid #FCE270;">
             <p style="font-size: 10px; font-weight: 900; color: #888; text-transform: uppercase; margin-bottom: 12px;">SPLIT DETAILS</p>
             <div style="display: flex; flex-direction: column; gap: 8px; font-size: 11px; color: #aaa;">
               <div style="display: flex; justify-content: space-between;"><span>You</span><span style="color:#fff;">$${(nft.sellPrice * 0.7).toFixed(2)}</span></div>
               <div style="display: flex; justify-content: space-between;"><span>Company (10%)</span><span>$${(nft.sellPrice * 0.1).toFixed(2)}</span></div>
               <div style="display: flex; justify-content: space-between;"><span>Bonus (20%)</span><span>$${(nft.sellPrice * 0.2).toFixed(2)}</span></div>
             </div>
          </div>
        </div>
      `,
      showCancelButton: true,
      confirmButtonColor: '#FCE270',
      cancelButtonColor: '#333',
      confirmButtonText: '<span style="color: #000; font-weight: 900;">CONFIRM LISTING</span>',
      cancelButtonText: '<span style="color: #fff; font-weight: 900;">CANCEL</span>',
    });

    if (!result.isConfirmed) return;

    setSelling(nftId);
    try {
      const response = await nftAPI.sellNFT(nftId);
      Swal.fire({
        icon: "success",
        title: "LISTED",
        text: "Your asset is now live in the marketplace.",
        background: '#1A1A1A',
        color: '#fff',
        confirmButtonColor: "#FCE270",
        confirmButtonText: '<span style="color: #000; font-weight: 900;">OK</span>',
      });
      fetchMyNFTs();
      window.dispatchEvent(new CustomEvent("nftListedForSale", { detail: { nftId: nftId, listedPrice: nft.sellPrice } }));
    } catch (error) {
      Swal.fire({ icon: "error", title: "ERROR", text: error.response?.data?.message || "Failed", background: '#1A1A1A', color: '#fff', confirmButtonColor: "#FCE270" });
    }
    setSelling(null);
  };

  const getStatusIcon = (status, isStaked) => {
    if (isStaked) return <FaLock size={12} />;
    switch (status) {
      case "hold": return <RiShieldFlashLine size={12} />;
      case "sell": return <RiShoppingBag3Line size={12} />;
      case "listed": return <RiMoneyDollarCircleLine size={12} />;
      default: return <FaClock size={12} />;
    }
  };

  const getStatusColor = (status, isStaked) => {
    if (isStaked) return { bg: 'bg-purple-500/10', border: 'border-purple-500/20', text: 'text-purple-400', glow: 'bg-purple-500' };
    switch (status) {
      case "hold": return { bg: 'bg-[#FCE270]/10', border: 'border-[#FCE270]/20', text: 'text-[#FCE270]', glow: 'bg-[#FCE270]' };
      case "sell": return { bg: 'bg-blue-500/10', border: 'border-blue-500/20', text: 'text-blue-400', glow: 'bg-blue-500' };
      case "listed": return { bg: 'bg-yellow-500/10', border: 'border-yellow-500/20', text: 'text-yellow-400', glow: 'bg-yellow-500' };
      default: return { bg: 'bg-gray-500/10', border: 'border-gray-500/20', text: 'text-gray-400', glow: 'bg-gray-500' };
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-[#0A0A0A] flex flex-col items-center justify-center gap-4 z-50">
        <div className="relative">
          <div className="w-20 h-20 rounded-3xl bg-[#FCE270]/10 flex items-center justify-center animate-pulse">
            <RiSafeLine className="text-[#FCE270] text-3xl" />
          </div>
          <div className="absolute -top-3 -right-3 w-7 h-7 bg-[#FCE270] rounded-full animate-bounce flex items-center justify-center">
            <RiRefreshLine className="text-black text-sm" />
          </div>
        </div>
        <div className="flex flex-col items-center gap-2">
          <div className="w-36 h-3 bg-white/10 rounded-full animate-pulse"></div>
          <div className="w-24 h-2 bg-white/5 rounded-full animate-pulse"></div>
        </div>
        <p className="text-[#FCE270] font-black uppercase tracking-widest text-[10px] mt-2 animate-pulse">Loading Vault...</p>
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

        {/* PORTFOLIO VALUE CARD */}
        <div className="relative overflow-hidden bg-gradient-to-br from-[#1A1A1A] via-[#161616] to-[#111111] p-5 rounded-[24px] border border-white/5 shadow-2xl mt-3">
          <div className="absolute top-0 right-0 w-40 h-40 bg-[#FCE270]/5 rounded-full -mr-20 -mt-20 blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-[#FCE270]/5 rounded-full -ml-16 -mb-16 blur-2xl"></div>

          <div className="relative z-10 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-black/50 border border-[#FCE270]/20 flex items-center justify-center shadow-lg">
                <RiFundsLine className="text-[#FCE270]" size={22} />
              </div>
              <div>
                <p className="text-[9px] text-gray-500 font-black uppercase tracking-widest mb-1">Portfolio Value</p>
                <p className="text-[26px] font-black text-white tracking-tight leading-none">
                  ${Number(stats.totalValue || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
              </div>
            </div>
            <div className="text-right">
              <div className="bg-[#FCE270]/10 border border-[#FCE270]/20 rounded-xl px-3 py-1.5 mb-2">
                <div className="flex items-center gap-1.5">
                  <FaArrowUp className="text-[#FCE270]" size={10} />
                  <span className="text-[9px] text-[#FCE270] font-black uppercase tracking-wider">Growing</span>
                </div>
              </div>
              <p className="text-[10px] text-gray-500 font-black uppercase tracking-wider">{stats.total || 0} Assets</p>
            </div>
          </div>
        </div>

        {/* STATS GRID */}
        <div className="grid grid-cols-4 gap-2.5">
          {[
            { label: 'Hold', value: stats.holdNFTs || 0, icon: <RiShieldFlashLine size={16} />, color: 'text-[#FCE270]', bg: 'bg-[#FCE270]/10', border: 'border-[#FCE270]/20' },
            { label: 'Market', value: stats.sellNFTs || 0, icon: <RiShoppingBag3Line size={16} />, color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/20' },
            { label: 'Staked', value: stats.stakedNFTs || 0, icon: <FaLock size={14} />, color: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500/20' },
            { label: 'Sold', value: stats.soldNFTs || 0, icon: <FaFire size={14} />, color: 'text-orange-400', bg: 'bg-orange-500/10', border: 'border-orange-500/20' },
          ].map((item, i) => (
            <div key={i} className="bg-gradient-to-br from-[#1A1A1A] to-[#151515] p-3.5 rounded-2xl border border-white/5 text-center active:scale-[0.97] transition-all">
              <div className={`w-8 h-8 rounded-xl ${item.bg} ${item.border} border flex items-center justify-center mx-auto mb-2 ${item.color}`}>
                {item.icon}
              </div>
              <p className="text-[11px] text-white font-black tracking-wide mb-1">{item.label}</p>
              <p className={`text-[18px] font-black ${item.color}`}>{item.value}</p>
            </div>
          ))}
        </div>

        {/* POTENTIAL REVENUE */}
        <div className="bg-gradient-to-r from-[#FCE270]/5 to-[#FCE270]/10 border border-white/5 rounded-2xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#FCE270]/10 border border-[#FCE270]/20 flex items-center justify-center">
              <RiSparklingLine className="text-[#FCE270]" size={18} />
            </div>
            <div>
              <p className="text-[9px] text-gray-500 font-black uppercase tracking-widest">Potential Revenue</p>
              <p className="text-[20px] font-black text-[#FCE270]">
                ${Number(stats.potentialProfit || 0).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
              </p>
            </div>
          </div>
          <FaChartPie className="text-[#FCE270]/30" size={28} />
        </div>

        {/* ASSET LIST HEADER */}
        <div className="flex items-center justify-between">
          <h3 className="font-black text-[12px] text-white uppercase tracking-wider flex items-center gap-2">
            <RiSafeLine size={14} className="text-[#FCE270]" />
            Vault Contents
          </h3>
          <span className="text-[10px] text-gray-500 font-black uppercase tracking-widest">{myNFTs.length} items</span>
        </div>

        {/* NFT CARDS */}
        {myNFTs.length > 0 ? (
          <div className="space-y-3.5">
            {myNFTs.map((nft) => {
              const canSell = checkSellConditions(nft);
              const statusColors = getStatusColor(nft.holdStatus, nft.isStaked);

              return (
                <div
                  key={nft.nftId}
                  className="relative overflow-hidden bg-gradient-to-br from-[#1A1A1A] via-[#161616] to-[#111111] rounded-[28px] p-5 border border-white/5 active:scale-[0.98] transition-all"
                >
                  {/* Glow Effect */}
                  <div className={`absolute top-0 right-0 w-32 h-32 rounded-full -mr-16 -mt-16 blur-3xl opacity-10 ${statusColors.glow}`}></div>

                  {/* Header */}
                  <div className="relative z-10 flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      {/* NFT Icon */}
                      <div className="relative">
                        <div className={`w-14 h-14 rounded-2xl bg-black/50 border flex items-center justify-center shadow-lg ${statusColors.border}`}>
                          <img
                            src="/Nextlogo-removebg-preview.png"
                            alt="NFT"
                            className="w-10 h-10 object-contain"
                          />
                        </div>

                      </div>

                      <div>
                        <p className="font-black text-[14px] text-white uppercase tracking-tight truncate max-w-[140px]">
                          {nft.nftId}
                        </p>
                        <p className="text-[9px] text-white font-black tracking-wide">
                          {new Date(nft.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                        </p>
                      </div>
                    </div>

                    {/* Status Badge */}
                    <div className={`px-3 py-2 rounded-xl border text-[9px] font-black uppercase tracking-widest flex items-center gap-1.5 ${statusColors.bg} ${statusColors.border} ${statusColors.text}`}>
                      {getStatusIcon(nft.holdStatus, nft.isStaked)}
                      <span>{nft.isStaked ? "Staked" : nft.holdStatus}</span>
                    </div>
                  </div>

                  {/* Price Grid */}
                  <div className="relative z-10 grid grid-cols-3 gap-2.5 mb-4">
                    <div className="bg-black/40 rounded-2xl p-3 text-center border border-white/5">
                      <p className="text-[8px] text-gray-500 font-black uppercase tracking-widest mb-1">Buy Price</p>
                      <p className="text-[16px] font-black text-white">${Number(nft.buyPrice).toFixed(0)}</p>
                    </div>
                    <div className="bg-black/40 rounded-2xl p-3 text-center border border-white/5">
                      <p className="text-[8px] text-gray-500 font-black uppercase tracking-widest mb-1">Market</p>
                      <p className="text-[16px] font-black text-blue-400">${Number(nft.sellPrice).toFixed(0)}</p>
                    </div>
                    <div className="bg-black/40 rounded-2xl p-3 text-center border border-white/5">
                      <p className="text-[8px] text-gray-500 font-black uppercase tracking-widest mb-1">Net (70%)</p>
                      <p className="text-[16px] font-black text-[#FCE270]">
                        ${nft.holdStatus === "sell" ? (Number(nft.sellPrice) * 0.7).toFixed(0) : "0"}
                      </p>
                    </div>
                  </div>

                  {/* Action Button */}
                  {canSell.allowed ? (
                    <button
                      onClick={() => sellNFT(nft.nftId)}
                      disabled={selling === nft.nftId}
                      className="relative z-10 w-full h-13 rounded-2xl bg-[#FCE270] text-black font-black text-[12px] uppercase tracking-widest active:scale-95 transition-all shadow-lg shadow-[#FCE270]/20 flex items-center justify-center gap-2 hover:bg-[#f7d64a]"
                    >
                      {selling === nft.nftId ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-2 border-black border-t-transparent"></div>
                          <span>Processing...</span>
                        </>
                      ) : (
                        <>
                          <span>List for Sale</span>
                          <RiArrowRightUpLine size={16} />
                        </>
                      )}
                    </button>
                  ) : (
                    <div className={`relative z-10 w-full h-12 flex items-center justify-center gap-2 rounded-2xl border text-[10px] font-black uppercase tracking-widest cursor-not-allowed ${statusColors.bg} ${statusColors.border} ${statusColors.text}`}>
                      <RiInformationLine size={14} />
                      {canSell.reason}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          /* EMPTY STATE */
          <div className="text-center py-16 bg-gradient-to-br from-[#1A1A1A] to-[#151515] rounded-[28px] border border-white/5">
            <div className="w-20 h-20 rounded-full bg-white/[0.02] flex items-center justify-center mx-auto mb-4 border border-white/5">
              <RiStackLine size={28} className="text-gray-600" />
            </div>
            <h4 className="text-lg font-black text-white uppercase tracking-tight mb-2">No Assets</h4>
            <p className="text-[10px] font-bold text-gray-600 uppercase tracking-widest max-w-[220px] mx-auto leading-relaxed">
              Visit the marketplace to start your collection
            </p>
          </div>
        )}

        {/* SECURITY NOTICE */}
        <div className="relative overflow-hidden bg-gradient-to-br from-[#1A1A1A] to-[#161616] p-5 rounded-[24px] border border-white/5">
          <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 rounded-full -mr-12 -mt-12 blur-2xl"></div>
          <div className="relative z-10 flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center flex-shrink-0">
              <FaShieldAlt className="text-blue-400" size={16} />
            </div>
            <div>
              <h4 className="text-[11px] font-black text-white uppercase tracking-wider mb-1.5">Asset Security</h4>
              <p className="text-[10px] font-bold text-white leading-relaxed">
                Your assets are cryptographically secured. Track your portfolio growth and optimize liquidity through the marketplace.
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default MyNFTs;