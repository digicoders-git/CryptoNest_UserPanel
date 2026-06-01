import React, { useState, useEffect } from "react";
import { NavLink, Outlet, useNavigate, useLocation } from "react-router-dom";
import Swal from "sweetalert2";
import {
  FaUsers,
  FaWallet,
  FaHistory,
  FaUser,
  FaImage,
  FaBars,
  FaCog,
  FaSignOutAlt,
  FaChartBar,
  FaEnvelope,
  FaLock,
  FaShoppingCart,
  FaBell,
  FaTimes,
} from "react-icons/fa";
import { MdDashboard, MdOutlineToken, MdOutlineSell, MdUpgrade } from "react-icons/md";
import {
  RiDashboardLine,
  RiHistoryLine,
  RiNftFill,
  RiShieldKeyholeLine,
  RiTeamLine,
  RiStore3Line,
  RiNotification3Line
} from "react-icons/ri";
import { FiShoppingBag, FiArrowUpCircle, FiHeadphones } from "react-icons/fi";
import { HiOutlineUsers, HiOutlineLockClosed } from "react-icons/hi";
import { requestNotificationPermission, onForegroundMessage } from "../services/firebaseService";

export default function MainDashBord() {
  const [showMenu, setShowMenu] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const fetchNotification = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/notifications/active`);
        const result = await response.json();

        if (result.success && result.data && result.data.length > 0) {
          const notification = result.data[0];

          // Directly render ReactQuill rich text HTML output
          const htmlContent = notification.message;

          setTimeout(() => {
            Swal.fire({
              title: `<strong style="color: #FCE270; font-size: 18px;">${notification.title}</strong>`,
              html: `<div class="rich-text-content" style="text-align: left; line-height: 1.6; padding: 10px; color: #E5E7EB; font-size: 14px;">${htmlContent}</div>`,
              background: "#1A1A1A",
              color: "#FFFFFF",
              confirmButtonColor: "#FCE270",
              confirmButtonText: "<span style='color: black; font-weight: bold;'>Got it, Thanks!</span>",
              width: window.innerWidth < 640 ? "92%" : "450px",
              customClass: {
                popup: "rounded-3xl border border-[#FCE270]/20",
              }
            });
          }, 800);
        }
      } catch (error) {
        console.error('Failed to fetch notification:', error);
      }
    };

    fetchNotification();
  }, []);

  // ✅ Register for Push Notifications and Handle Foreground Messages
  useEffect(() => {
    // Request permission and save token to backend
    const setupNotifications = async () => {
      const token = await requestNotificationPermission();
      if (token) {
        console.log("Push notifications registered successfully");
      }
    };

    setupNotifications();

    // Handle foreground notifications with a nice Swal toast
    const unsubscribe = onForegroundMessage((payload) => {
      const title = payload?.notification?.title || '🔔 New Notification';
      const body = payload?.notification?.body || '';

      Swal.fire({
        title: title,
        text: body,
        icon: 'info',
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 5000,
        timerProgressBar: true,
        background: '#1A1A1A',
        color: '#FCE270',
        iconColor: '#FCE270',
        didOpen: (toast) => {
          toast.addEventListener('mouseenter', Swal.stopTimer)
          toast.addEventListener('mouseleave', Swal.resumeTimer)
        }
      });
    });

    return () => unsubscribe && unsubscribe();
  }, []);

  const menuItems = [
    { to: "/dashbord/my-nfts", label: "CryptoNest Treasury", icon: <RiNftFill /> },
    { to: "/dashbord/history", label: "Transaction History", icon: <RiHistoryLine /> },

    // { to: "/dashbord/package-upgrade", label: "Upgrade Limit", icon: <MdUpgrade /> },
    { to: "/dashbord/nft-history", label: "CryptoNest History", icon: <RiHistoryLine /> },
    // { to: "/dashbord/mlm-tree", label: "Alliance Matrix", icon: <HiOutlineUsers /> },
    { to: "/dashbord/my-sold-nfts", label: "Sale Crypto", icon: <MdOutlineSell /> },
    { to: "/dashbord/notifications", label: "CryptoNest Alerts", icon: <RiNotification3Line /> },
    { to: "/dashbord/contact-us", label: "Support Concierge", icon: <FiHeadphones /> },

    { to: "/dashbord/change-password", label: "Access Security", icon: <HiOutlineLockClosed /> },
  ];

  const bottomNavItems = [
    { to: "/dashbord/nft-marketplace", label: "Exchange", icon: <RiStore3Line size={20} /> },
    { to: "/dashbord/wallet", label: "Ledger", icon: <FaWallet size={20} /> },
    { to: "/dashbord", label: "Console", icon: <MdDashboard size={24} />, exact: true },
    { to: "/dashbord/my-team", label: "Refer", icon: <RiTeamLine size={20} /> },
    { to: "/dashbord/profile", label: "Profile", icon: <FaUser size={20} /> },
  ];

  const allItems = [...menuItems, ...bottomNavItems];
  const currentPage =
    (location.pathname === "/dashbord"
      ? "Console"
      : allItems.find((item) => item.to === location.pathname)?.label) || "Dashboard";

  return (
    <div className="flex flex-col h-screen bg-black max-w-md mx-auto relative font-sans overflow-hidden">
      {/* ===== HEADER ===== */}
      <header className="sticky top-0 z-30 bg-black/80 backdrop-blur-md border-b border-[#FCE270]/10 px-5 py-4 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setShowMenu(true)}
            className="p-2 rounded-xl bg-[#1A1A1A] text-[#FCE270] active:scale-90 transition shadow-lg"
          >
            <FaBars size={18} />
          </button>
          <h1 className="font-bold text-[15px] text-white tracking-tight">{currentPage}</h1>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("/dashbord/notifications")}
            className="p-2.5 rounded-xl bg-[#1A1A1A] text-gray-400 active:scale-90 transition relative"
          >
            <FaBell size={18} />
            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border border-black"></span>
          </button>

          <div
            onClick={() => navigate("/dashbord/profile")}
            className="w-15 h-15 rounded-xl flex items-center justify-center active:scale-90 transition-all cursor-pointer p-1.5"
          >
            <img src="/Nextlogo-removebg-preview.png" alt="Profile" className="w-full h-full object-contain" />
          </div>
        </div>
      </header>

      {/* ===== CONTENT ===== */}
      <main className="flex-1 overflow-y-auto  bg-black">
        <Outlet />
      </main>

      {/* ===== BOTTOM NAV ===== */}
      <nav
        className="fixed left-1/2 -translate-x-1/2 w-[96%] max-w-[420px] bg-[#121212]/95 backdrop-blur-2xl border border-white/5 shadow-[0_20px_50px_rgba(0,0,0,0.5)] rounded-[28px] px-2 py-2 z-40"
        style={{ bottom: 'calc(12px + env(safe-area-inset-bottom, 0px))' }}
      >
        <div className="flex justify-around items-center">
          {bottomNavItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.exact}
              className={({ isActive }) =>
                `relative flex flex-col items-center justify-center min-w-[64px] py-2 px-1 rounded-2xl transition-all duration-300 ease-out
                ${isActive
                  ? "text-[#FCE270] scale-105"
                  : "text-gray-400 active:bg-white/5"
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <div className={`transition-transform duration-300 ${isActive ? "scale-110 -translate-y-0.5" : ""}`}>
                    {React.cloneElement(item.icon, { size: 24 })}
                  </div>
                  <span className={`text-[10px] mt-1.5 font-bold uppercase tracking-[0.05em] transition-all duration-300 ${isActive ? "opacity-100" : "opacity-70"}`}>
                    {item.label}
                  </span>
                </>
              )}
            </NavLink>
          ))}
        </div>
      </nav>

      {/* ===== SIDE DRAWER ===== */}
      {showMenu && (
        <div className="fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm transition-opacity" onClick={() => setShowMenu(false)} />

          <aside className="relative w-80 bg-[#0A0A0A] h-full flex flex-col border-r border-[#FCE270]/10 shadow-2xl animate-slide-in">
            <div className="p-7 flex justify-between items-center border-b border-[#FCE270]/5">
              <div className="flex items-center gap-3">
                <img
                  src="/Nextlogo-removebg-preview.png"
                  alt="Logo"
                  className="w-10 h-10 object-contain"
                />
                <h3 className="font-bold text-lg text-white">CryptoNest</h3>
              </div>
              <button
                onClick={() => setShowMenu(false)}
                className="p-2 bg-[#1A1A1A] rounded-lg text-gray-400 hover:text-white transition"
              >
                <FaTimes />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-5 space-y-1 custom-scrollbar">
              {menuItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={() => setShowMenu(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-4 px-4 py-4 rounded-2xl transition-all duration-200
                    ${isActive
                      ? "bg-[#FCE270]/10 text-[#FCE270] font-bold border border-[#FCE270]/20"
                      : "text-gray-400 hover:bg-[#1A1A1A] hover:text-white"
                    }`
                  }
                >
                  <span className="text-lg opacity-80">{item.icon}</span>
                  <span className="text-[15px]">{item.label}</span>
                </NavLink>
              ))}
            </div>

            <div className="p-6 border-t border-[#FCE270]/5">
              <button
                onClick={() => {
                  localStorage.clear();
                  navigate("/login");
                }}
                className="w-full flex items-center justify-center gap-3 px-4 py-4 bg-red-500/10 text-red-500 font-bold rounded-2xl hover:bg-red-500 hover:text-white transition-all duration-300"
              >
                <FaSignOutAlt />
                Logout Account
              </button>
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}

