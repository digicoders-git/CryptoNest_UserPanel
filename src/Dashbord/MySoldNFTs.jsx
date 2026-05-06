import React, { useState, useEffect } from 'react';
import {
  FaStore, FaCoins, FaClock, FaCheckCircle, FaChevronLeft,
  FaFilter, FaSearch, FaChartBar, FaDollarSign, FaTag,
  FaCalendarAlt, FaReceipt, FaTrophy, FaArrowUp,
} from 'react-icons/fa';
import {
  RiHistoryLine, RiMoneyDollarCircleLine, RiTimeLine, RiStackLine,
  RiCheckboxCircleLine, RiNotification3Line, RiRefreshLine,
  RiFileList3Line, RiFundsLine, RiBarChart2Line, RiCheckLine,
  RiAuctionLine, RiInboxArchiveLine,
} from 'react-icons/ri';
import axios from 'axios';
import useAuthCheck from '../utils/useAuthCheck';

const MySoldNFTs = ({ onBack }) => {
  const token = useAuthCheck();
  const [nfts, setNfts] = useState([]);
  const [user, setUser] = useState({});
  const [loading, setLoading] = useState(true);
  const [pullDistance, setPullDistance] = useState(0);
  const [isPulling, setIsPulling] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const [expandedId, setExpandedId] = useState(null);

  if (!token) return null;

  useEffect(() => {
    fetchSoldNFTs();
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
      await fetchSoldNFTs();
      setTimeout(() => {
        setRefreshing(false);
        setPullDistance(0);
      }, 500);
    } else {
      setPullDistance(0);
    }
    setIsPulling(false);
  };

  const fetchSoldNFTs = async () => {
    try {
      const userEmail = localStorage.getItem('userEmail');
      if (!userEmail) {
        setLoading(false);
        return;
      }

      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const response = await axios.get(
        `${API_URL}/api/nft-transactions/marketplace/${userEmail}`
      );

      if (response.data.success) {
        setUser(response.data.data.user);
        setNfts(response.data.data.marketplaceNFTs);
      }
    } catch (error) {
      console.error('❌ Error fetching sold NFTs:', error);
    } finally {
      setLoading(false);
    }
  };

  // Calculate total stats
  const totalListed = nfts.length;
  const totalValue = nfts.reduce((sum, nft) => sum + (nft.sellPrice || 0), 0);
  const totalProfit = nfts.reduce((sum, nft) => sum + (nft.profit || 0), 0);
  const activeListings = nfts.filter(n => n.status === 'active' || n.status === 'listed').length;
  const soldListings = nfts.filter(n => n.status === 'sold').length;

  if (loading) {
    return (
      <div className="fixed inset-0 bg-[#0A0A0A] flex flex-col items-center justify-center gap-4 z-50">
        <div className="relative">
          <div className="w-20 h-20 rounded-3xl bg-[#FCE270]/10 flex items-center justify-center animate-pulse">
            <RiAuctionLine className="text-[#FCE270] text-3xl" />
          </div>
          <div className="absolute -top-3 -right-3 w-7 h-7 bg-[#FCE270] rounded-full animate-bounce flex items-center justify-center">
            <RiRefreshLine className="text-black text-sm" />
          </div>
        </div>
        <div className="flex flex-col items-center gap-2">
          <div className="w-36 h-3 bg-white/10 rounded-full animate-pulse"></div>
          <div className="w-24 h-2 bg-white/5 rounded-full animate-pulse"></div>
        </div>
        <p className="text-[#FCE270] font-black uppercase tracking-widest text-[10px] mt-2 animate-pulse">Loading Sales...</p>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen bg-[#0A0A0A] max-w-md mx-auto relative "
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
      <div className="sticky top-0 z-40 bg-[#0A0A0A]/95 backdrop-blur-xl border-b border-white/5">


        {/* FILTER CHIPS */}
        {showFilters && (
          <div className="px-4 pb-3 flex items-center gap-2 overflow-x-auto scrollbar-hide animate-slideDown">
            {[
              { key: 'all', label: 'All', count: totalListed },
              { key: 'active', label: 'Active', count: activeListings },
              { key: 'sold', label: 'Sold', count: soldListings },
            ].map((f) => (
              <button
                key={f.key}
                onClick={() => setSelectedFilter(f.key)}
                className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider transition-all flex-shrink-0 flex items-center gap-1.5 ${selectedFilter === f.key
                  ? 'bg-[#FCE270] text-black'
                  : 'bg-white/5 text-gray-400 border border-white/5'
                  }`}
              >
                {f.label}
                <span className={`text-[9px] px-1.5 py-0.5 rounded-full ${selectedFilter === f.key ? 'bg-black/20 text-black' : 'bg-white/5 text-gray-500'
                  }`}>
                  {f.count}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* CONTENT */}
      <div className="px-4 pb-28 space-y-4">

        {/* SUMMARY HERO CARD */}
        <div className="relative overflow-hidden bg-gradient-to-br from-[#1A1A1A] via-[#161616] to-[#111111] p-6 rounded-[28px] border border-white/5 shadow-2xl mt-3">
          <div className="absolute top-0 right-0 w-40 h-40 bg-[#FCE270]/5 rounded-full -mr-20 -mt-20 blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-green-500/5 rounded-full -ml-16 -mb-16 blur-2xl"></div>

          <div className="relative z-10">
            {/* Top Row */}
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-[#FCE270]/10 border border-[#FCE270]/20 flex items-center justify-center shadow-lg">
                  <RiAuctionLine className="text-[#FCE270]" size={22} />
                </div>
                <div>
                  <p className="text-[12px] text-white font-black tracking-wide">Listed Assets</p>
                  <p className="text-[38px] font-black text-white leading-none">{totalListed}</p>
                </div>
              </div>
              <div className="flex items-center gap-1.5 bg-green-500/10 border border-green-500/20 rounded-full px-3 py-1.5">
                <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-[10px] text-green-400 font-bold">Live</span>
              </div>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-black/30 rounded-2xl p-4 border border-white/5">
                <p className="text-[11px] text-white font-black tracking-wide mb-1">Total Value</p>
                <p className="text-[22px] font-black text-white">
                  ${totalValue.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                </p>
              </div>
              <div className="bg-black/30 rounded-2xl p-4 border border-white/5">
                <p className="text-[11px] text-white font-black tracking-wide mb-1">Total Profit</p>
                <p className="text-[22px] font-black text-green-400">
                  +${totalProfit.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* LISTINGS */}
        {nfts.length === 0 ? (
          /* EMPTY STATE */
          <div className="text-center py-16 bg-gradient-to-br from-[#1A1A1A] to-[#151515] rounded-[28px] border border-white/5">
            <div className="w-20 h-20 rounded-full bg-white/[0.02] flex items-center justify-center mx-auto mb-4 border border-white/5">
              <FaStore size={28} className="text-gray-600" />
            </div>
            <h3 className="text-lg font-black text-white uppercase tracking-tight mb-2">No Listings</h3>
            <p className="text-[10px] font-bold text-gray-600 uppercase tracking-widest max-w-[220px] mx-auto leading-relaxed">
              You haven't listed any NFTs yet
            </p>
          </div>
        ) : (
          <>
            {/* LIST HEADER */}
            <div className="flex items-center justify-between">
              <h3 className="font-black text-[12px] text-white uppercase tracking-wider flex items-center gap-2">
                <RiFileList3Line size={14} className="text-[#FCE270]" />
                Marketplace Listings
              </h3>
              <span className="text-[10px] text-gray-500 font-black uppercase tracking-widest">{totalListed} items</span>
            </div>

            {/* NFT CARDS */}
            <div className="space-y-3">
              {nfts.map((nft) => {
                const isExpanded = expandedId === nft._id;
                const isActive = nft.status === 'active' || nft.status === 'listed';

                return (
                  <div
                    key={nft._id}
                    className="relative overflow-hidden bg-gradient-to-br from-[#1A1A1A] via-[#161616] to-[#111111] rounded-[24px] border border-white/5"
                  >
                    {/* Status glow */}
                    <div className={`absolute top-0 right-0 w-28 h-28 rounded-full -mr-14 -mt-14 blur-3xl opacity-10 ${isActive ? 'bg-green-500' : 'bg-gray-500'
                      }`}></div>

                    <div className="relative z-10 p-5">
                      {/* Top Row */}
                      <div className="flex items-start gap-4 mb-4">
                        {/* NFT Image */}
                        <div className="relative flex-shrink-0">
                          <div className="w-16 h-16 rounded-2xl bg-black/50 border border-white/5 flex items-center justify-center p-1.5 shadow-lg">
                            <img
                              src="/Nextlogo-removebg-preview.png"
                              alt="NFT"
                              className="w-full h-full object-contain rounded-xl"
                            />
                          </div>
                          {isActive && (
                            <div className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center border-2 border-[#111]">
                              <FaCheckCircle className="text-white" size={8} />
                            </div>
                          )}
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <h3 className="font-black text-[15px] text-white uppercase tracking-tight truncate pr-2">
                              {nft.nftId}
                            </h3>
                            <div className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider flex-shrink-0 ${isActive
                              ? 'bg-green-500/10 border border-green-500/20 text-green-400'
                              : 'bg-gray-500/10 border border-gray-500/20 text-gray-400'
                              }`}>
                              <span className="font-black">{nft.status || 'Listed'}</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-[11px] text-white font-black">Batch #{nft.batchId}</span>
                            <span className="w-1 h-1 rounded-full bg-gray-600"></span>
                            <span className="text-[9px] text-[#FCE270] font-black uppercase">GEN {nft.generation}</span>
                          </div>
                        </div>
                      </div>

                      {/* Price Grid */}
                      <div className="grid grid-cols-2 gap-3 mb-3">
                        <div className="bg-black/40 rounded-2xl p-3.5 border border-white/5">
                          <div className="flex items-center gap-2 mb-1">
                            <FaDollarSign size={12} className="text-blue-400" />
                            <p className="text-[11px] text-white font-black tracking-wide">Sell Price</p>
                          </div>
                          <p className="text-[20px] font-black text-white tracking-tight">
                            ${Number(nft.sellPrice).toFixed(0)}
                          </p>
                        </div>
                        <div className="bg-black/40 rounded-2xl p-3.5 border border-white/5">
                          <div className="flex items-center gap-2 mb-1">
                            <FaArrowUp size={12} className="text-green-400" />
                            <p className="text-[11px] text-white font-black tracking-wide">Profit</p>
                          </div>
                          <p className="text-[20px] font-black text-green-400 tracking-tight">
                            +${Number(nft.profit || 0).toFixed(0)}
                          </p>
                        </div>
                      </div>

                      {/* Expandable Details */}
                      <button
                        onClick={() => setExpandedId(isExpanded ? null : nft._id)}
                        className="w-full flex items-center justify-between bg-white/[0.02] rounded-xl p-3 border border-white/5 active:scale-[0.98] transition-all"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-[#FCE270]/10 border border-[#FCE270]/20 flex items-center justify-center">
                            <FaCalendarAlt size={12} className="text-[#FCE270]" />
                          </div>
                          <div className="text-left">
                            <p className="text-[8px] text-gray-500 font-black uppercase tracking-widest">Listed Date</p>
                            <p className="text-[11px] text-white font-bold">
                              {nft.buyDate
                                ? new Date(nft.buyDate).toLocaleDateString('en-GB', {
                                  day: '2-digit', month: 'short', year: 'numeric'
                                })
                                : '----'}
                            </p>
                          </div>
                        </div>
                        <RiArrowDownSLine
                          size={16}
                          className={`text-gray-500 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                        />
                      </button>

                      {/* Expanded Content */}
                      {isExpanded && (
                        <div className="mt-3 bg-black/20 rounded-xl p-4 border border-white/5 space-y-3 animate-fadeIn">
                          <div className="flex items-center justify-between">
                            <span className="text-[9px] text-gray-500 font-black uppercase tracking-widest">Asset Phase</span>
                            <span className="text-[10px] text-[#FCE270] font-black uppercase tracking-wider px-2.5 py-1 rounded-lg bg-[#FCE270]/10 border border-[#FCE270]/20">
                              {nft.phase || 'Standard'}
                            </span>
                          </div>
                          <div className="flex items-center justify-between pt-2 border-t border-white/5">
                            <span className="text-[9px] text-gray-500 font-black uppercase tracking-widest">Generation</span>
                            <span className="text-[10px] text-white font-black">Gen {nft.generation}</span>
                          </div>
                          <div className="flex items-center justify-between pt-2 border-t border-white/5">
                            <span className="text-[9px] text-gray-500 font-black uppercase tracking-widest">Batch</span>
                            <span className="text-[10px] text-white font-black">#{nft.batchId}</span>
                          </div>
                          <div className="flex items-center justify-between pt-2 border-t border-white/5">
                            <span className="text-[9px] text-gray-500 font-black uppercase tracking-widest">Status</span>
                            <span className={`text-[10px] font-black uppercase ${isActive ? 'text-green-400' : 'text-gray-400'
                              }`}>
                              {nft.status || 'Listed'}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}



      </div>
    </div>
  );
};

// Need to add this import at top
import { RiArrowDownSLine } from 'react-icons/ri';

export default MySoldNFTs;