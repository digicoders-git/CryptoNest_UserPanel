import React, { useState, useEffect } from "react";
import {
  FaHistory,
  FaShoppingCart,
  FaDollarSign,
  FaUsers,
  FaArrowUp,
  FaArrowDown,
  FaExchangeAlt,
  FaChevronLeft,
  FaFilter,
  FaSearch,
  FaCalendarAlt,
  FaDownload,
} from "react-icons/fa";
import {
  RiHistoryLine,
  RiArrowLeftRightLine,
  RiAddCircleLine,
  RiIndeterminateCircleLine
} from "react-icons/ri";
import { userAPI } from "../services/api";

const History = ({ onBack }) => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pullDistance, setPullDistance] = useState(0);
  const [isPulling, setIsPulling] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchTransactions();
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
      await fetchTransactions();
      setTimeout(() => {
        setRefreshing(false);
        setPullDistance(0);
      }, 500);
    } else {
      setPullDistance(0);
    }
    setIsPulling(false);
  };

  const fetchTransactions = async () => {
    try {
      setError(null);
      const response = await userAPI.getTransactions();
      setTransactions(response.data.transactions || []);
    } catch (error) {
      setError("Failed to load transactions");
      setTransactions([]);
    }
    setLoading(false);
  };

  const getTransactionIcon = (type) => {
    switch (type) {
      case "demo_payment":
        return <RiAddCircleLine size={20} />;
      case "nft_purchase":
        return <RiIndeterminateCircleLine size={20} />;
      case "nft_sale":
        return <RiAddCircleLine size={20} />;
      case "referral_bonus":
        return <FaUsers size={18} />;
      default:
        return <RiArrowLeftRightLine size={18} />;
    }
  };

  const getTransactionColor = (type) => {
    switch (type) {
      case "demo_payment":
      case "nft_sale":
      case "referral_bonus":
        return "bg-[#FCE270]/10 text-[#FCE270]";
      case "nft_purchase":
        return "bg-red-500/10 text-red-500";
      default:
        return "bg-gray-800 text-gray-400";
    }
  };

  const getAmountColor = (type) => {
    switch (type) {
      case "demo_payment":
      case "nft_sale":
      case "referral_bonus":
        return "text-green-400";
      case "nft_purchase":
        return "text-red-400";
      default:
        return "text-gray-400";
    }
  };

  const getAmountPrefix = (type) => {
    switch (type) {
      case "demo_payment":
      case "nft_sale":
      case "referral_bonus":
        return "+";
      case "nft_purchase":
        return "-";
      default:
        return "";
    }
  };

  const getTransactionLabel = (type) => {
    const labels = {
      demo_payment: "Deposit",
      nft_purchase: "Purchase",
      nft_sale: "Sale",
      referral_bonus: "Referral",
    };
    return labels[type] || type?.replace("_", " ") || "Transaction";
  };

  // Group transactions by date
  const groupedTransactions = transactions.reduce((groups, tx) => {
    const date = new Date(tx.createdAt).toLocaleDateString(undefined, {
      weekday: 'long',
      month: 'long',
      day: 'numeric'
    });
    if (!groups[date]) groups[date] = [];
    groups[date].push(tx);
    return groups;
  }, {});

  if (loading) {
    return (
      <div className="fixed inset-0 bg-[#0A0A0A] flex flex-col items-center justify-center gap-4 z-50">
        <div className="relative">
          <div className="w-16 h-16 rounded-2xl bg-[#FCE270]/10 flex items-center justify-center animate-pulse">
            <RiHistoryLine className="text-[#FCE270] text-2xl" />
          </div>
          <div className="absolute -top-2 -right-2 w-5 h-5 bg-[#FCE270] rounded-full animate-bounce"></div>
        </div>
        <div className="flex flex-col items-center gap-2">
          <div className="w-36 h-3 bg-white/10 rounded-full animate-pulse"></div>
          <div className="w-24 h-2 bg-white/5 rounded-full animate-pulse"></div>
        </div>
        <p className="text-[#FCE270] font-medium animate-pulse text-sm mt-1">Loading History...</p>
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
            className={`w-8 h-8 rounded-full border-2 border-[#FCE270] flex items-center justify-center bg-[#1A1A1A] ${refreshing ? 'animate-spin' : ''}`}
            style={{ transform: `rotate(${pullDistance * 3}deg)` }}
          >
            <FaHistory className="text-[#FCE270] text-xs" />
          </div>
        </div>
      )}

      {/* REFRESHING OVERLAY */}
      {refreshing && (
        <div className="fixed top-14 left-0 right-0 flex justify-center z-50 animate-fadeIn">
          <div className="bg-[#1A1A1A] border border-white/10 rounded-full px-4 py-1.5 flex items-center gap-2 shadow-2xl">
            <div className="w-3 h-3 border-2 border-[#FCE270] border-t-transparent rounded-full animate-spin"></div>
            <span className="text-[11px] text-gray-400 font-bold">Updating...</span>
          </div>
        </div>
      )}



      {/* CONTENT */}
      <div className="px-4 pb-28">

        {/* SUMMARY CARDS */}
        <div className="grid grid-cols-3 gap-2.5 mt-3 mb-5">
          <div className="bg-gradient-to-br from-[#1A1A1A] to-[#141414] p-3.5 rounded-2xl border border-white/5 text-center">
            <p className="text-[9px] text-white font-semibold uppercase tracking-widest mb-1">Total Txns</p>
            <p className="text-[20px] font-semibold text-white">{transactions.length}</p>
          </div>
          <div className="bg-gradient-to-br from-[#1A1A1A] to-[#141414] p-3.5 rounded-2xl border border-white/5 text-center">
            <p className="text-[9px] text-white font-semibold uppercase tracking-widest mb-1">Inflow</p>
            <p className="text-[16px] font-semibold text-green-400">
              +${transactions
                .filter(t => ['demo_payment', 'nft_sale', 'referral_bonus'].includes(t.type))
                .reduce((sum, t) => sum + Number(t.amount), 0)
                .toFixed(2)}
            </p>
          </div>
          <div className="bg-gradient-to-br from-[#1A1A1A] to-[#141414] p-3.5 rounded-2xl border border-white/5 text-center">
            <p className="text-[9px] text-white font-semibold uppercase tracking-widest mb-1">Outflow</p>
            <p className="text-[16px] font-semibold text-red-400">
              -${transactions
                .filter(t => t.type === 'nft_purchase')
                .reduce((sum, t) => sum + Number(t.amount), 0)
                .toFixed(2)}
            </p>
          </div>
        </div>

        {/* ERROR STATE */}
        {error && (
          <div className="bg-red-500/5 border border-red-500/20 rounded-2xl p-4 flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center flex-shrink-0">
              <FaArrowDown className="text-red-400" size={16} />
            </div>
            <div>
              <p className="text-red-400 font-bold text-sm">{error}</p>
              <button
                onClick={fetchTransactions}
                className="text-red-400/70 text-[11px] font-bold mt-0.5 underline"
              >
                Tap to retry
              </button>
            </div>
          </div>
        )}

        {/* TRANSACTION LIST */}
        {transactions.length > 0 ? (
          <div className="space-y-4">
            {Object.entries(groupedTransactions).map(([date, txs], groupIdx) => (
              <div key={groupIdx}>
                {/* Date Header */}
                <div className="flex items-center gap-3 mb-2.5 px-1">
                  <FaCalendarAlt className="text-gray-600" size={11} />
                  <p className="text-[11px] text-white font-semibold uppercase tracking-widest">{date}</p>
                  <div className="flex-1 h-px bg-white/5"></div>
                </div>

                {/* Transactions for this date */}
                <div className="space-y-2">
                  {txs.map((tx, index) => (
                    <div
                      key={tx._id || index}
                      className="flex items-center justify-between bg-gradient-to-br from-[#1A1A1A] to-[#151515] px-4 py-3.5 rounded-2xl border border-white/5 active:scale-[0.98] transition-all"
                    >
                      <div className="flex gap-3.5 items-center flex-1 min-w-0">
                        <div className={`w-[42px] h-[42px] rounded-xl flex items-center justify-center flex-shrink-0 ${getTransactionColor(tx.type).split(' ')[0]} shadow-lg`}>
                          <span className={getTransactionColor(tx.type).split(' ')[1]}>
                            {getTransactionIcon(tx.type)}
                          </span>
                        </div>

                        <div className="min-w-0 flex-1">
                          <p className="text-[13px] font-semibold text-gray-100 truncate">
                            {tx.description}
                          </p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-[9px] bg-white/5 px-1.5 py-0.5 rounded-md text-white font-semibold uppercase">
                              {getTransactionLabel(tx.type)}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="text-right ml-3 flex-shrink-0">
                        <p className={`text-[15px] font-semibold ${getAmountColor(tx.type)} tracking-tight`}>
                          {getAmountPrefix(tx.type)}${Number(tx.amount).toFixed(2)}
                        </p>
                        <p className="text-[9px] text-white font-semibold mt-0.5">
                          {new Date(tx.createdAt).toLocaleTimeString(undefined, {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* EMPTY STATE */
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-24 h-24 bg-[#1A1A1A] rounded-full flex items-center justify-center mb-5 border border-white/5 shadow-2xl relative">
              <RiHistoryLine size={36} className="text-gray-700" />
              <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-[#0A0A0A] rounded-full flex items-center justify-center border border-white/5">
                <FaSearch className="text-gray-600" size={12} />
              </div>
            </div>
            <h3 className="text-gray-400 font-semibold text-lg">No Activity Yet</h3>
            <p className="text-gray-600 text-sm max-w-[220px] mt-1.5 leading-relaxed">
              Your transaction history will appear here once you start trading
            </p>
            <button className="mt-5 bg-[#1A1A1A] border border-white/10 rounded-xl px-5 py-2.5 text-[#FCE270] text-sm font-semibold active:scale-95 transition-all">
              Start Trading
            </button>
          </div>
        )}
      </div>


    </div>
  );
};

export default History;