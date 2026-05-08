import React, { useState, useEffect } from "react";
import {
  FaShoppingCart, FaCoins, FaFire, FaStore, FaDollarSign,
  FaChevronLeft, FaSearch, FaFilter, FaBell, FaShieldAlt,
  FaBolt, FaChartLine, FaGem, FaCheck, FaLock,
} from "react-icons/fa";
import {
  RiShoppingBag3Line, RiWallet3Line, RiStackLine, RiShieldFlashLine,
  RiCoinLine, RiMoneyDollarCircleLine, RiInformationLine, RiCheckDoubleLine,
  RiArrowRightUpLine, RiExchangeLine, RiNotification3Line, RiRefreshLine,
  RiSparklingLine, RiVipDiamondLine,
} from "react-icons/ri";
import Swal from "sweetalert2";
import { nftAPI, walletAPI } from "../services/api";

const NFTMarketplace = ({ onBack }) => {
  const [nfts, setNfts] = useState([]);
  const [allNfts, setAllNfts] = useState([]);
  const [userBalance, setUserBalance] = useState(0);
  const [loading, setLoading] = useState(true);
  const [buying, setBuying] = useState(null);
  const [currentBatch, setCurrentBatch] = useState(0);
  const [currentPhase, setCurrentPhase] = useState('pre-launch');
  const [batchInfo, setBatchInfo] = useState(null);
  const [pullDistance, setPullDistance] = useState(0);
  const [isPulling, setIsPulling] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchMarketplace();
    fetchBalance();

    const handleBalanceUpdate = (event) => {
      setUserBalance(event.detail.balance);
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
      await Promise.all([fetchMarketplace(), fetchBalance()]);
      setTimeout(() => {
        setRefreshing(false);
        setPullDistance(0);
      }, 500);
    } else {
      setPullDistance(0);
    }
    setIsPulling(false);
  };

  const fetchBalance = async () => {
    try {
      const response = await walletAPI.getBalance();
      const balance = response.data.balance || 0;
      setUserBalance(balance);
    } catch (error) {
      setUserBalance(0);
    }
  };

  const fetchMarketplace = async () => {
    try {
      const response = await nftAPI.getMarketplace();
      const data = response.data;
      const nftData = data.nfts || [];

      setAllNfts(nftData);
      setCurrentPhase(data.currentPhase || 'pre-launch');
      setBatchInfo(data.batchInfo || null);
      setCurrentBatch(data.batchInfo?.currentBatch || 0);

      const availableNfts = nftData.filter(nft => 
        !nft.status || nft.status === 'available'
      );
      setNfts(availableNfts);
    } catch (error) {
      console.error('Marketplace fetch error:', error);
    }
    setLoading(false);
  };

  const buyNFT = async (nftId, price, isUserListed = false) => {
    if (userBalance < price) {
      Swal.fire({ icon: "error", title: "INSUFFICIENT BALANCE", text: `Need $${price} for this asset.`, background: '#1A1A1A', color: '#fff', confirmButtonColor: "#FCE270" });
      return;
    }

    setBuying(nftId);
    try {
      let response;

      if (isUserListed) {
        // User resold NFT — use /buy endpoint
        response = await nftAPI.buyNFT(nftId);
      } else if (currentPhase === 'trading') {
        // Trading phase — use /buy-trading
        response = await nftAPI.buyTradingNFT();
      } else {
        // Pre-launch phase — use /buy-prelaunch
        response = await nftAPI.buyPreLaunchNFT();
      }

      const nftsReceived = response.data.nftsReceived || 1;

      Swal.fire({
        icon: "success",
        title: "ACQUIRED",
        html: `
          <div style="text-align:center; font-family:sans-serif;">
            <p style="font-size:28px; font-weight:900; color:#FCE270; margin:10px 0;">${nftsReceived} NFTs</p>
            <p style="font-size:11px; color:#aaa;">Successfully added to your vault</p>
            <div style="background:#111; padding:12px; border-radius:12px; margin-top:12px; border:1px solid rgba(252,226,112,0.2);">
              <p style="font-size:10px; color:#666; margin:0;">Both NFTs are in <strong style="color:#FCE270;">SELL</strong> status — ready to trade</p>
            </div>
          </div>
        `,
        background: '#1A1A1A',
        color: '#fff',
        confirmButtonColor: "#FCE270",
        confirmButtonText: '<span style="color:#000; font-weight:900;">DONE</span>',
      });

      await fetchMarketplace();
      await fetchBalance();
      window.dispatchEvent(new CustomEvent("balanceUpdate", { detail: { balance: response.data.newBalance ?? userBalance - price } }));
    } catch (error) {
      Swal.fire({ icon: "error", title: "ERROR", text: error.response?.data?.message || "Failed", background: '#1A1A1A', color: '#fff', confirmButtonColor: "#FCE270" });
    }
    setBuying(null);
  };

  const getGenerationColor = (gen) => {
    const colors = {
      1: '#FCE270',
      2: '#C0C0C0',
      3: '#FFD700',
      4: '#E5E4E2',
      5: '#B9F2FF',
    };
    return colors[gen] || '#FCE270';
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-[#0A0A0A] flex flex-col items-center justify-center gap-4 z-50">
        <div className="relative">
          <div className="w-20 h-20 rounded-3xl bg-[#FCE270]/10 flex items-center justify-center animate-pulse">
            <RiExchangeLine className="text-[#FCE270] text-3xl" />
          </div>
          <div className="absolute -top-3 -right-3 w-7 h-7 bg-[#FCE270] rounded-full animate-bounce flex items-center justify-center">
            <RiRefreshLine className="text-black text-sm" />
          </div>
        </div>
        <div className="flex flex-col items-center gap-2">
          <div className="w-40 h-3 bg-white/10 rounded-full animate-pulse"></div>
          <div className="w-28 h-2 bg-white/5 rounded-full animate-pulse"></div>
        </div>
        <p className="text-[#FCE270] font-black uppercase tracking-widest text-[10px] mt-2 animate-pulse">Syncing Exchange...</p>
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

        {/* BALANCE CARD - PREMIUM */}
        <div className="relative overflow-hidden bg-gradient-to-br from-[#1A1A1A] via-[#161616] to-[#111111] p-5 rounded-[24px] border border-white/5 shadow-2xl mt-3">
          <div className="absolute top-0 right-0 w-40 h-40 bg-[#FCE270]/5 rounded-full -mr-20 -mt-20 blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-28 h-28 bg-green-500/5 rounded-full -ml-14 -mb-14 blur-2xl"></div>

          <div className="relative z-10 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-black/50 border border-[#FCE270]/20 flex items-center justify-center shadow-lg">
                <RiWallet3Line className="text-[#FCE270]" size={22} />
              </div>
              <div>
                <p className="text-[12px] text-white font-semibold tracking-wide mb-1">Wallet Balance</p>
                <p className="text-[26px] font-black text-white tracking-tight leading-none">
                  ${userBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
              </div>
            </div>
            <div className="text-right">
              <div className="bg-green-500/10 border border-green-500/20 rounded-xl px-3 py-1.5 mb-2">
                <div className="flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-[9px] text-green-400 font-black tracking-wide">Live</span>
                </div>
              </div>
              <p className="text-[10px] text-white font-black tracking-wide">{nfts.length} Assets</p>
            </div>
          </div>
        </div>

        {/* PHASE + BATCH INFO BANNER */}
        {currentPhase && (
          <div className="flex items-center justify-between bg-gradient-to-r from-[#1A1A1A] to-[#161616] px-4 py-3 rounded-2xl border border-white/5">
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full animate-pulse ${currentPhase === 'trading' ? 'bg-green-400' : currentPhase === 'pre-launch' ? 'bg-[#FCE270]' : 'bg-blue-400'}`}></div>
              <span className="text-[10px] font-black uppercase tracking-widest text-white">
                {currentPhase === 'pre-launch' ? 'Pre-Launch Phase' : currentPhase === 'trading' ? 'Trading Phase' : 'Blockchain Phase'}
              </span>
            </div>
            {batchInfo && currentPhase === 'pre-launch' && (
              <span className="text-[10px] font-black text-[#FCE270] tracking-wide">
                Batch {batchInfo.currentBatch}/{batchInfo.totalBatches} — {batchInfo.batchProgress}
              </span>
            )}
            {currentPhase === 'trading' && (
              <span className="text-[10px] font-black text-green-400 tracking-wide">Open Market</span>
            )}
          </div>
        )}

        {/* MARKET STATS */}
        <div className="grid grid-cols-3 gap-2.5">
          <div className="bg-gradient-to-br from-[#1A1A1A] to-[#151515] p-3.5 rounded-2xl border border-white/5 text-center">
            <FaBolt className="text-[#FCE270] mx-auto mb-1.5" size={14} />
            <p className="text-[8px] text-gray-500 font-black tracking-wide">Volume</p>
            <p className="text-[14px] font-black text-white">Active</p>
          </div>
          <div className="bg-gradient-to-br from-[#1A1A1A] to-[#151515] p-3.5 rounded-2xl border border-white/5 text-center">
            <FaChartLine className="text-green-400 mx-auto mb-1.5" size={14} />
            <p className="text-[8px] text-gray-500 font-black tracking-wide">Growth</p>
            <p className="text-[14px] font-black text-green-400">+{nfts.length * 10}%</p>
          </div>
          <div className="bg-gradient-to-br from-[#1A1A1A] to-[#151515] p-3.5 rounded-2xl border border-white/5 text-center">
            <FaShieldAlt className="text-blue-400 mx-auto mb-1.5" size={14} />
            <p className="text-[8px] text-gray-500 font-black tracking-wide">Secured</p>
            <p className="text-[14px] font-black text-blue-400">256-bit</p>
          </div>
        </div>

        {/* LISTINGS HEADER */}
        <div className="flex items-center justify-between">
          <h3 className="font-black text-[12px] text-white tracking-wide flex items-center gap-2">
            <RiStackLine size={14} className="text-[#FCE270]" />
            Available Listings
          </h3>
          <span className="text-[10px] text-gray-500 font-black tracking-wide">{nfts.length} items</span>
        </div>

        {/* NFT CARDS */}
        {nfts.length > 0 ? (
          <div className="space-y-3.5">
            {nfts.map((nft) => {
              const genColor = getGenerationColor(nft.generation);

              return (
                <div
                  key={nft._id || nft.nftId}
                  className="relative overflow-hidden bg-gradient-to-br from-[#1A1A1A] via-[#161616] to-[#111111] rounded-[28px] p-5 border border-white/5 active:scale-[0.98] transition-all"
                >
                  {/* Glow effect */}
                  <div
                    className="absolute top-0 right-0 w-32 h-32 rounded-full -mr-16 -mt-16 blur-3xl opacity-20"
                    style={{ backgroundColor: genColor }}
                  ></div>

                  {/* Header */}
                  <div className="relative z-10 flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      {/* NFT Icon */}
                      <div className="relative">
                        <div
                          className="w-14 h-14 rounded-2xl flex items-center justify-center border shadow-lg"
                          style={{
                            background: `linear-gradient(135deg, ${genColor}15, ${genColor}05)`,
                            borderColor: `${genColor}20`
                          }}
                        >
                          <img
                            src="/Nextlogo-removebg-preview.png"
                            alt="NFT"
                            className="w-10 h-10 object-contain"
                          />
                        </div>

                      </div>

                      {/* Name + Badge */}
                      <div>
                        <p className="font-black text-[13px] text-white uppercase tracking-tight">
                          {nft.nftId}
                        </p>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className="text-[9px] text-gray-500 font-black">Phase {nft.batchId || 1}</span>
                          <span className="w-1 h-1 rounded-full bg-gray-600"></span>
                          <span className="text-[9px] text-gray-500 font-black">Gen {nft.generation}</span>
                        </div>
                      </div>
                    </div>


                  </div>

                  {/* Price Grid */}
                  <div className="relative z-10 grid grid-cols-2 gap-3 mb-4">
                    <div className="bg-black/40 rounded-2xl p-3.5 border border-white/5 text-center">
                      <p className="text-[11px] text-white font-black tracking-wide mb-1">Buy Price</p>
                      <p className="text-[20px] font-black text-white tracking-tight">
                        ${Number(nft.buyPrice).toFixed(0)}
                      </p>
                    </div>
                    <div className="bg-black/40 rounded-2xl p-3.5 border border-white/5 text-center">
                      <p className="text-[11px] text-white font-black tracking-wide mb-1">Target Value</p>
                      <p className="text-[20px] font-black tracking-tight" style={{ color: genColor }}>
                        ${Number(nft.sellPrice).toFixed(0)}
                      </p>
                    </div>
                  </div>

                  {/* Profit Badge */}
                  <div
                    className="relative z-10 flex items-center justify-between px-4 py-3 rounded-2xl mb-4"
                    style={{
                      background: `${genColor}08`,
                      border: `1px solid ${genColor}15`
                    }}
                  >
                    <div className="flex items-center gap-2">
                      <RiSparklingLine size={14} style={{ color: genColor }} />
                      <p className="text-[9px] font-black tracking-wide" style={{ color: genColor }}>
                        Potential Growth
                      </p>
                    </div>
                    <p className="text-[12px] font-black" style={{ color: genColor }}>
                      +${(Number(nft.sellPrice) - Number(nft.buyPrice)).toFixed(0)}
                    </p>
                  </div>

                  {/* Buy Button */}
                  <button
                    onClick={() => buyNFT(nft.nftId, nft.buyPrice, nft.type === "user_resold")}
                    disabled={buying === nft.nftId || userBalance < nft.buyPrice}
                    className={`relative z-10 w-full h-13 rounded-2xl font-black text-[12px] tracking-wide transition-all active:scale-95 flex items-center justify-center gap-2 ${userBalance >= nft.buyPrice
                      ? "bg-[#FCE270] text-black shadow-lg shadow-[#FCE270]/20 hover:bg-[#f7d64a]"
                      : "bg-white/5 text-gray-600 border border-white/5 cursor-not-allowed"
                      }`}
                  >
                    {buying === nft.nftId ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-black border-t-transparent"></div>
                        <span>Processing...</span>
                      </>
                    ) : userBalance >= nft.buyPrice ? (
                      <>
                        <span>Acquire Asset</span>
                        <RiArrowRightUpLine size={16} />
                      </>
                    ) : (
                      <>
                        <FaLock size={11} />
                        <span>Need ${(Number(nft.buyPrice) - userBalance).toFixed(0)} more</span>
                      </>
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        ) : (
          /* EMPTY STATE */
          <div className="text-center py-16 bg-gradient-to-br from-[#1A1A1A] to-[#151515] rounded-[28px] border border-white/5">
            <div className="w-20 h-20 rounded-full bg-white/[0.02] flex items-center justify-center mx-auto mb-4 border border-white/5">
              <RiExchangeLine size={28} className="text-gray-600" />
            </div>
            <h4 className="text-lg font-black text-white tracking-tight mb-2">Exchange Empty</h4>
            <p className="text-[10px] font-bold text-gray-600 tracking-wide max-w-[220px] mx-auto leading-relaxed">
              All assets are currently in private collections
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
              <h4 className="text-[11px] font-black text-white tracking-wide mb-1.5">Exchange Protocol</h4>
              <p className="text-[10px] font-bold text-gray-500 leading-relaxed">
                All marketplace transactions are cryptographically secured. Each acquisition includes a collector vault item and a marketplace-ready asset.
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default NFTMarketplace;