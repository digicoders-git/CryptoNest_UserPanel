import React, { useState, useEffect } from 'react';
import {
  FaImage, FaArrowUp, FaArrowDown, FaDollarSign, FaCoins,
  FaHistory, FaCalendarAlt, FaChevronLeft, FaFilter, FaSearch,
  FaChartBar, FaReceipt, FaExchangeAlt, FaDownload,
} from 'react-icons/fa';
import {
  RiHistoryLine, RiArrowUpSLine, RiArrowDownSLine, RiHandCoinLine,
  RiWallet3Line, RiInformationLine, RiNotification3Line, RiRefreshLine,
  RiFileList3Line, RiFundsLine, RiBarChart2Line,
} from 'react-icons/ri';
import api from '../services/api';

const NFTHistory = ({ onBack }) => {
  const [nftTransactions, setNftTransactions] = useState([]);
  const [stats, setStats] = useState({ totalBought: 0, totalSold: 0, totalProfit: 0 });
  const [loading, setLoading] = useState(true);
  const [pullDistance, setPullDistance] = useState(0);
  const [isPulling, setIsPulling] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchNFTHistory();
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
      await fetchNFTHistory();
      setTimeout(() => {
        setRefreshing(false);
        setPullDistance(0);
      }, 500);
    } else {
      setPullDistance(0);
    }
    setIsPulling(false);
  };

  const fetchNFTHistory = async () => {
    try {
      let transactions = [];
      let calculatedStats = { totalBought: 0, totalSold: 0, totalProfit: 0 };

      const transactionResponse = await api.get('/user/transactions');
      const allTransactions = transactionResponse.data.transactions || [];

      transactions = allTransactions.filter(tx =>
        tx.description && (
          tx.description.toLowerCase().includes('nft') ||
          tx.type === 'nft_purchase' ||
          tx.type === 'nft_sale'
        )
      ).map(tx => ({
        ...tx,
        type: tx.description.toLowerCase().includes('purchase') || tx.description.toLowerCase().includes('buy') ? 'buy' : 'sell',
        nftId: tx.nftId || tx.description || 'NFT Transaction'
      }));

      if (transactions.length > 0) {
        calculatedStats = {
          totalBought: transactions.filter(tx => tx.type === 'buy').length,
          totalSold: transactions.filter(tx => tx.type === 'sell').length,
          totalProfit: transactions
            .filter(tx => tx.type === 'sell')
            .reduce((sum, tx) => sum + (tx.profit || 12), 0)
        };
      }

      setNftTransactions(transactions);
      setStats(calculatedStats);

    } catch (error) {
      // Silent error
    }
    setLoading(false);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return { bg: 'bg-green-500/10', border: 'border-green-500/20', text: 'text-green-400', dot: 'bg-green-500' };
      case 'pending': return { bg: 'bg-yellow-500/10', border: 'border-yellow-500/20', text: 'text-yellow-400', dot: 'bg-yellow-500' };
      case 'failed': return { bg: 'bg-red-500/10', border: 'border-red-500/20', text: 'text-red-400', dot: 'bg-red-500' };
      default: return { bg: 'bg-gray-500/10', border: 'border-gray-500/20', text: 'text-gray-400', dot: 'bg-gray-500' };
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-[#0A0A0A] flex flex-col items-center justify-center gap-4 z-50">
        <div className="relative">
          <div className="w-20 h-20 rounded-3xl bg-[#FCE270]/10 flex items-center justify-center animate-pulse">
            <RiHistoryLine className="text-[#FCE270] text-3xl" />
          </div>
          <div className="absolute -top-3 -right-3 w-7 h-7 bg-[#FCE270] rounded-full animate-bounce flex items-center justify-center">
            <RiRefreshLine className="text-black text-sm" />
          </div>
        </div>
        <div className="flex flex-col items-center gap-2">
          <div className="w-36 h-3 bg-white/10 rounded-full animate-pulse"></div>
          <div className="w-24 h-2 bg-white/5 rounded-full animate-pulse"></div>
        </div>
        <p className="text-[#FCE270] font-black uppercase tracking-widest text-[10px] mt-2 animate-pulse">Loading History...</p>
      </div>
    );
  }

  // Filtered transactions
  const filteredTransactions = selectedFilter === 'all'
    ? nftTransactions
    : selectedFilter === 'buy'
      ? nftTransactions.filter(tx => tx.type === 'buy')
      : nftTransactions.filter(tx => tx.type === 'sell');

  const totalInvested = stats.totalBought * 10;
  const totalReturns = stats.totalSold * 14;
  const netProfit = totalReturns - totalInvested;

  return (
    <div
      className="min-h-screen bg-[#0A0A0A] max-w-md mx-auto relative"
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
              { key: 'all', label: 'All', count: nftTransactions.length },
              { key: 'buy', label: 'Bought', count: stats.totalBought },
              { key: 'sell', label: 'Sold', count: stats.totalSold },
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

        {/* STATS CARDS */}
        <div className="grid grid-cols-3 gap-2.5 mt-3">
          <div className="bg-gradient-to-br from-[#1A1A1A] to-[#151515] p-4 rounded-2xl border border-white/5 text-center active:scale-[0.97] transition-all">
            <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto mb-2.5">
              <FaArrowDown className="text-red-400" size={14} />
            </div>
            <p className="text-[11px] text-white font-black tracking-wide mb-1">Bought</p>
            <p className="text-[22px] font-black text-white">{stats.totalBought}</p>
          </div>

          <div className="bg-gradient-to-br from-[#1A1A1A] to-[#151515] p-4 rounded-2xl border border-white/5 text-center active:scale-[0.97] transition-all">
            <div className="w-10 h-10 rounded-xl bg-green-500/10 border border-green-500/20 flex items-center justify-center mx-auto mb-2.5">
              <FaArrowUp className="text-green-400" size={14} />
            </div>
            <p className="text-[11px] text-white font-black tracking-wide mb-1">Sold</p>
            <p className="text-[22px] font-black text-white">{stats.totalSold}</p>
          </div>

          <div className="bg-gradient-to-br from-[#1A1A1A] to-[#151515] p-4 rounded-2xl border border-white/5 text-center active:scale-[0.97] transition-all">
            <div className="w-10 h-10 rounded-xl bg-[#FCE270]/10 border border-[#FCE270]/20 flex items-center justify-center mx-auto mb-2.5">
              <RiHandCoinLine className="text-[#FCE270]" size={18} />
            </div>
            <p className="text-[11px] text-white font-black tracking-wide mb-1">Profit</p>
            <p className="text-[18px] font-black text-[#FCE270]">${stats.totalProfit}</p>
          </div>
        </div>

        {/* TRADING SUMMARY CARD - Only if transactions exist */}
        {nftTransactions.length > 0 && (
          <div className="relative overflow-hidden bg-gradient-to-br from-[#FCE270] to-[#E5C94D] p-5 rounded-[24px] shadow-xl shadow-[#FCE270]/10">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-black/10 rounded-full -ml-12 -mb-12 blur-xl"></div>

            <div className="relative z-10">
              <h4 className="font-black text-black text-[11px] uppercase tracking-wider mb-4 flex items-center gap-2">
                <RiFundsLine size={16} />
                Trading Summary
              </h4>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <p className="text-[11px] font-black text-black tracking-wide mb-1">Invested</p>
                  <p className="text-[18px] font-black text-black">${totalInvested}</p>
                </div>
                <div>
                  <p className="text-[11px] font-black text-black tracking-wide mb-1">Returns</p>
                  <p className="text-[18px] font-black text-black">${totalReturns}</p>
                </div>
                <div>
                  <p className="text-[11px] font-black text-black tracking-wide mb-1">Net P&L</p>
                  <p className={`text-[18px] font-black ${netProfit >= 0 ? 'text-black' : 'text-red-600'}`}>
                    {netProfit >= 0 ? '+' : ''}${netProfit}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TRANSACTION LIST HEADER */}
        <div className="flex items-center justify-between">
          <h3 className="font-black text-[12px] text-white uppercase tracking-wider flex items-center gap-2">
            <FaExchangeAlt size={13} className="text-[#FCE270]" />
            Transactions
          </h3>
          <span className="text-[10px] text-gray-500 font-black uppercase tracking-widest">
            {filteredTransactions.length} records
          </span>
        </div>

        {/* TRANSACTION CARDS */}
        {filteredTransactions.length > 0 ? (
          <div className="space-y-2.5">
            {filteredTransactions.map((tx, index) => {
              const statusConfig = getStatusColor(tx.status || 'completed');

              return (
                <div
                  key={index}
                  className="relative overflow-hidden bg-gradient-to-br from-[#1A1A1A] via-[#161616] to-[#111111] rounded-[20px] border border-white/5 active:scale-[0.98] transition-all"
                >
                  {/* Glow based on type */}
                  <div className={`absolute top-0 right-0 w-24 h-24 rounded-full -mr-12 -mt-12 blur-2xl opacity-10 ${tx.type === 'buy' ? 'bg-red-500' : 'bg-green-500'
                    }`}></div>

                  <div className="relative z-10 p-4">
                    {/* Top Row */}
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className={`w-11 h-11 rounded-xl flex items-center justify-center border shadow-lg ${tx.type === 'buy'
                          ? 'bg-red-500/10 border-red-500/20'
                          : 'bg-green-500/10 border-green-500/20'
                          }`}>
                          {tx.type === 'buy' ? (
                            <FaArrowDown className="text-red-400" size={18} />
                          ) : (
                            <FaArrowUp className="text-green-400" size={18} />
                          )}
                        </div>
                        <div>
                          <p className="font-black text-[13px] text-white">
                            {tx.type === 'buy' ? 'Purchase NFT' : 'Sale NFT'}
                          </p>
                          <p className="text-[10px] font-bold text-gray-500 truncate max-w-[130px] uppercase tracking-wider">
                            {tx.nftId || 'NFT Asset'}
                          </p>
                        </div>
                      </div>

                      <div className="text-right">
                        <p className={`text-[16px] font-black tracking-tight ${tx.type === 'buy' ? 'text-red-400' : 'text-green-400'
                          }`}>
                          {tx.type === 'buy' ? '-' : '+'}${Number(tx.amount || 0).toFixed(2)}
                        </p>
                        {tx.type === 'sell' && tx.profit && (
                          <p className="text-[9px] font-black text-green-400/70 uppercase tracking-wider mt-0.5">
                            Profit: +${Number(tx.profit).toFixed(2)}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Bottom Row */}
                    <div className="flex items-center justify-between pt-3 border-t border-white/5">
                      <div className="flex items-center gap-2 text-[10px] font-black text-gray-500 uppercase tracking-wider">
                        <FaCalendarAlt size={11} className="text-gray-600" />
                        <span>
                          {tx.createdAt
                            ? new Date(tx.createdAt).toLocaleDateString('en-GB', {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric'
                            })
                            : 'N/A'}
                        </span>
                      </div>
                      <div className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider flex items-center gap-1.5 ${statusConfig.bg} ${statusConfig.border} ${statusConfig.text}`}>
                        <div className={`w-1.5 h-1.5 rounded-full ${statusConfig.dot}`}></div>
                        {tx.status || 'Completed'}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* EMPTY STATE */
          <div className="text-center py-16 bg-gradient-to-br from-[#1A1A1A] to-[#151515] rounded-[28px] border border-white/5">
            <div className="w-20 h-20 rounded-full bg-white/[0.02] flex items-center justify-center mx-auto mb-4 border border-white/5">
              <RiHistoryLine size={28} className="text-gray-600" />
            </div>
            <h4 className="text-lg font-black text-white uppercase tracking-tight mb-2">No Records</h4>
            <p className="text-[10px] font-bold text-gray-600 uppercase tracking-widest max-w-[220px] mx-auto leading-relaxed">
              Your NFT transaction history will appear here
            </p>
          </div>
        )}

      </div>
    </div>
  );
};

export default NFTHistory;