import React, { useState } from 'react';
import {
  FaLock, FaEye, FaEyeSlash, FaChevronLeft, FaShieldAlt,
  FaCheckCircle, FaTimesCircle, FaExclamationTriangle,
  FaHistory, FaFingerprint, FaKey, FaUserShield,
} from 'react-icons/fa';
import {
  RiLockPasswordLine, RiShieldKeyholeLine, RiEyeLine,
  RiEyeOffLine, RiShieldCheckLine, RiShieldStarLine,
  RiShieldFlashLine, RiCheckLine, RiCloseLine,
  RiInformationLine, RiAlertLine, RiSecurePaymentLine,
} from 'react-icons/ri';
import axios from 'axios';
import Swal from 'sweetalert2';
import useAuthCheck from '../utils/useAuthCheck';

const ChangePassword = ({ onBack }) => {
  const token = useAuthCheck();
  const [newPassword, setNewPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  if (!token) return null;

  // 🔐 PASSWORD STRENGTH CHECKER
  const checkPasswordStrength = (password) => {
    if (!password) return { score: 0, label: '', color: '', checks: {} };

    const checks = {
      minLength: password.length >= 8,
      hasUpperCase: /[A-Z]/.test(password),
      hasLowerCase: /[a-z]/.test(password),
      hasNumber: /\d/.test(password),
      hasSpecial: /[!@#$%^&*(),.?":{}|<>]/.test(password),
      noSpaces: !/\s/.test(password),
    };

    const passedChecks = Object.values(checks).filter(Boolean).length;

    let score, label, color;
    if (passedChecks <= 2) {
      score = 1;
      label = 'Weak';
      color = 'text-red-400';
    } else if (passedChecks <= 4) {
      score = 2;
      label = 'Medium';
      color = 'text-yellow-400';
    } else if (passedChecks <= 5) {
      score = 3;
      label = 'Strong';
      color = 'text-green-400';
    } else {
      score = 4;
      label = 'Very Strong';
      color = 'text-[#FCE270]';
    }

    return { score, label, color, checks };
  };

  const passwordStrength = checkPasswordStrength(newPassword);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!newPassword) {
      Swal.fire({
        icon: "warning",
        title: "Missing Password",
        text: "Please enter a new password",
        background: '#1A1A1A',
        color: '#fff',
        confirmButtonColor: "#FCE270",
        confirmButtonText: '<span style="color: #000; font-weight: 900;">OK</span>',
      });
      return;
    }

    if (passwordStrength.score < 3) {
      const result = await Swal.fire({
        icon: "warning",
        title: "Weak Password",
        text: "Your password is weak. Are you sure you want to continue?",
        background: '#1A1A1A',
        color: '#fff',
        confirmButtonColor: "#FCE270",
        cancelButtonColor: '#333',
        showCancelButton: true,
        confirmButtonText: '<span style="color: #000; font-weight: 900;">CONTINUE</span>',
        cancelButtonText: '<span style="color: #fff; font-weight: 900;">CANCEL</span>',
      });
      if (!result.isConfirmed) return;
    }

    setLoading(true);

    try {
      const response = await axios.post(
        'https://api.gtnworld.live/api/user/change-password',
        { newPassword },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data.success) {
        Swal.fire({
          icon: "success",
          title: "Success! 🔐",
          html: `
            <div style="text-align: center; font-family: sans-serif;">
              <p style="color: #fff; font-weight: 900; margin-bottom: 15px;">${response.data.message || "Password changed successfully"}</p>
              <div style="background: #252525; padding: 12px; border-radius: 12px; border: 1px solid rgba(255,255,255,0.05);">
                <p style="font-size: 10px; color: #888; font-weight: 900; text-transform: uppercase; margin: 0;">🔒 Your account is now secured with a new password</p>
              </div>
            </div>
          `,
          background: '#1A1A1A',
          color: '#fff',
          confirmButtonColor: "#FCE270",
          confirmButtonText: '<span style="color: #000; font-weight: 900;">GREAT</span>',
        });
        setNewPassword('');
      }
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Update Failed",
        text: error.response?.data?.message || 'Failed to change password',
        background: '#1A1A1A',
        color: '#fff',
        confirmButtonColor: "#FCE270",
        confirmButtonText: '<span style="color: #000; font-weight: 900;">TRY AGAIN</span>',
      });
    } finally {
      setLoading(false);
    }
  };

  // Strength bar width
  const strengthBarWidth = passwordStrength.score === 0 ? 0 : (passwordStrength.score / 4) * 100;
  const strengthBarColor = passwordStrength.score === 1 ? 'bg-red-500' :
    passwordStrength.score === 2 ? 'bg-yellow-500' :
      passwordStrength.score === 3 ? 'bg-green-500' : 'bg-[#FCE270]';

  return (
    <div className="min-h-screen bg-[#0A0A0A] max-w-md mx-auto relative pt-2">

      {/* STICKY HEADER */}


      {/* CONTENT */}
      <div className="px-4 pb-28 space-y-4">

        {/* SECURITY STATUS CARD */}
        <div className="relative overflow-hidden bg-gradient-to-br from-[#1A1A1A] via-[#161616] to-[#111111] p-6 rounded-[28px] border border-white/5 shadow-2xl mt-3 text-center">
          <div className="absolute top-0 right-0 w-40 h-40 bg-[#FCE270]/5 rounded-full -mr-20 -mt-20 blur-3xl"></div>

          <div className="relative z-10">
            <div className="w-20 h-20 rounded-3xl bg-[#FCE270]/10 border border-[#FCE270]/20 flex items-center justify-center mx-auto mb-4 shadow-2xl relative">
              <RiShieldStarLine className="text-[#FCE270] text-4xl" />
              <div className="absolute -bottom-1 -right-1 w-7 h-7 bg-green-500 rounded-full flex items-center justify-center border-2 border-[#151515]">
                <RiCheckLine className="text-white" size={14} />
              </div>
            </div>
            <h3 className="text-xl font-black text-white mb-1">Account Protected</h3>
            <p className="text-[11px] font-bold text-gray-400">Update your credentials regularly</p>
          </div>
        </div>

        {/* PASSWORD FORM */}
        <div className="relative overflow-hidden bg-gradient-to-br from-[#1A1A1A] via-[#161616] to-[#111111] rounded-[24px] border border-white/5 shadow-xl">
          <div className="absolute top-0 right-0 w-28 h-28 bg-[#FCE270]/3 rounded-full -mr-14 -mt-14 blur-2xl"></div>

          <div className="relative z-10 p-5">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl bg-[#FCE270]/10 border border-[#FCE270]/20 flex items-center justify-center">
                <RiLockPasswordLine className="text-[#FCE270]" size={18} />
              </div>
              <div>
                <h3 className="font-black text-[14px] text-white">Set New Password</h3>
                <p className="text-[9px] text-gray-500 font-black uppercase tracking-wider">Choose a strong password</p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Password Input */}
              <div className="space-y-2">
                <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest flex items-center gap-1.5">
                  <FaKey size={10} className="text-gray-600" />
                  New Password
                </label>
                <div className="relative">
                  <FaLock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600 text-[14px]" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full bg-black/40 border border-white/5 rounded-xl py-3.5 pl-12 pr-12 text-sm text-white placeholder-gray-700 focus:border-[#FCE270]/30 focus:ring-0 transition-all outline-none font-mono tracking-wider"
                    placeholder="••••••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-[#FCE270] active:scale-75 transition-all"
                  >
                    {showPassword ? <RiEyeOffLine size={18} /> : <RiEyeLine size={18} />}
                  </button>
                </div>
              </div>

              {/* PASSWORD STRENGTH METER */}
              {newPassword && (
                <div className="space-y-3 animate-fadeIn">
                  {/* Strength Bar */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[9px] text-gray-500 font-black uppercase tracking-widest">Strength</span>
                      <span className={`text-[9px] font-black uppercase tracking-wider ${passwordStrength.color}`}>
                        {passwordStrength.label}
                      </span>
                    </div>
                    <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${strengthBarColor}`}
                        style={{ width: `${strengthBarWidth}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Checklist */}
                  <div className="bg-black/30 rounded-xl p-3.5 space-y-2 border border-white/5">
                    <p className="text-[8px] text-gray-500 font-black uppercase tracking-widest mb-2">Requirements</p>
                    {[
                      { key: 'minLength', label: 'At least 8 characters' },
                      { key: 'hasUpperCase', label: 'One uppercase letter' },
                      { key: 'hasLowerCase', label: 'One lowercase letter' },
                      { key: 'hasNumber', label: 'At least one number' },
                      { key: 'hasSpecial', label: 'One special character' },
                      { key: 'noSpaces', label: 'No spaces' },
                    ].map((item) => (
                      <div key={item.key} className="flex items-center gap-2">
                        {passwordStrength.checks[item.key] ? (
                          <RiCheckLine className="text-green-400 flex-shrink-0" size={12} />
                        ) : (
                          <RiCloseLine className="text-gray-600 flex-shrink-0" size={12} />
                        )}
                        <span className={`text-[10px] font-bold ${passwordStrength.checks[item.key] ? 'text-green-400' : 'text-gray-600'
                          }`}>
                          {item.label}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className={`w-full h-13 rounded-2xl font-black text-[12px] uppercase tracking-widest active:scale-95 transition-all shadow-lg flex items-center justify-center gap-2 ${loading
                  ? 'bg-white/10 text-gray-500 cursor-not-allowed'
                  : 'bg-[#FCE270] text-black hover:bg-[#f7d64a] shadow-[#FCE270]/20'
                  }`}
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-gray-500 border-t-transparent"></div>
                    <span>Updating...</span>
                  </>
                ) : (
                  <>
                    <RiSecurePaymentLine size={18} />
                    <span>Update Password</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* SECURITY TIPS */}
        <div className="relative overflow-hidden bg-gradient-to-br from-[#1A1A1A] to-[#151515] rounded-2xl border border-white/5 p-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#FCE270]/10 border border-[#FCE270]/20 flex items-center justify-center flex-shrink-0">
              <RiShieldFlashLine className="text-[#FCE270]" size={18} />
            </div>
            <div className="space-y-2">
              <p className="text-[11px] font-black text-white uppercase tracking-wider">Security Tips</p>
              <ul className="space-y-1.5">
                {[
                  'Use a unique password not used elsewhere',
                  'Combine letters, numbers & symbols',
                  'Never share your password with anyone',
                  'Change your password every 90 days',
                ].map((tip, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <div className="w-1 h-1 rounded-full bg-[#FCE270]/40 mt-1.5 flex-shrink-0"></div>
                    <span className="text-[10px] text-gray-400 font-bold leading-relaxed">{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* LAST UPDATED INFO */}
        <div className="flex items-center justify-center gap-2 text-[9px] text-gray-600 font-black uppercase tracking-widest">
          <FaHistory size={10} />
          <span>Last password change: Not available</span>
        </div>

      </div>
    </div>
  );
};

export default ChangePassword;