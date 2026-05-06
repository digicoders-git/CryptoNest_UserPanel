import React, { useState, useEffect } from 'react';
import {
  FaBell, FaClock, FaChevronLeft, FaFilter, FaSearch,
  FaCheckCircle, FaExclamationTriangle, FaInfoCircle,
  FaBullhorn, FaStar, FaShieldAlt,
} from 'react-icons/fa';
import {
  RiNotification3Line, RiBroadcastLine, RiTimeLine,
  RiInformationLine, RiCheckDoubleLine, RiAlertLine,
  RiRefreshLine, RiMegaphoneLine, RiSparklingLine,
  RiNotificationBadgeLine, RiCheckboxCircleLine,
  RiErrorWarningLine, RiSpeakerLine,
} from 'react-icons/ri';

// Import fix for RiShieldUserLine
import { RiShieldUserLine } from 'react-icons/ri';

const Notifications = ({ onBack }) => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pullDistance, setPullDistance] = useState(0);
  const [isPulling, setIsPulling] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchNotifications();
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
      await fetchNotifications();
      setTimeout(() => {
        setRefreshing(false);
        setPullDistance(0);
      }, 500);
    } else {
      setPullDistance(0);
    }
    setIsPulling(false);
  };

  const fetchNotifications = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/notifications/all`);
      const result = await response.json();

      if (result.success && result.data) {
        setNotifications(result.data);
      }
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
      // Demo data if API fails
      setNotifications([
        { _id: '1', title: 'System Protocol Update', message: 'The CryptoNest network is undergoing a security patch. All systems operational.', type: 'announcement', createdAt: new Date().toISOString(), priority: 'high', isActive: true },
        { _id: '2', title: 'Tier Advancement Success', message: 'Congratulations! Your account has been upgraded to Elite Status.', type: 'success', createdAt: new Date(Date.now() - 86400000).toISOString(), priority: 'medium', isActive: false }
      ]);
    }
    setLoading(false);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days} Days Ago`;

    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTypeConfig = (type) => {
    const configs = {
      announcement: {
        icon: <RiMegaphoneLine size={16} />,
        bg: 'bg-blue-500/10',
        border: 'border-blue-500/20',
        text: 'text-blue-400',
        glow: 'bg-blue-500',
        badge: 'bg-blue-500/5 border-blue-500/20 text-blue-500',
      },
      success: {
        icon: <RiCheckboxCircleLine size={16} />,
        bg: 'bg-green-500/10',
        border: 'border-green-500/20',
        text: 'text-green-400',
        glow: 'bg-green-500',
        badge: 'bg-green-500/5 border-green-500/20 text-green-500',
      },
      warning: {
        icon: <RiErrorWarningLine size={16} />,
        bg: 'bg-yellow-500/10',
        border: 'border-yellow-500/20',
        text: 'text-yellow-400',
        glow: 'bg-yellow-500',
        badge: 'bg-yellow-500/5 border-yellow-500/20 text-yellow-500',
      },
      alert: {
        icon: <RiAlertLine size={16} />,
        bg: 'bg-red-500/10',
        border: 'border-red-500/20',
        text: 'text-red-400',
        glow: 'bg-red-500',
        badge: 'bg-red-500/5 border-red-500/20 text-red-500',
      },
    };
    return configs[type] || {
      icon: <RiInformationLine size={16} />,
      bg: 'bg-gray-500/10',
      border: 'border-gray-500/20',
      text: 'text-gray-400',
      glow: 'bg-gray-500',
      badge: 'bg-gray-500/5 border-gray-500/20 text-gray-500',
    };
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return { dot: 'bg-red-500 shadow-[0_0_6px_rgba(239,68,68,0.5)]', text: 'text-red-400' };
      case 'medium': return { dot: 'bg-yellow-500 shadow-[0_0_6px_rgba(234,179,8,0.5)]', text: 'text-yellow-400' };
      default: return { dot: 'bg-gray-500', text: 'text-gray-400' };
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-[#0A0A0A] flex flex-col items-center justify-center gap-4 z-50">
        <div className="relative">
          <div className="w-20 h-20 rounded-3xl bg-[#FCE270]/10 flex items-center justify-center animate-pulse">
            <RiNotification3Line className="text-[#FCE270] text-3xl" />
          </div>
          <div className="absolute -top-3 -right-3 w-7 h-7 bg-[#FCE270] rounded-full animate-bounce flex items-center justify-center shadow-lg">
            <RiRefreshLine className="text-black text-sm" />
          </div>
        </div>
        <div className="flex flex-col items-center gap-2">
          <div className="w-40 h-3 bg-white/10 rounded-full animate-pulse"></div>
          <div className="w-28 h-2 bg-white/5 rounded-full animate-pulse"></div>
        </div>
        <p className="text-[#FCE270] font-black uppercase tracking-widest text-[10px] mt-2 animate-pulse">Syncing Broadcasts...</p>
      </div>
    );
  }

  // Count notifications by type
  const typeCounts = {
    all: notifications.length,
    announcement: notifications.filter(n => n.type === 'announcement').length,
    success: notifications.filter(n => n.type === 'success').length,
    warning: notifications.filter(n => n.type === 'warning').length,
    alert: notifications.filter(n => n.type === 'alert').length,
  };

  const unreadCount = notifications.filter(n => n.isActive).length;

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
            <span className="text-[11px] text-gray-400 font-bold">Updating...</span>
          </div>
        </div>
      )}


      {/* CONTENT */}
      <div className="px-4 pb-28 space-y-4">

        {/* SUMMARY CARD */}
        <div className="relative overflow-hidden bg-gradient-to-br from-[#1A1A1A] via-[#161616] to-[#111111] p-5 rounded-[24px] border border-white/5 shadow-2xl mt-3">
          <div className="absolute top-0 right-0 w-40 h-40 bg-[#FCE270]/5 rounded-full -mr-20 -mt-20 blur-3xl"></div>

          <div className="relative z-10 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-black/50 border border-[#FCE270]/20 flex items-center justify-center shadow-lg relative">
                <RiSpeakerLine className="text-[#FCE270]" size={22} />
                {unreadCount > 0 && (
                  <div className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center border-2 border-[#111]">
                    <span className="text-[8px] font-black text-white">{unreadCount}</span>
                  </div>
                )}
              </div>
              <div>
                <p className="text-[12px] text-white font-black tracking-wide mb-1">Activity Feed</p>
                <p className="text-[26px] font-black text-white tracking-tight leading-none">
                  {notifications.length} <span className="text-[12px] text-gray-500">Logs</span>
                </p>
              </div>
            </div>
            <div className="text-right">
              <div className="bg-green-500/10 border border-green-500/20 rounded-xl px-3 py-1.5 mb-2">
                <div className="flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-[9px] text-green-400 font-black uppercase tracking-wider">Live</span>
                </div>
              </div>
              <p className="text-[10px] text-gray-500 font-black uppercase tracking-wider">{unreadCount} Unread</p>
            </div>
          </div>
        </div>

        {/* NOTIFICATION LIST */}
        {notifications.length > 0 ? (
          <div className="space-y-3">
            {notifications.map((notification) => {
              const typeConfig = getTypeConfig(notification.type);
              const priorityConfig = getPriorityColor(notification.priority);

              return (
                <div
                  key={notification._id}
                  className="relative overflow-hidden bg-gradient-to-br from-[#1A1A1A] via-[#161616] to-[#111111] rounded-[24px] border border-white/5 active:scale-[0.98] transition-all"
                >
                  {/* Glow Effect */}
                  <div className={`absolute top-0 right-0 w-28 h-28 rounded-full -mr-14 -mt-14 blur-3xl opacity-10 ${typeConfig.glow}`}></div>

                  {/* Content */}
                  <div className="relative z-10 p-5">
                    {/* Header Row */}
                    <div className="flex items-start gap-3 mb-3">
                      {/* Icon */}
                      <div className={`w-10 h-10 rounded-xl ${typeConfig.bg} ${typeConfig.border} border flex items-center justify-center flex-shrink-0 ${typeConfig.text} shadow-lg`}>
                        {typeConfig.icon}
                      </div>

                      {/* Title & Meta */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <h3 className="font-black text-[14px] text-white truncate pr-2">
                            {notification.title}
                          </h3>
                          {notification.isActive && (
                            <div className="flex-shrink-0 bg-red-500/20 border border-red-500/30 px-2 py-0.5 rounded-lg flex items-center gap-1 animate-pulse">
                              <div className="w-1 h-1 rounded-full bg-red-400"></div>
                              <span className="text-[8px] font-black text-red-400 uppercase tracking-wider">New</span>
                            </div>
                          )}
                        </div>
                        <div className="flex items-center gap-3 text-[9px] font-black text-white tracking-wide">
                          <div className="flex items-center gap-1">
                            <RiTimeLine size={11} />
                            <span>{formatDate(notification.createdAt)}</span>
                          </div>
                          <span className="text-gray-600">•</span>
                          <span>{formatTime(notification.createdAt)}</span>
                        </div>
                      </div>
                    </div>

                    {/* Message */}
                    <p className="text-[12px] font-bold text-gray-400 leading-relaxed mb-4 ml-[52px]">
                      {notification.message}
                    </p>

                    {/* Footer */}
                    <div className="flex items-center justify-between pt-4 border-t border-white/5 ml-[52px]">
                      <div className="flex items-center gap-2">
                        <span className={`px-2.5 py-1 rounded-lg text-[8px] font-black uppercase tracking-wider border ${typeConfig.badge}`}>
                          {notification.type}
                        </span>
                        <div className="flex items-center gap-1.5">
                          <div className={`w-1.5 h-1.5 rounded-full ${priorityConfig.dot}`}></div>
                          <span className={`text-[8px] font-black uppercase tracking-wider ${priorityConfig.text}`}>
                            {notification.priority}
                          </span>
                        </div>
                      </div>
                      {notification.createdBy && (
                        <div className="flex items-center gap-1.5 bg-white/5 rounded-lg px-2 py-1">
                          <RiShieldUserLine className="text-[#FCE270]" size={10} />
                          <span className="text-[9px] font-black text-gray-400 uppercase tracking-tight">
                            {notification.createdBy.name}
                          </span>
                        </div>
                      )}
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
              <RiNotification3Line size={28} className="text-gray-600" />
            </div>
            <h4 className="text-lg font-black text-white uppercase tracking-tight mb-2">All Clear</h4>
            <p className="text-[10px] font-bold text-gray-600 uppercase tracking-widest max-w-[220px] mx-auto leading-relaxed">
              No active system broadcasts at this moment
            </p>
          </div>
        )}

        {/* INFO FOOTER */}
        <div className="relative overflow-hidden bg-[#FCE270] p-5 rounded-[24px] shadow-xl shadow-[#FCE270]/10">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-black/20 flex items-center justify-center flex-shrink-0">
              <FaCheckCircle className="text-black" size={18} />
            </div>
            <div>
              <h4 className="text-[11px] font-black text-black uppercase tracking-wider mb-1.5">Broadcast Protocol</h4>
              <p className="text-[10px] font-black text-black/60 leading-relaxed">
                Stay informed about critical network updates, tier advancements, and marketplace events in real-time.
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Notifications;