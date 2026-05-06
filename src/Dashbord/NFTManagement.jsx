import React, { useState, useEffect } from 'react';
import {
  FaShoppingCart, FaCoins, FaClock, FaLock, FaChevronLeft,
  FaFilter, FaBell, FaGem, FaBolt, FaChartLine, FaWallet,
  FaArrowUp, FaFire, FaStar, FaCrown, FaShieldAlt,
} from 'react-icons/fa';
import {
  RiShoppingBag3Line, RiGiftLine, RiStackLine, RiShieldFlashLine,
  RiCoinLine, RiFireLine, RiInformationLine, RiCheckDoubleLine,
  RiWallet3Line, RiNotification3Line, RiRefreshLine,
  RiVipDiamondLine, RiFundsLine, RiSparklingLine, RiSafeLine,
  RiArrowRightUpLine,
} from 'react-icons/ri';
import Swal from 'sweetalert2';
import { nftAPI, walletAPI } from '../services/api';

const NFTManagement = ({ onBack }) => {
  const [myNFTs, setMyNFTs] = useState([]);
  const [stats, setStats] = useState({});
  const [systemStatus, setSystemStatus] = useState(null);
  const [userBalance, setUserBalance] = useState(0);
  const [loading, setLoading] = useState(false);
  const [buying, setBuying] = useState(false);
  const [selling, setSelling] = useState(null);
  const [pullDistance, setPullDistance] = useState(0);
  const [isPulling, setIsPulling] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchData();
    fetchBalance();

    const handleBalanceUpdate = (event) => {
      setUserBalance(event.detail.balance);
    };

    window.addEventListener('balanceUpdate', handleBalanceUpdate);
    window.addEventListener('walletBalanceUpdate', handleBalanceUpdate);

    return () => {
      window.removeEventListener('balanceUpdate', handleBalanceUpdate);
      window.removeEventListener('walletBalanceUpdate', handleBalanceUpdate);
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
      await Promise.all([fetchData(), fetchBalance()]);
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
      const [balanceRes] = await Promise.allSettled([
        walletAPI.getBalance()
      ]);
      const balanceData = balanceRes.status === 'fulfilled' ? balanceRes.value.data : { balance: 0 };
      const balance = balanceData.balance || parseFloat(localStorage.getItem('demoBalance') || '0');
      setUserBalance(balance);
    } catch (error) {
      const balance = parseFloat(localStorage.getItem('demoBalance') || '0');
      setUserBalance(balance);
    }
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const nftResponse = await nftAPI.getMyNFTs();
      const nfts = nftResponse.data.nfts || [];
      const apiStats = nftResponse.data.stats || {};

      const calculatedStats = {
        total: nfts.length,
        holdNFTs: nfts.filter(nft => nft.holdStatus === 'hold').length,
        sellNFTs: nfts.filter(nft => nft.holdStatus === 'sell').length,
        totalValue: nfts.reduce((sum, nft) => sum + (nft.buyPrice || 0), 0),
        totalProfit: nfts.filter(nft => nft.status === 'sold').reduce((sum, nft) => sum + (nft.profit || 0), 0),
        potentialProfit: nfts.filter(nft => nft.holdStatus === 'sell').reduce((sum, nft) => sum + ((nft.sellPrice || 0) * 0.7), 0)
      };

      setMyNFTs(nfts);
      setStats({ ...apiStats, ...calculatedStats });

      const statusResponse = await nftAPI.getNFTStatus();
      setSystemStatus(statusResponse.data);

    } catch (error) {
      const demoNFTs = [
        { _id: '1', nftId: 'NFT-DEMO-001', holdStatus: 'hold', status: 'sold', buyPrice: 10, sellPrice: 20, generation: 1, isStaked: false, buyDate: new Date().toISOString() },
        { _id: '2', nftId: 'NFT-DEMO-002', holdStatus: 'sell', status: 'sold', buyPrice: 10, sellPrice: 20, generation: 1, isStaked: false, buyDate: new Date().toISOString() }
      ];
      setMyNFTs(demoNFTs);
      setStats({ total: 2, holdNFTs: 1, sellNFTs: 1, totalValue: 20, totalProfit: 0 });
    }
    setLoading(false);
  };

  const buyPreLaunchNFT = async () => {
    if (userBalance < 10) {
      Swal.fire({
        icon: "error",
        title: "Insufficient Balance",
        text: `You need $10 to buy pre-launch CryptoNest.`,
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
      title: '<span style="font-size: 16px; font-weight: 900; color: #fff; text-transform: uppercase;">BUY PRE-LAUNCH</span>',
      html: `
        <div style="text-align: left; font-family: sans-serif;">
          <div style="background: #000; padding: 20px; border-radius: 20px; border: 1px solid rgba(255,255,255,0.05); margin-bottom: 20px; text-align: center;">
             <p style="font-size: 10px; font-weight: 900; color: #666; text-transform: uppercase; margin-bottom: 8px;">PRICE PER ASSET</p>
             <p style="font-size: 28px; font-weight: 900; color: #FCE270; margin: 0;">$10.00</p>
          </div>
          <div style="background: #252525; padding: 15px; border-radius: 16px; border-left: 3px solid #FCE270;">
             <p style="font-size: 10px; font-weight: 900; color: #888; text-transform: uppercase; margin-bottom: 12px;">ASSET ALLOCATION</p>
             <div style="display: flex; flex-direction: column; gap: 8px; font-size: 11px; color: #aaa;">
               <div style="display: flex; align-items: center; gap: 10px;">
                 <span style="color: #FCE270;">●</span>
                 <span>First NFT: <strong style="color: #fff;">HOLD</strong> status</span>
               </div>
               <div style="display: flex; align-items: center; gap: 10px;">
                 <span style="color: #FCE270;">●</span>
                 <span>Second NFT: <strong style="color: #fff;">SELL</strong> status</span>
               </div>
             </div>
          </div>
        </div>
      `,
      showCancelButton: true,
      confirmButtonColor: '#FCE270',
      cancelButtonColor: '#333',
      confirmButtonText: '<span style="color: #000; font-weight: 900;">CONFIRM BUY</span>',
      cancelButtonText: '<span style="color: #fff; font-weight: 900;">CANCEL</span>',
    });

    if (!result.isConfirmed) return;

    setBuying(true);
    try {
      const response = await nftAPI.buyPreLaunchNFT();
      Swal.fire({
        icon: 'success',
        title: 'SUCCESS',
        html: `<p style="color: #FCE270; font-weight: 900; text-transform: uppercase;">ASSET: ${response.data.nft.nftId}</p>`,
        background: '#1A1A1A',
        color: '#fff',
        confirmButtonColor: '#FCE270',
        confirmButtonText: '<span style="color: #000; font-weight: 900;">DONE</span>',
      });
      const newBalance = userBalance - 10;
      setUserBalance(newBalance);
      window.dispatchEvent(new CustomEvent('balanceUpdate', { detail: { balance: newBalance } }));
      fetchData();
    } catch (error) {
      Swal.fire({ icon: 'error', title: 'ERROR', text: error.response?.data?.message || 'Error', background: '#1A1A1A', color: '#fff', confirmButtonColor: '#FCE270' });
    }
    setBuying(false);
  };

  const buyTradingNFT = async () => {
    if (userBalance < 20) {
      Swal.fire({
        icon: "error",
        title: "Insufficient Balance",
        text: `You need $20 for trading pack.`,
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
      title: '<span style="font-size: 16px; font-weight: 900; color: #fff; text-transform: uppercase;">TRADING PACK</span>',
      html: `
        <div style="text-align: left; font-family: sans-serif;">
          <div style="background: #000; padding: 20px; border-radius: 20px; border: 1px solid rgba(255,255,255,0.05); margin-bottom: 20px; text-align: center;">
             <p style="font-size: 10px; font-weight: 900; color: #666; text-transform: uppercase; margin-bottom: 8px;">PACK PRICE</p>
             <p style="font-size: 28px; font-weight: 900; color: #FCE270; margin: 0;">$20.00</p>
          </div>
          <div style="background: #252525; padding: 15px; border-radius: 16px; border-left: 3px solid #FCE270;">
             <p style="font-size: 10px; font-weight: 900; color: #888; text-transform: uppercase; margin-bottom: 12px;">TRADING RULES</p>
             <div style="display: flex; flex-direction: column; gap: 8px; font-size: 11px; color: #aaa;">
               <div style="display: flex; align-items: center; gap: 10px;">
                 <span style="color: #FCE270;">●</span>
                 <span>Receive <strong style="color: #fff;">2 NFTs</strong> instantly</span>
               </div>
               <div style="display: flex; align-items: center; gap: 10px;">
                 <span style="color: #FCE270;">●</span>
                 <span>Previous Hold assets unlock</span>
               </div>
             </div>
          </div>
        </div>
      `,
      showCancelButton: true,
      confirmButtonColor: '#FCE270',
      cancelButtonColor: '#333',
      confirmButtonText: '<span style="color: #000; font-weight: 900;">CONFIRM PACK</span>',
      cancelButtonText: '<span style="color: #fff; font-weight: 900;">CANCEL</span>',
    });

    if (!result.isConfirmed) return;

    setBuying(true);
    try {
      const response = await nftAPI.buyTradingNFT();
      Swal.fire({
        icon: 'success',
        title: 'ACTIVATED',
        text: `Assets added to collection.`,
        background: '#1A1A1A',
        color: '#fff',
        confirmButtonColor: '#FCE270',
        confirmButtonText: '<span style="color: #000; font-weight: 900;">OK</span>',
      });
      const newBalance = userBalance - 20;
      setUserBalance(newBalance);
      window.dispatchEvent(new CustomEvent('balanceUpdate', { detail: { balance: newBalance } }));
      fetchData();
    } catch (error) {
      Swal.fire({ icon: 'error', title: 'ERROR', text: error.response?.data?.message || 'Error', background: '#1A1A1A', color: '#fff', confirmButtonColor: '#FCE270' });
    }
    setBuying(false);
  };

  const sellNFT = async (nftId) => {
    const nft = myNFTs.find(n => n.nftId === nftId);
    if (!nft) return;

    const result = await Swal.fire({
      background: '#1A1A1A',
      color: '#fff',
      title: '<span style="font-size: 16px; font-weight: 900; color: #fff; text-transform: uppercase;">SELL ASSET</span>',
      html: `
        <div style="text-align: left; font-family: sans-serif;">
          <div style="background: #000; padding: 20px; border-radius: 20px; border: 1px solid rgba(255,255,255,0.05); margin-bottom: 20px; text-align: center;">
             <p style="font-size: 10px; font-weight: 900; color: #666; text-transform: uppercase; margin-bottom: 8px;">TOTAL REVENUE</p>
             <p style="font-size: 28px; font-weight: 900; color: #FCE270; margin: 0;">$${(nft.sellPrice * 0.7).toFixed(2)}</p>
             <p style="font-size: 9px; color: #444; margin-top: 5px;">(70% OF $${nft.sellPrice})</p>
          </div>
          <div style="background: #252525; padding: 15px; border-radius: 16px; border-left: 3px solid #FCE270;">
             <p style="font-size: 10px; font-weight: 900; color: #888; text-transform: uppercase; margin-bottom: 12px;">SPLIT DETAILS</p>
             <div style="display: flex; flex-direction: column; gap: 8px; font-size: 11px; color: #aaa;">
               <div style="display: flex; justify-content: space-between;"><span>You</span><span style="color:#fff;">$${(nft.sellPrice * 0.7).toFixed(2)}</span></div>
               <div style="display: flex; justify-content: space-between;"><span>Network Pool</span><span>$${(nft.sellPrice * 0.3).toFixed(2)}</span></div>
             </div>
          </div>
        </div>
      `,
      showCancelButton: true,
      confirmButtonColor: '#FCE270',
      cancelButtonColor: '#333',
      confirmButtonText: '<span style="color: #000; font-weight: 900;">CONFIRM SELL</span>',
      cancelButtonText: '<span style="color: #fff; font-weight: 900;">CANCEL</span>',
    });

    if (!result.isConfirmed) return;

    setSelling(nftId);
    try {
      const response = await nftAPI.sellNFT(nftId);
      Swal.fire({ icon: 'success', title: 'LISTED', text: response.data.note, background: '#1A1A1A', color: '#fff', confirmButtonColor: '#FCE270' });
      fetchData();
    } catch (error) {
      Swal.fire({ icon: 'error', title: 'ERROR', text: error.response?.data?.message || 'Error', background: '#1A1A1A', color: '#fff', confirmButtonColor: '#FCE270' });
    }
    setSelling(null);
  };

  const getStatusIcon = (nft) => {
    if (nft.isStaked) return <FaLock size={12} />;
    if (nft.status === 'burned') return <RiFireLine size={12} />;
    if (nft.holdStatus === 'hold') return <RiShieldFlashLine size={12} />;
    if (nft.holdStatus === 'sell') return <RiShoppingBag3Line size={12} />;
    return <FaClock size={12} />;
  };

  const getStatusConfig = (nft) => {
    if (nft.isStaked) return { bg: 'bg-purple-500/10', border: 'border-purple-500/20', text: 'text-purple-400', label: 'Staked', glow: 'bg-purple-500' };
    if (nft.status === 'burned') return { bg: 'bg-red-500/10', border: 'border-red-500/20', text: 'text-red-400', label: 'Burned', glow: 'bg-red-500' };
    if (nft.holdStatus === 'hold') return { bg: 'bg-green-500/10', border: 'border-green-500/20', text: 'text-green-400', label: 'Hold', glow: 'bg-green-500' };
    if (nft.holdStatus === 'sell') return { bg: 'bg-blue-500/10', border: 'border-blue-500/20', text: 'text-blue-400', label: 'Market', glow: 'bg-blue-500' };
    return { bg: 'bg-gray-500/10', border: 'border-gray-500/20', text: 'text-gray-400', label: 'Unknown', glow: 'bg-gray-500' };
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-[#0A0A0A] flex flex-col items-center justify-center gap-4 z-50">
        <div className="relative">
          <div className="w-20 h-20 rounded-3xl bg-[#FCE270]/10 flex items-center justify-center animate-pulse">
            <RiStackLine className="text-[#FCE270] text-3xl" />
          </div>
          <div className="absolute -top-3 -right-3 w-7 h-7 bg-[#FCE270] rounded-full animate-bounce flex items-center justify-center">
            <RiRefreshLine className="text-black text-sm" />
          </div>
        </div>
        <p className="text-[#FCE270] font-black uppercase tracking-widest text-[10px] mt-2 animate-pulse">Syncing Assets...</p>
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



      {/* CONTENT */}
      <div className="px-4 pb-28 space-y-4">

        {/* BALANCE & COLLECTION CARD */}
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
            <div className="text-right">
              <div className="bg-[#FCE270]/10 border border-[#FCE270]/20 rounded-xl px-3 py-1.5 mb-2">
                <span className="text-[9px] text-[#FCE270] font-black uppercase tracking-wider">Assets</span>
              </div>
              <p className="text-[18px] font-black text-white">{stats.total || 0}</p>
            </div>
          </div>
        </div>

        {/* BUY ACTION BUTTONS */}
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={buyPreLaunchNFT}
            disabled={buying}
            className="relative overflow-hidden bg-gradient-to-br from-blue-500/10 to-blue-600/5 p-5 rounded-2xl border border-blue-500/20 active:scale-[0.97] transition-all text-left group"
          >
            <div className="absolute top-0 right-0 w-20 h-20 bg-blue-500/10 rounded-full -mr-10 -mt-10 blur-2xl"></div>
            <div className="relative z-10">
              <div className="w-10 h-10 rounded-xl bg-blue-500/20 border border-blue-500/30 flex items-center justify-center mb-3">
                <RiShoppingBag3Line className="text-blue-400" size={20} />
              </div>
              <p className="text-[9px] text-gray-500 font-black uppercase tracking-widest mb-1">Pre-Launch</p>
              <p className="text-[16px] font-black text-white">$10</p>
              <p className="text-[9px] text-blue-400 font-bold mt-1">2 NFTs</p>
            </div>
          </button>

          <button
            onClick={buyTradingNFT}
            disabled={buying}
            className="relative overflow-hidden bg-gradient-to-br from-[#FCE270]/10 to-yellow-600/5 p-5 rounded-2xl border border-[#FCE270]/20 active:scale-[0.97] transition-all text-left group"
          >
            <div className="absolute top-0 right-0 w-20 h-20 bg-[#FCE270]/10 rounded-full -mr-10 -mt-10 blur-2xl"></div>
            <div className="relative z-10">
              <div className="w-10 h-10 rounded-xl bg-[#FCE270]/20 border border-[#FCE270]/30 flex items-center justify-center mb-3">
                <RiGiftLine className="text-[#FCE270]" size={20} />
              </div>
              <p className="text-[9px] text-gray-500 font-black uppercase tracking-widest mb-1">Trading Pack</p>
              <p className="text-[16px] font-black text-white">$20</p>
              <p className="text-[9px] text-[#FCE270] font-bold mt-1">2 NFTs + Unlock</p>
            </div>
          </button>
        </div>

        {/* STATS GRID */}
        <div className="grid grid-cols-3 gap-2.5">
          {[
            { label: 'Holding', value: stats.holdNFTs || 0, icon: <RiShieldFlashLine size={14} />, color: 'text-green-400', bg: 'bg-green-500/10', border: 'border-green-500/20' },
            { label: 'Market', value: stats.sellNFTs || 0, icon: <RiShoppingBag3Line size={14} />, color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/20' },
            { label: 'Profit', value: `$${Number(stats.totalProfit || 0).toFixed(0)}`, icon: <RiFundsLine size={14} />, color: 'text-[#FCE270]', bg: 'bg-[#FCE270]/10', border: 'border-[#FCE270]/20' },
          ].map((item, i) => (
            <div key={i} className="bg-gradient-to-br from-[#1A1A1A] to-[#151515] p-3.5 rounded-2xl border border-white/5 text-center active:scale-[0.97] transition-all">
              <div className={`w-8 h-8 rounded-xl ${item.bg} ${item.border} border flex items-center justify-center mx-auto mb-2 ${item.color}`}>
                {item.icon}
              </div>
              <p className="text-[11px] text-white font-black tracking-wide mb-1">{item.label}</p>
              <p className={`text-[16px] font-black ${item.color}`}>{item.value}</p>
            </div>
          ))}
        </div>

        {/* ASSET LIST HEADER */}
        <div className="flex items-center justify-between">
          <h3 className="font-black text-[12px] text-white uppercase tracking-wider flex items-center gap-2">
            <RiSafeLine size={14} className="text-[#FCE270]" />
            Active Assets
          </h3>
          <span className="text-[10px] text-gray-500 font-black uppercase tracking-widest">{myNFTs.length} items</span>
        </div>

        {/* NFT CARDS */}
        {myNFTs.length > 0 ? (
          <div className="space-y-3">
            {myNFTs.map((nft) => {
              const statusConfig = getStatusConfig(nft);

              return (
                <div
                  key={nft._id || nft.nftId}
                  className="relative overflow-hidden bg-gradient-to-br from-[#1A1A1A] via-[#161616] to-[#111111] rounded-[24px] p-5 border border-white/5 active:scale-[0.98] transition-all"
                >
                  <div className={`absolute top-0 right-0 w-28 h-28 rounded-full -mr-14 -mt-14 blur-3xl opacity-10 ${statusConfig.glow}`}></div>

                  <div className="relative z-10 flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <div className={`w-12 h-12 rounded-2xl bg-black/50 border flex items-center justify-center shadow-lg ${statusConfig.border}`}>
                          <img
                            src="/Nextlogo-removebg-preview.png"
                            alt="NFT"
                            className="w-8 h-8 object-contain"
                          />
                        </div>
                        <div className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-lg bg-[#FCE270] flex items-center justify-center border-2 border-[#111]">
                          <span className="text-[7px] font-black text-black">G{nft.generation}</span>
                        </div>
                      </div>
                      <div>
                        <p className="font-black text-[13px] text-white uppercase tracking-tight">{nft.nftId}</p>
                        <p className="text-[9px] text-gray-500 font-bold">
                          {nft.buyDate ? new Date(nft.buyDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }) : 'ASSET'}
                        </p>
                      </div>
                    </div>
                    <div className={`px-3 py-1.5 rounded-xl border text-[9px] font-black uppercase tracking-widest flex items-center gap-1.5 ${statusConfig.bg} ${statusConfig.border} ${statusConfig.text}`}>
                      {getStatusIcon(nft)}
                      <span>{statusConfig.label}</span>
                    </div>
                  </div>

                  <div className="relative z-10 grid grid-cols-2 gap-3 mb-4">
                    <div className="bg-black/40 rounded-2xl p-3 border border-white/5">
                      <p className="text-[8px] text-gray-500 font-black uppercase tracking-widest mb-1">Value</p>
                      <p className="text-[18px] font-black text-white">${Number(nft.buyPrice).toFixed(0)}</p>
                    </div>
                    <div className="bg-black/40 rounded-2xl p-3 border border-white/5 text-right">
                      <p className="text-[8px] text-gray-500 font-black uppercase tracking-widest mb-1">Target</p>
                      <p className="text-[18px] font-black text-[#FCE270]">${Number(nft.sellPrice).toFixed(0)}</p>
                    </div>
                  </div>

                  {nft.holdStatus === 'sell' && nft.status !== 'burned' ? (
                    <button
                      onClick={() => sellNFT(nft.nftId)}
                      disabled={selling === nft.nftId}
                      className="relative z-10 w-full h-12 rounded-2xl bg-[#FCE270] text-black font-black text-[11px] uppercase tracking-widest active:scale-95 transition-all shadow-lg shadow-[#FCE270]/20 flex items-center justify-center gap-2 hover:bg-[#f7d64a]"
                    >
                      {selling === nft.nftId ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-2 border-black border-t-transparent"></div>
                          <span>Listing...</span>
                        </>
                      ) : (
                        <>
                          <span>Sell for ${Number(nft.sellPrice).toFixed(0)}</span>
                          <RiArrowRightUpLine size={16} />
                        </>
                      )}
                    </button>
                  ) : (
                    <div className={`relative z-10 w-full h-12 flex items-center justify-center gap-2 rounded-2xl border text-[10px] font-black uppercase tracking-widest cursor-not-allowed ${statusConfig.bg} ${statusConfig.border} ${statusConfig.text}`}>
                      <RiInformationLine size={14} />
                      {nft.holdStatus === 'hold' ? "Asset Locked" : "Listed"}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-16 bg-gradient-to-br from-[#1A1A1A] to-[#151515] rounded-[28px] border border-white/5">
            <div className="w-20 h-20 rounded-full bg-white/[0.02] flex items-center justify-center mx-auto mb-4 border border-white/5">
              <RiStackLine size={28} className="text-gray-600" />
            </div>
            <h4 className="text-lg font-black text-white uppercase tracking-tight mb-2">No Assets</h4>
            <p className="text-[10px] font-bold text-gray-600 uppercase tracking-widest max-w-[220px] mx-auto leading-relaxed">
              Choose a pack above to start your collection
            </p>
          </div>
        )}

        {/* GUIDE CARD */}
        <div className="relative overflow-hidden bg-gradient-to-br from-[#1A1A1A] to-[#161616] p-5 rounded-[24px] border border-white/5">
          <div className="absolute top-0 right-0 w-24 h-24 bg-[#FCE270]/5 rounded-full -mr-12 -mt-12 blur-2xl"></div>
          <div className="relative z-10 flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#FCE270]/10 border border-[#FCE270]/20 flex items-center justify-center flex-shrink-0">
              <FaStar className="text-[#FCE270]" size={16} />
            </div>
            <div>
              <h4 className="text-[11px] font-black text-white uppercase tracking-wider mb-1.5">Growth Guide</h4>
              <p className="text-[10px] font-bold text-gray-500 leading-relaxed">
                Every trading pack purchase unlocks previous hold assets, maximizing your portfolio liquidity instantly.
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default NFTManagement;