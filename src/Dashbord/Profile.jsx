import React, { useState, useEffect } from 'react';
import {
  FaUser, FaWallet, FaEnvelope, FaPhone, FaRocket, FaGlobe,
  FaShieldAlt, FaCopy, FaEdit, FaChevronLeft, FaCrown,
  FaBell, FaHeadset, FaSignOutAlt, FaChevronRight, FaFingerprint,
  FaCheckCircle, FaStar, FaGem
} from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { userAPI, walletAPI, packageAPI } from '../services/api';
import useAuthCheck from '../utils/useAuthCheck';
import Swal from 'sweetalert2';

const Profile = ({ onBack }) => {
  const token = useAuthCheck();
  const navigate = useNavigate();
  const [user, setUser] = useState({});
  const [balance, setBalance] = useState(0);
  const [currentPackage, setCurrentPackage] = useState('basic');
  const [loading, setLoading] = useState(true);
  const [editOpen, setEditOpen] = useState(false);
  const [editForm, setEditForm] = useState({ name: '', mobile: '', country: '' });
  const [saving, setSaving] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const [isPulling, setIsPulling] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  if (!token) return null;

  useEffect(() => {
    fetchProfile();
    const handlePackageUpdate = (event) => {
      setCurrentPackage(event.detail.package);
    };
    window.addEventListener('packageUpdate', handlePackageUpdate);
    return () => window.removeEventListener('packageUpdate', handlePackageUpdate);
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
      await fetchProfile();
      setTimeout(() => {
        setRefreshing(false);
        setPullDistance(0);
      }, 500);
    } else {
      setPullDistance(0);
    }
    setIsPulling(false);
  };

  const openEdit = () => {
    setEditForm({ name: user.name || '', mobile: user.mobile || '', country: user.country || '' });
    setEditOpen(true);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await userAPI.updateProfile(editForm);
      setUser(prev => ({ ...prev, ...editForm }));
      setEditOpen(false);
      Swal.fire({ icon: 'success', title: 'Profile Updated!', showConfirmButton: false, timer: 1500, background: '#1A1A1A', color: '#FFFFFF', toast: true, position: 'top-end' });
    } catch {
      Swal.fire({ icon: 'error', title: 'Update Failed', showConfirmButton: false, timer: 1500, background: '#1A1A1A', color: '#FFFFFF', toast: true, position: 'top-end' });
    }
    setSaving(false);
  };

  const fetchProfile = async () => {
    try {
      const profileRes = await userAPI.getProfile();
      setUser(profileRes.data.user);
      const balanceRes = await walletAPI.getBalance();
      setBalance(balanceRes.data.balance);
      try {
        const packageRes = await packageAPI.getPlans();
        setCurrentPackage(packageRes.data.currentPlan || 'basic');
      } catch {
        setCurrentPackage(profileRes.data.user.currentPackage || profileRes.data.user.planType || 'basic');
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
    setLoading(false);
  };

  const copyToClipboard = (text, label) => {
    navigator.clipboard.writeText(text);
    Swal.fire({
      icon: 'success', title: `${label} Copied!`, showConfirmButton: false, timer: 1500,
      background: '#1A1A1A', color: '#FFFFFF', toast: true, position: 'top-end'
    });
  };

  const getPackageColor = (pkg) => {
    const colors = {
      basic: '#FCE270',
      silver: '#C0C0C0',
      gold: '#FFD700',
      platinum: '#E5E4E2',
      diamond: '#B9F2FF',
      vip: '#FF6B6B'
    };
    return colors[pkg?.toLowerCase()] || '#FCE270';
  };

  const getPackageIcon = (pkg) => {
    const icons = {
      basic: <FaStar />,
      silver: <FaGem />,
      gold: <FaCrown />,
      platinum: <FaCrown />,
      diamond: <FaGem />,
      vip: <FaCrown />
    };
    return icons[pkg?.toLowerCase()] || <FaStar />;
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-[#0A0A0A] flex flex-col items-center justify-center gap-4 z-50">
        <div className="relative">
          <div className="w-16 h-16 rounded-2xl bg-[#FCE270]/10 flex items-center justify-center animate-pulse">
            <FaUser className="text-[#FCE270] text-2xl" />
          </div>
          <div className="absolute -top-2 -right-2 w-5 h-5 bg-[#FCE270] rounded-full animate-bounce"></div>
        </div>
        <div className="flex flex-col items-center gap-2">
          <div className="w-32 h-3 bg-white/10 rounded-full animate-pulse"></div>
          <div className="w-20 h-2 bg-white/5 rounded-full animate-pulse"></div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen bg-[#0A0A0A] max-w-md mx-auto relative overflow-hidden"
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
          <div className={`w-8 h-8 rounded-full border-2 border-[#FCE270] flex items-center justify-center bg-[#1A1A1A] ${refreshing ? 'animate-spin' : ''}`}
            style={{ transform: `rotate(${pullDistance * 3}deg)` }}
          >
            <FaRocket className="text-[#FCE270] text-xs" />
          </div>
        </div>
      )}

      {/* REFRESHING OVERLAY */}
      {refreshing && (
        <div className="fixed top-14 left-0 right-0 flex justify-center z-50 animate-fadeIn">
          <div className="bg-[#1A1A1A] border border-white/10 rounded-full px-4 py-1.5 flex items-center gap-2 shadow-2xl">
            <div className="w-3 h-3 border-2 border-[#FCE270] border-t-transparent rounded-full animate-spin"></div>
            <span className="text-[11px] text-gray-400 font-bold">Refreshing...</span>
          </div>
        </div>
      )}

      {/* HEADER */}


      {/* CONTENT */}
      <div className="px-4 pb-28 space-y-5">

        {/* PROFILE CARD - PREMIUM */}
        <div className="relative overflow-hidden bg-gradient-to-br from-[#1A1A1A] to-[#151515] p-5 rounded-3xl border border-white/5 shadow-2xl mt-3">
          <div className="absolute top-0 right-0 w-40 h-40 bg-[#FCE270]/5 rounded-full -mr-20 -mt-20 blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-28 h-28 bg-[#FCE270]/3 rounded-full -ml-14 -mb-14 blur-2xl"></div>

          <div className="flex items-center gap-4 relative z-10">
            <div className="relative">
              <div className="w-[70px] h-[70px] bg-gradient-to-br from-[#FCE270] via-[#f7d64a] to-[#e6b800] rounded-2xl flex items-center justify-center text-3xl font-black text-black shadow-2xl shadow-[#FCE270]/20">
                {user.name?.charAt(0)?.toUpperCase() || 'U'}
              </div>
              <div className="absolute -bottom-1.5 -right-1.5 w-6 h-6 bg-green-500 rounded-full border-[3px] border-[#151515] flex items-center justify-center">
                <FaCheckCircle className="text-white" size={10} />
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-xl font-black text-white tracking-tight truncate">{user.name || 'User'}</h3>
              <div className="flex items-center gap-2 mt-0.5">
                <div className={`w-1.5 h-1.5 rounded-full ${user.isActive ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]' : 'bg-red-500'}`}></div>
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                  {user.isActive ? 'Verified Account' : 'Inactive Account'}
                </p>
              </div>
            </div>
            <button
              onClick={openEdit}
              className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center active:scale-90 transition-all hover:bg-white/10 border border-white/5"
            >
              <FaEdit className="text-[#FCE270]" size={15} />
            </button>
          </div>

          {/* MEMBERSHIP BADGE */}
          <div className="mt-4 flex items-center gap-2 bg-white/[0.03] rounded-xl px-3 py-2 border border-white/5">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${getPackageColor(currentPackage)}15` }}>
              {React.cloneElement(getPackageIcon(currentPackage), {
                size: 14,
                style: { color: getPackageColor(currentPackage) }
              })}
            </div>
            <div className="flex-1">
              <p className="text-[9px] text-gray-500 font-black uppercase tracking-widest">Membership</p>
              <p className="text-[13px] font-black text-white uppercase">{currentPackage}</p>
            </div>
            <FaChevronRight className="text-gray-600" size={12} />
          </div>
        </div>

        {/* BALANCE CARDS */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-gradient-to-br from-[#1A1A1A] to-[#141414] p-4 rounded-2xl border border-white/5 text-center active:scale-[0.98] transition-all">
            <div className="w-10 h-10 rounded-xl bg-[#FCE270]/10 flex items-center justify-center mx-auto mb-3">
              <FaWallet className="text-[#FCE270]" size={18} />
            </div>
            <p className="text-[9px] text-gray-500 font-black uppercase tracking-widest mb-1">Balance</p>
            <p className="text-[22px] font-black text-white leading-none">
              ${Number(balance).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
            <p className="text-[10px] text-green-400 font-bold mt-1">+12.5%</p>
          </div>
          <div className="bg-gradient-to-br from-[#1A1A1A] to-[#141414] p-4 rounded-2xl border border-white/5 text-center active:scale-[0.98] transition-all">
            <div className="w-10 h-10 rounded-xl bg-[#FCE270]/10 flex items-center justify-center mx-auto mb-3">
              {React.cloneElement(getPackageIcon(currentPackage), {
                size: 18,
                style: { color: getPackageColor(currentPackage) }
              })}
            </div>
            <p className="text-[9px] text-gray-500 font-black uppercase tracking-widest mb-1">Plan</p>
            <p className="text-[16px] font-black text-white leading-none uppercase">{currentPackage}</p>
            <p className="text-[10px] text-[#FCE270] font-bold mt-1">Active</p>
          </div>
        </div>

        {/* ACTION BUTTONS */}
        <div className="grid grid-cols-3 gap-2.5">
          {[
            { icon: <FaWallet />, label: 'Deposit', color: '#4ADE80', path: '/dashbord/wallet' },
            { icon: <FaRocket />, label: 'Withdraw', color: '#F87171', path: '/dashbord/wallet' },
            { icon: <FaCrown />, label: 'Upgrade', color: '#FCE270', path: '/dashbord/package-upgrade' },
          ].map((btn, i) => (
            <button
              key={i}
              onClick={() => navigate(btn.path)}
              className="bg-[#1A1A1A] border border-white/5 rounded-xl py-3 flex flex-col items-center gap-1.5 active:scale-95 transition-all hover:border-white/10"
            >
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${btn.color}15` }}>
                {React.cloneElement(btn.icon, { size: 14, style: { color: btn.color } })}
              </div>
              <span className="text-[11px] text-gray-300 font-bold">{btn.label}</span>
            </button>
          ))}
        </div>

        {/* PERSONAL INFO */}
        <div className="bg-gradient-to-br from-[#1A1A1A] to-[#151515] rounded-2xl border border-white/5 overflow-hidden shadow-xl">
          <div className="px-4 py-3.5 border-b border-white/5 flex items-center gap-2">
            <FaShieldAlt className="text-[#FCE270]" size={13} />
            <h3 className="font-black text-[14px] text-white">Personal Details</h3>
            <span className="ml-auto text-[9px] bg-white/5 px-2 py-0.5 rounded-md text-white font-bold uppercase">Secure</span>
          </div>

          <div className="divide-y divide-white/5">
            {[
              { icon: <FaEnvelope />, label: 'Email', value: user.email, copyable: true },
              { icon: <FaPhone />, label: 'Mobile', value: user.mobile || 'Not Added', copyable: true },
              { icon: <FaGlobe />, label: 'Country', value: user.country || 'Global' },
              { icon: <FaWallet />, label: 'Wallet', value: user.walletAddress, truncate: true, copyable: true },
              { icon: <FaUser />, label: 'Referral Code', value: user.referralCode, copyable: true },

            ].map((item, idx) => (
              <div key={idx} className="flex items-center justify-between py-3 px-4 active:bg-white/[0.02] transition-all">
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-gray-500 flex-shrink-0">
                    {React.cloneElement(item.icon, { size: 13 })}
                  </div>
                  <div className="min-w-0">
                    <p className="text-[9px] text-white font-black uppercase tracking-widest">{item.label}</p>
                    <p className={`text-[13px] font-bold text-gray-200 ${item.truncate ? 'truncate max-w-[120px]' : ''}`}>
                      {item.value || '---'}
                    </p>
                  </div>
                </div>
                {item.copyable && (
                  <button
                    onClick={() => copyToClipboard(item.value, item.label)}
                    className="p-2 text-gray-600 hover:text-[#FCE270] active:scale-75 transition-all flex-shrink-0"
                  >
                    <FaCopy size={12} />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* SETTINGS */}
        <div className="bg-gradient-to-br from-[#1A1A1A] to-[#151515] rounded-2xl border border-white/5 overflow-hidden shadow-xl">
          <div className="px-4 py-3.5 border-b border-white/5">
            <h3 className="font-black text-[14px] text-white">Settings</h3>
          </div>
          {[
            { icon: <FaBell />, label: 'Notifications', right: 'On', onClick: () => navigate('/dashbord/notifications') },
            { icon: <FaFingerprint />, label: 'Change Password', right: <FaChevronRight size={12} />, onClick: () => navigate('/dashbord/change-password') },
            { icon: <FaHeadset />, label: 'Help & Support', right: <FaChevronRight size={12} />, onClick: () => navigate('/dashbord/contact-us') },
            { icon: <FaSignOutAlt />, label: 'Logout', right: <FaChevronRight size={12} />, danger: true, onClick: () => { localStorage.clear(); navigate('/Login'); } },
          ].map((item, i) => (
            <div key={i} onClick={item.onClick} className="flex items-center justify-between py-3 px-4 active:bg-white/[0.02] transition-all border-b border-white/5 last:border-0 cursor-pointer">
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${item.danger ? 'bg-red-500/10 text-red-400' : 'bg-white/5 text-gray-400'}`}>
                  {React.cloneElement(item.icon, { size: 13 })}
                </div>
                <span className={`text-[13px] font-bold ${item.danger ? 'text-red-400' : 'text-gray-200'}`}>{item.label}</span>
              </div>
              <span className="text-[11px] text-gray-500 font-bold">{item.right}</span>
            </div>
          ))}
        </div>

      </div>

      {/* EDIT PROFILE BOTTOM SHEET */}
      {editOpen && (
        <div className="fixed inset-0 z-50 flex items-end bg-black/70" onClick={() => setEditOpen(false)}>
          <div
            className="bg-[#1A1A1A] rounded-t-3xl border border-white/10 p-6 w-full max-w-md mx-auto shadow-2xl animate-slideUp"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Handle Bar */}
            <div className="w-10 h-1 bg-white/20 rounded-full mx-auto mb-5"></div>

            <h3 className="text-white font-black text-lg mb-5">Edit Profile</h3>
            <form onSubmit={handleUpdate} className="space-y-4">
              <div>
                <label className="text-[10px] text-gray-500 font-black uppercase tracking-widest">Name</label>
                <input
                  value={editForm.name}
                  onChange={e => setEditForm(p => ({ ...p, name: e.target.value }))}
                  className="w-full mt-1 bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-[#FCE270]/50 transition-all"
                  placeholder="Enter your name"
                />
              </div>
              <div>
                <label className="text-[10px] text-gray-500 font-black uppercase tracking-widest">Mobile</label>
                <input
                  value={editForm.mobile}
                  onChange={e => setEditForm(p => ({ ...p, mobile: e.target.value }))}
                  className="w-full mt-1 bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-[#FCE270]/50 transition-all"
                  placeholder="Enter mobile number"
                />
              </div>
              <div>
                <label className="text-[10px] text-gray-500 font-black uppercase tracking-widest">Country</label>
                <input
                  value={editForm.country}
                  onChange={e => setEditForm(p => ({ ...p, country: e.target.value }))}
                  className="w-full mt-1 bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-[#FCE270]/50 transition-all"
                  placeholder="Enter country"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setEditOpen(false)}
                  className="flex-1 py-3 rounded-xl border border-white/10 text-gray-400 text-sm font-bold hover:bg-white/5 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 py-3 rounded-xl bg-[#FCE270] text-black text-sm font-black hover:bg-[#f7d64a] transition-all disabled:opacity-60 active:scale-95"
                >
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;