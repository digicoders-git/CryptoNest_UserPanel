import React, { useState, useEffect } from 'react';
import { FaCoins, FaFire, FaStore, FaRocket, FaChartLine, FaDollarSign, FaLock, FaCheckCircle, FaClock, FaGift, FaInfoCircle } from 'react-icons/fa';
import { RiDashboardLine, RiWallet3Line, RiShieldFlashLine, RiCoinLine, RiShoppingBag3Line, RiArrowRightUpLine, RiStackLine, RiHistoryLine, RiCheckDoubleLine, RiFlashlightLine } from "react-icons/ri";
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { nftAPI, walletAPI, userAPI } from '../services/api';
import useAuthCheck from '../utils/useAuthCheck';

const NFTDashboard = () => {
  const token = useAuthCheck();
  const navigate = useNavigate();
  const [dashboardData, setDashboardData] = useState({
    systemStatus: null,
    userNFTs: [],
    userStats: {},
    marketplaceStats: {},
    userBalance: 0
  });
  const [loading, setLoading] = useState(true);
  const [quickBuying, setQuickBuying] = useState(false);

  if (!token) return null;

  useEffect(() => {
    fetchDashboardData();
    const interval = setInterval(fetchDashboardData, 60000);
    return () => clearInterval(interval);
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [statusRes, nftsRes, balanceRes, marketplaceRes] = await Promise.allSettled([
        nftAPI.getNFTStatus(),
        nftAPI.getMyNFTs(),
        walletAPI.getBalance(),
        nftAPI.getMarketplace()
      ]);

      const systemStatus = statusRes.status === 'fulfilled' ? statusRes.value.data : null;
      const nftData = nftsRes.status === 'fulfilled' ? nftsRes.value.data : { nfts: [], stats: {} };
      const balanceData = balanceRes.status === 'fulfilled' ? balanceRes.value.data : { balance: 0 };
      const marketplaceData = marketplaceRes.status === 'fulfilled' ? marketplaceRes.value.data : { nfts: [] };

      const userNFTs = nftData.nfts || [];
      const userStats = {
        totalNFTs: userNFTs.length,
        holdNFTs: userNFTs.filter(nft => nft.holdStatus === 'hold').length,
        sellNFTs: userNFTs.filter(nft => nft.holdStatus === 'sell').length,
        stakedNFTs: userNFTs.filter(nft => nft.isStaked).length,
        totalValue: userNFTs.reduce((sum, nft) => sum + (nft.buyPrice || 0), 0),
        potentialProfit: userNFTs.filter(nft => nft.holdStatus === 'sell').reduce((sum, nft) => sum + ((nft.sellPrice || 0) * 0.7), 0)
      };

      const marketplaceStats = {
        availableNFTs: marketplaceData.nfts?.length || 0,
        adminNFTs: marketplaceData.summary?.adminNFTs || 0,
        userResoldNFTs: marketplaceData.summary?.userResoldNFTs || 0
      };

      setDashboardData({
        systemStatus,
        userNFTs,
        userStats,
        marketplaceStats,
        userBalance: balanceData.balance || parseFloat(localStorage.getItem('demoBalance') || '0')
      });
    } catch (error) {
      setDashboardData({
        systemStatus: { currentPhase: 'pre-launch', preLaunch: { totalNFTs: 500, soldNFTs: 0, pricePerNFT: 10, availableNFTs: 500 } },
        userNFTs: [],
        userStats: { totalNFTs: 0, holdNFTs: 0, sellNFTs: 0, stakedNFTs: 0, totalValue: 0, potentialProfit: 0 },
        marketplaceStats: { availableNFTs: 500, adminNFTs: 500, userResoldNFTs: 0 },
        userBalance: parseFloat(localStorage.getItem('demoBalance') || '0')
      });
    }
    setLoading(false);
  };

  const quickBuyNFT = async () => {
    const { systemStatus, userBalance } = dashboardData;
    if (!systemStatus) {
      Swal.fire({ icon: 'error', title: 'System Status Error', text: 'Status not available', background: '#1A1A1A', color: '#fff', confirmButtonColor: '#FCE270' });
      return;
    }

    const isPreLaunch = systemStatus.currentPhase === 'pre-launch';
    const price = isPreLaunch ? 10 : 20;
    
    if (userBalance < price) {
      Swal.fire({ icon: 'error', title: 'Insufficient Balance', text: `Need $${price} for this asset.`, background: '#1A1A1A', color: '#fff', confirmButtonColor: '#FCE270' });
      return;
    }

    const result = await Swal.fire({
      background: '#1A1A1A',
      color: '#fff',
      title: `<span style="font-size: 18px; font-weight: 900; color: #fff;">QUICK ACQUISITION</span>`,
      html: `
        <div style="text-align: left; font-family: sans-serif;">
          <div style="background: #000; padding: 20px; border-radius: 20px; border: 1px solid rgba(255,255,255,0.05); margin-bottom: 20px; text-align: center;">
             <p style="font-size: 10px; font-weight: 900; color: #666; text-transform: uppercase; margin-bottom: 8px;">TOTAL COST</p>
             <p style="font-size: 28px; font-weight: 900; color: #FCE270; margin: 0;">$${price}</p>
             <p style="font-size: 9px; color: #444; margin-top: 5px;">Phase: ${systemStatus.currentPhase}</p>
          </div>
          <div style="background: #252525; padding: 15px; border-radius: 16px; border-left: 3 solid #FCE270;">
             <p style="font-size: 10px; font-weight: 900; color: #888; text-transform: uppercase; margin-bottom: 12px;">ASSET BENEFITS</p>
             <ul style="padding-left: 15px; margin: 0; font-size: 11px; color: #aaa; line-height: 1.6;">
               <li>1 Vault Item (Hold)</li>
               <li>1 Market Item (Sellable)</li>
               <li>Instant Portfolio Growth</li>
             </ul>
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

    setQuickBuying(true);
    try {
      const response = isPreLaunch ? await nftAPI.buyPreLaunchNFT() : await nftAPI.buyTradingNFT();
      Swal.fire({ icon: 'success', title: 'Asset Acquired', text: 'Collection updated successfully.', background: '#1A1A1A', color: '#fff', confirmButtonColor: '#FCE270' });
      fetchDashboardData();
    } catch (error) {
      Swal.fire({ icon: 'error', title: 'Action Failed', text: error.response?.data?.message || 'Error', background: '#1A1A1A', color: '#fff', confirmButtonColor: '#FCE270' });
    }
    setQuickBuying(false);
  };

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center h-[60vh] gap-4 bg-black">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#FCE270]"></div>
        <p className="text-[#FCE270] font-black uppercase tracking-widest text-[10px]">Syncing Insights...</p>
      </div>
    );
  }

  const { userStats, userBalance } = dashboardData;

  return (
    <div className="min-h-screen bg-black space-y-6 pb-20 px-2 font-sans">
      {/* Header Section */}
      <div className="flex items-center justify-between pt-4 px-2">
        <div>
          <h2 className="text-2xl font-black text-white tracking-tight uppercase">CryptoNest <span className="text-[#FCE270]">Insights</span></h2>
          <p className="text-[11px] font-bold text-gray-500 tracking-tight">Your Portfolio Intelligence Center</p>
        </div>
        <div className="w-10 h-10 bg-[#1A1A1A] rounded-xl border border-white/5 flex items-center justify-center">
          <RiDashboardLine className="text-[#FCE270]" size={18} />
        </div>
      </div>

      {/* Quick Summary Widget */}
      <div className="bg-[#1A1A1A] mx-2 p-5 rounded-[28px] border border-white/5 grid grid-cols-2 gap-4">
        <div>
          <p className="text-[10px] font-bold text-gray-600 mb-1">Net Balance</p>
          <p className="text-xl font-black text-white tracking-tighter">${userBalance.toFixed(2)}</p>
        </div>
        <div className="text-right">
           <p className="text-[10px] font-bold text-gray-600 mb-1">Node Status</p>
           <p className="text-sm font-black text-green-500 flex items-center justify-end gap-1">Synced <RiCheckDoubleLine/></p>
        </div>
      </div>

      {/* Portfolio Matrix */}
      <div className="px-2 space-y-4">
        <h3 className="font-black text-[10px] text-gray-600 uppercase tracking-[0.2em] px-2 flex items-center gap-2">
          <RiShieldFlashLine size={12} className="text-[#FCE270]" />
          PORTFOLIO MATRIX
        </h3>
        
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-[#1A1A1A] p-5 rounded-[24px] border border-white/5">
            <RiCoinLine className="text-[#FCE270] mb-3" size={20} />
            <p className="text-[10px] font-bold text-gray-500">Total Assets</p>
            <p className="text-xl font-black text-white">{userStats.totalNFTs}</p>
          </div>
          <div className="bg-[#1A1A1A] p-5 rounded-[24px] border border-white/5">
            <RiShieldFlashLine className="text-green-500 mb-3" size={20} />
            <p className="text-[10px] font-bold text-gray-500">Hold Assets</p>
            <p className="text-xl font-black text-white">{userStats.holdNFTs}</p>
          </div>
          <div className="bg-[#1A1A1A] p-5 rounded-[24px] border border-white/5">
            <RiShoppingBag3Line className="text-blue-500 mb-3" size={20} />
            <p className="text-[10px] font-bold text-gray-500">Market Assets</p>
            <p className="text-xl font-black text-white">{userStats.sellNFTs}</p>
          </div>
          <div className="bg-[#1A1A1A] p-5 rounded-[24px] border border-white/5">
            <RiFlashlightLine className="text-purple-500 mb-3" size={20} />
            <p className="text-[10px] font-bold text-gray-500">Staked Assets</p>
            <p className="text-xl font-black text-white">{userStats.stakedNFTs}</p>
          </div>
        </div>

        {/* Profit Card */}
        <div className="bg-gradient-to-br from-[#1A1A1A] to-black p-6 rounded-[32px] border border-white/5 flex items-center justify-between shadow-2xl relative overflow-hidden group">
           <div className="relative z-10">
              <p className="text-[10px] font-bold text-gray-600 mb-1">Projected Revenue</p>
              <p className="text-3xl font-black text-white tracking-tighter">${userStats.potentialProfit.toFixed(0)}</p>
              <p className="text-[10px] font-bold text-green-500 mt-2 flex items-center gap-1">Growth Optimized <RiArrowRightUpLine/></p>
           </div>
           <div className="w-16 h-16 bg-[#FCE270]/5 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
              <RiWallet3Line className="text-[#FCE270]" size={32} />
           </div>
        </div>
      </div>

      {/* Quick Access Grid */}
      <div className="px-2 space-y-4 pt-2">
        <h3 className="font-black text-[10px] text-gray-600 uppercase tracking-[0.2em] px-2 flex items-center gap-2">
          <RiStackLine size={12} className="text-[#FCE270]" />
          SMART ACCESS
        </h3>
        
        <div className="grid grid-cols-2 gap-3">
          <button 
            onClick={() => navigate('/dashboard/nft-marketplace')}
            className="bg-[#1A1A1A] p-5 rounded-[28px] border border-white/5 text-left group hover:bg-[#222] transition-all"
          >
            <RiShoppingBag3Line className="text-blue-400 mb-4 group-hover:scale-110 transition-transform" size={24} />
            <h4 className="text-[13px] font-black text-white">Marketplace</h4>
            <p className="text-[10px] font-bold text-gray-600">Acquire Assets</p>
          </button>
          
          <button 
            onClick={() => navigate('/dashboard/my-nfts')}
            className="bg-[#1A1A1A] p-5 rounded-[28px] border border-white/5 text-left group hover:bg-[#222] transition-all"
          >
            <RiStackLine className="text-green-400 mb-4 group-hover:scale-110 transition-transform" size={24} />
            <h4 className="text-[13px] font-black text-white">Vault</h4>
            <p className="text-[10px] font-bold text-gray-600">My Collection</p>
          </button>
        </div>
      </div>

      {/* Activity Timeline */}
      {dashboardData.userNFTs.length > 0 && (
        <div className="px-2 space-y-4 pt-2">
          <h3 className="font-black text-[10px] text-gray-600 uppercase tracking-[0.2em] px-2 flex items-center gap-2">
            <RiHistoryLine size={12} className="text-[#FCE270]" />
            RECENT ACTIVITY
          </h3>
          
          <div className="space-y-3">
            {dashboardData.userNFTs.slice(0, 3).map((nft) => (
              <div key={nft._id || nft.nftId} className="bg-[#1A1A1A] p-4 rounded-[24px] border border-white/5 flex items-center justify-between group">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-black rounded-2xl flex items-center justify-center border border-white/5 shadow-inner">
                    <RiCoinLine className="text-[#FCE270]" size={16} />
                  </div>
                  <div>
                    <p className="text-[12px] font-black text-white truncate max-w-[120px]">{nft.nftId}</p>
                    <p className="text-[10px] font-bold text-gray-600">Gen {nft.generation} • ${nft.buyPrice}</p>
                  </div>
                </div>
                <div className={`px-3 py-1.5 rounded-xl border text-[9px] font-bold ${
                  nft.isStaked ? 'bg-purple-500/10 border-purple-500/20 text-purple-400' :
                  nft.holdStatus === 'hold' ? 'bg-green-500/10 border-green-500/20 text-green-400' :
                  'bg-blue-500/10 border-blue-500/20 text-blue-400'
                }`}>
                  {nft.isStaked ? 'Staked' : nft.holdStatus.charAt(0).toUpperCase() + nft.holdStatus.slice(1)}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty State / Welcome */}
      {userStats.totalNFTs === 0 && (
        <div className="bg-[#1A1A1A] mx-2 p-12 rounded-[40px] border border-white/5 text-center relative overflow-hidden">
          <div className="relative z-10">
            <RiFlashlightLine className="mx-auto text-gray-800 mb-6" size={48} />
            <h3 className="text-xl font-black text-white uppercase tracking-tight mb-2">Build Your Vault</h3>
            <p className="text-[11px] font-bold text-gray-500 leading-relaxed mb-8 max-w-[240px] mx-auto">
              Your asset history is empty. Initialize your collection by acquiring your first node.
            </p>
            <button 
              onClick={quickBuyNFT}
              className="px-8 py-3 bg-[#FCE270] text-black font-black text-[12px] uppercase tracking-[0.2em] rounded-2xl shadow-xl shadow-[#FCE270]/5 active:scale-95 transition-all"
            >
              INITIALIZE NODE
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default NFTDashboard;