import React, { useState, useEffect } from "react";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import Swal from "sweetalert2";
import {
  FaRegCopy, FaWallet, FaEthereum, FaMobile, FaChevronLeft,
  FaCheckCircle, FaShieldAlt, FaLock, FaUser, FaEnvelope,
  FaPhone, FaKey, FaCrown, FaGem, FaStar,
} from "react-icons/fa";
import {
  RiShieldCheckLine, RiCheckDoubleLine, RiCheckLine,
  RiWallet3Line, RiUserLine, RiMailLine, RiPhoneLine,
  RiLockPasswordLine, RiEyeLine, RiEyeOffLine,
  RiArrowLeftSLine, RiVipCrownLine, RiSparklingLine,
} from "react-icons/ri";
import { useNavigate } from "react-router-dom";
import { authAPI, walletAPI } from "../services/api";
import realWalletService from "../services/realWalletService";
import walletDebug from "../utils/walletDebug";
import networkChecker from "../utils/networkChecker";
import TrustWalletHelper from "../Componect/TrustWalletHelper";
import "../styles/modal-fix.css";
import { useLocation } from "react-router-dom";
import { parsePhoneNumberFromString } from "libphonenumber-js";

const Signup = () => {
  const [isReferralLocked, setIsReferralLocked] = useState(false);
  const [step, setStep] = useState(1);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const ref = params.get("ref");

    if (ref) {
      setFormData((prev) => ({
        ...prev,
        referralCode: ref,
      }));
      setIsReferralLocked(true);
    }
  }, [location]);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    mobile: "",
    country: "",
    password: "",
    confirmPassword: "",
    referralCode: "",
    selectedPlan: "basic",
    paymentMethod: "usdt",
  });
  const [referralStatus, setReferralStatus] = useState({ checking: false, valid: null, message: '', referrerName: '' });
  const [connectedWallet, setConnectedWallet] = useState(null);
  const [loading, setLoading] = useState(false);
  const [emailStatus, setEmailStatus] = useState({
    checking: false,
    exists: false,
    message: "",
  });
  const [mobileError, setMobileError] = useState("");
  const [mobileChecking, setMobileChecking] = useState(false);
  const [showAddMoneyButton, setShowAddMoneyButton] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    showOfficialNotice();
    walletDebug.logDebugInfo();
    networkChecker.logNetworkInfo();
  }, []);

  const validateReferralCode = async (code) => {
    if (!code) return true; // referral optional
    setReferralStatus({ checking: true, valid: null, message: 'Checking...', referrerName: '' });
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/validate-referral`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ referralCode: code })
      });
      const data = await response.json();
      if (data.valid) {
        setReferralStatus({ checking: false, valid: true, message: `Valid! Referred by ${data.referrer?.name || ''}`, referrerName: data.referrer?.name || '' });
        return true;
      } else {
        setReferralStatus({ checking: false, valid: false, message: data.message || 'Invalid referral code', referrerName: '' });
        return false;
      }
    } catch {
      setReferralStatus({ checking: false, valid: false, message: 'Could not verify code', referrerName: '' });
      return false;
    }
  };

  const handleStep1Continue = async () => {
    if (!formData.name || !formData.email || !formData.mobile) {
      Swal.fire({ icon: 'warning', title: '<span style="color:#fff">Missing Fields</span>', text: 'Please fill all required fields', background: '#111111', confirmButtonColor: '#FCE270', confirmButtonText: '<span style="color:black;font-weight:900;">OK</span>', customClass: { popup: 'rounded-[32px] border border-white/5' } });
      return;
    }
    if (!validateEmail(formData.email)) {
      Swal.fire({ icon: 'error', title: '<span style="color:#fff">Invalid Email</span>', text: 'Please enter a valid email address (e.g. user@example.com)', background: '#111111', confirmButtonColor: '#FCE270', confirmButtonText: '<span style="color:black;font-weight:900;">OK</span>', customClass: { popup: 'rounded-[32px] border border-white/5' } });
      return;
    }
    if (!formData.referralCode) {
      Swal.fire({ icon: 'warning', title: '<span style="color:#fff">Referral Required</span>', text: 'Please enter a referral code to continue', background: '#111111', confirmButtonColor: '#FCE270', confirmButtonText: '<span style="color:black;font-weight:900;">OK</span>', customClass: { popup: 'rounded-[32px] border border-white/5' } });
      return;
    }
    const isValid = await validateReferralCode(formData.referralCode);
    if (!isValid) return;
    setStep(2);
  };

  const checkEmailExists = async (email) => {
    if (!email || !email.includes("@")) {
      setEmailStatus({ checking: false, exists: false, message: "" });
      return;
    }
    setEmailStatus({ checking: true, exists: false, message: "Checking..." });
    try {
      const response = await authAPI.checkEmail(email);
      if (response.data.exists) {
        setEmailStatus({ checking: false, exists: true, message: "Email already registered" });
      } else {
        setEmailStatus({ checking: false, exists: false, message: "Email available" });
      }
    } catch (error) {
      setEmailStatus({ checking: false, exists: false, message: "" });
    }
  };

  React.useEffect(() => {
    const timer = setTimeout(() => {
      if (formData.email) checkEmailExists(formData.email);
    }, 500);
    return () => clearTimeout(timer);
  }, [formData.email]);

  const [emailError, setEmailError] = useState("");

  const validateEmail = (email) => {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "email") {
      if (value && !validateEmail(value)) {
        setEmailError("Invalid email format");
      } else {
        setEmailError("");
      }
    }
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const connectWallet = async () => {
    try {
      setLoading(true);
      const debugInfo = await walletDebug.logDebugInfo();

      if (!walletDebug.isWalletInstalled()) {
        const browserInfo = walletDebug.getBrowserInfo();
        Swal.fire({
          icon: "warning",
          title: `<span style="color: #fff">No Wallet Found</span>`,
          background: '#111111',
          html: `
            <div class="text-left" style="color: #ccc; font-family: sans-serif;">
              <p style="font-size: 13px; line-height: 1.5;">No cryptocurrency wallet detected on your ${browserInfo.isMobile ? "mobile device" : "browser"}.</p>
              <div style="margin-top: 15px; padding: 15px; background: #000; border-radius: 16px; border: 1px solid rgba(255,255,255,0.05);">
                <p style="font-size: 11px; font-weight: 800; color: #fff; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 8px;">Recommended Access:</p>
                <ul style="list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 8px;">
                  ${browserInfo.isMobile
              ? `
                    <li><a href="https://metamask.app.link/dapp/${window.location.host}" target="_blank" style="color: #FCE270; text-decoration: none; font-size: 12px; font-weight: 700;">• Open MetaMask Browser</a></li>
                    <li><a href="https://link.trustwallet.com/open_url?coin_id=60&url=${encodeURIComponent(window.location.href)}" target="_blank" style="color: #FCE270; text-decoration: none; font-size: 12px; font-weight: 700;">• Open Trust Wallet Browser</a></li>
                  `
              : `
                    <li><a href="https://metamask.io/download/" target="_blank" style="color: #FCE270; text-decoration: none; font-size: 12px; font-weight: 700;">• Install MetaMask Extension</a></li>
                  `
            }
                </ul>
              </div>
            </div>
          `,
          confirmButtonColor: "#FCE270",
          confirmButtonText: `<span style="color: black; font-weight: 900; font-size: 10px; letter-spacing: 0.1em;">ACKNOWLEDGE</span>`,
          customClass: { popup: 'rounded-[32px] border border-white/5' }
        });
        setLoading(false);
        return;
      }

      Swal.fire({
        title: "Connecting Wallet...",
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading(),
      });

      const result = await realWalletService.connectWallet();
      if (result.success) {
        setConnectedWallet(result.account);
        Swal.close();
        Swal.fire({
          icon: "success",
          title: `<span style="color: #fff">Wallet Connected!</span>`,
          background: '#111111',
          confirmButtonColor: "#FCE270",
          confirmButtonText: `<span style="color: black">PROCEED</span>`,
          customClass: { popup: 'rounded-[32px] border border-white/5' }
        });
      } else {
        throw new Error(result.error || "Failed to connect wallet");
      }
    } catch (error) {
      console.error("Wallet connection error:", error);
      Swal.fire({
        icon: "error",
        title: "Connection Failed",
        text: error.message || "Failed to connect wallet. Please try again.",
        confirmButtonColor: "#0f7a4a",
        confirmButtonText: "Try Again",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchCurrentBNBPrice = async () => {
    try {
      const response = await fetch("https://api.binance.com/api/v3/ticker/price?symbol=BNBUSDT");
      const data = await response.json();
      return parseFloat(data.price);
    } catch (error) {
      try {
        const response = await fetch("https://api.coingecko.com/api/v3/simple/price?ids=binancecoin&vs_currencies=usd");
        const data = await response.json();
        return data.binancecoin.usd;
      } catch (fallbackError) {
        return 774;
      }
    }
  };

  const copyWallet = () => {
    if (connectedWallet) {
      navigator.clipboard.writeText(connectedWallet);
      Swal.fire({
        icon: "success",
        title: "Copied!",
        text: "Wallet address copied",
        timer: 1200,
        showConfirmButton: false,
      });
    }
  };

  const showOfficialNotice = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/notifications/active`);
      const result = await response.json();
      if (result.success && result.data && result.data.length > 0) {
        const notification = result.data[0];
        // Directly render ReactQuill rich text HTML output
        const htmlContent = notification.message;

        setTimeout(() => {
          Swal.fire({
            title: `<div style="display: flex; flex-direction: column; align-items: center; gap: 8px;">
                      <span style="color: #FCE270; font-size: 10px; font-weight: 900; text-transform: uppercase; letter-spacing: 0.2em;">Official Dispatch</span>
                      <strong style="color: #fff; font-size: 18px; font-weight: 900; letter-spacing: -0.01em;">${notification.title}</strong>
                    </div>`,
            html: `<div class="rich-text-content" style="text-align: left; line-height: 1.8; color: #E5E7EB; font-family: sans-serif; font-size: 13px; padding: 10px 5px;">${htmlContent}</div>`,
            background: "#111111",
            confirmButtonColor: "#FCE270",
            confirmButtonText: `<span style="color: black; font-weight: 900; font-size: 11px; letter-spacing: 0.1em;">ACKNOWLEDGE PROTOCOL</span>`,
            width: window.innerWidth < 640 ? "92%" : "500px",
            padding: "30px 20px",
            customClass: { popup: "rounded-[40px] border border-white/5 shadow-2xl" },
          });
        }, 500);
      }
    } catch (error) {
      console.error('❌ Failed to fetch notification:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (!connectedWallet) {
      Swal.fire({
        icon: "warning",
        title: `<span style="color: #fff">Wallet Required</span>`,
        text: "Please connect your crypto wallet first",
        background: '#111111',
        confirmButtonColor: "#FCE270",
        confirmButtonText: `<span style="color: black; font-weight: 900;">OK</span>`,
        customClass: { popup: 'rounded-[32px] border border-white/5' }
      });
      setLoading(false);
      return;
    }

    const phone = parsePhoneNumberFromString(`+${formData.mobile}`, formData.country);
    if (!phone || !phone.isValid()) {
      Swal.fire({
        icon: "error",
        title: `<span style="color: #fff">Invalid Mobile Number</span>`,
        text: "Please enter a valid mobile number",
        background: '#111111',
        confirmButtonColor: "#FCE270",
        confirmButtonText: `<span style="color: black; font-weight: 900;">OK</span>`,
        customClass: { popup: 'rounded-[32px] border border-white/5' }
      });
      setLoading(false);
      return;
    }

    if (emailStatus.exists) {
      Swal.fire({
        icon: "error",
        title: `<span style="color: #fff">Email Already Exists</span>`,
        text: "This email is already registered. Please use a different email.",
        background: '#111111',
        confirmButtonColor: "#FCE270",
        confirmButtonText: `<span style="color: black; font-weight: 900;">OK</span>`,
        customClass: { popup: 'rounded-[32px] border border-white/5' }
      });
      setLoading(false);
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      Swal.fire({
        icon: "error",
        title: `<span style="color: #fff">Password Mismatch</span>`,
        text: "Password and Confirm Password must match",
        background: '#111111',
        confirmButtonColor: "#FCE270",
        confirmButtonText: `<span style="color: black; font-weight: 900;">FIX ERROR</span>`,
        customClass: { popup: 'rounded-[32px] border border-white/5' }
      });
      setLoading(false);
      return;
    }

    const planAmount = formData.selectedPlan === "premium" ? 20 : 15;
    const paymentChoice = await Swal.fire({
      title: `<span style="color: #fff; font-family: sans-serif; font-weight: 900; letter-spacing: -0.02em;">Select Payment Method</span>`,
      background: '#111111',
      html: `
        <div style="text-align: left; font-family: sans-serif;">
          <div style="background: rgba(252,226,112,0.05); border: 1px solid rgba(252,226,112,0.1); padding: 16px; border-radius: 16px; margin-bottom: 20px;">
            <p style="color: #666; font-size: 10px; font-weight: 900; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 4px;">Transaction Detail</p>
            <div style="display: flex; justify-content: space-between; align-items: baseline;">
              <span style="color: #fff; font-size: 24px; font-weight: 900;">$${planAmount} USD</span>
              <span style="color: #FCE270; font-size: 10px; font-weight: 900; text-transform: uppercase;">${formData.selectedPlan} Plan</span>
            </div>
          </div>
          <p style="color: #666; font-size: 10px; font-weight: 900; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 12px; margin-left: 4px;">Choose Network</p>
          <div style="display: flex; flex-direction: column; gap: 10px;">
            <label style="display: flex; align-items: center; padding: 16px; background: #000; border: 1px solid rgba(255,255,255,0.05); border-radius: 16px; cursor: pointer;">
              <input type="radio" name="payment" value="usdt" checked style="accent-color: #FCE270; width: 18px; height: 18px; margin-right: 12px;">
              <div style="flex: 1;">
                <div style="color: #fff; font-size: 13px; font-weight: 800;">USDT (BEP-20)</div>
                <div style="color: #666; font-size: 10px; font-weight: 700; text-transform: uppercase;">Stable Protocol</div>
              </div>
              <div style="color: #FCE270; font-size: 12px; font-weight: 900;">BEST</div>
            </label>
            <label style="display: flex; align-items: center; padding: 16px; background: #000; border: 1px solid rgba(255,255,255,0.05); border-radius: 16px; cursor: pointer;">
              <input type="radio" name="payment" value="bnb" style="accent-color: #FCE270; width: 18px; height: 18px; margin-right: 12px;">
              <div style="flex: 1;">
                <div style="color: #fff; font-size: 13px; font-weight: 800;">BNB Native</div>
                <div style="color: #666; font-size: 10px; font-weight: 700; text-transform: uppercase;">Direct Asset Transfer</div>
              </div>
            </label>
          </div>
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: 'CONTINUE PROTOCOL',
      cancelButtonText: 'CANCEL',
      confirmButtonColor: "#FCE270",
      cancelButtonColor: "#1A1A1A",
      customClass: { popup: 'rounded-[32px] border border-white/5', confirmButton: 'rounded-xl font-black text-[10px] tracking-widest px-8 py-4 text-black', cancelButton: 'rounded-xl font-black text-[10px] tracking-widest px-8 py-4 text-gray-400' },
      preConfirm: () => {
        const selected = document.querySelector('input[name="payment"]:checked');
        return selected ? selected.value : "usdt";
      },
    });

    if (!paymentChoice.isConfirmed) {
      setLoading(false);
      return;
    }

    setTimeout(async () => {
      await handlePayment(paymentChoice.value);
    }, 500);
  };

  const checkBalanceAndAddMoney = async (registrationPaymentResult) => {
    try {
      await Swal.fire({
        icon: "success",
        title: `<span style="color: #fff">Registration Successful! 🎉</span>`,
        background: '#111111',
        html: `<div class="text-center" style="color: #ccc"><p>Account created successfully!</p><div class="mt-3 p-3 bg-black rounded-xl border border-white/5"><p class="text-xs text-[#FCE270]">PROTOCOL ACTIVE</p></div></div>`,
        confirmButtonColor: "#FCE270",
        confirmButtonText: `<span style="color: black">CONTINUE</span>`,
        customClass: { popup: 'rounded-[32px] border border-white/5' }
      });

      const balanceRes = await walletAPI.getBalance();
      const currentBalance = balanceRes.data.balance || 0;
      if (currentBalance >= 20) {
        navigate("/dashbord");
        return;
      }

      const popupResult = await Swal.fire({
        icon: "warning",
        title: "💰 Add $20 Trading Balance",
        html: `<div class="text-left space-y-3"><div class="bg-yellow-50 p-3 rounded-lg border border-yellow-200"><p class="text-yellow-800 font-semibold">⚠️ Trading Balance Required</p><p class="text-sm text-yellow-700 mt-1">Your current balance: <strong>$${currentBalance.toFixed(2)}</strong></p><p class="text-sm text-yellow-700">Required for trading: <strong>$20.00</strong></p></div><p class="text-sm text-gray-600">Add $20 to your account to start trading GTN Tokens.</p><div class="bg-blue-50 p-3 rounded-lg"><p class="text-xs text-blue-700">💡 Pay via BNB or USDT on BSC Network</p></div></div>`,
        confirmButtonColor: "#0f7a4a",
        confirmButtonText: "💰 Add $20 Now",
        allowOutsideClick: false,
        showCancelButton: false,
      });

      if (popupResult.isConfirmed) {
        await handleAddTradingBalance();
      } else {
        localStorage.setItem('needsTopUp', 'true');
        setShowAddMoneyButton(true);
      }
    } catch (error) {
      localStorage.setItem('needsTopUp', 'true');
      setShowAddMoneyButton(true);
    }
  };

  const handleAddTradingBalance = async () => {
    try {
      setLoading(true);
      try {
        const chainId = await window.ethereum.request({ method: "eth_chainId" });
        const currentChainId = parseInt(chainId, 16);
        if (currentChainId !== 56) {
          try {
            await window.ethereum.request({ method: "wallet_switchEthereumChain", params: [{ chainId: "0x38" }] });
          } catch (switchError) {
            if (switchError.code === 4902) {
              await window.ethereum.request({ method: "wallet_addEthereumChain", params: [{ chainId: "0x38", chainName: "BSC Mainnet", rpcUrls: ["https://bsc-dataseed.binance.org/"], blockExplorerUrls: ["https://bscscan.com"], nativeCurrency: { name: "BNB", symbol: "BNB", decimals: 18 } }] });
            } else throw switchError;
          }
          await new Promise((resolve) => setTimeout(resolve, 2000));
        }
      } catch (networkError) {
        Swal.fire({ icon: "error", title: "Network Switch Required", text: "Please switch to BSC Mainnet and try again", confirmButtonColor: "#0f7a4a" });
        setLoading(false);
        setShowAddMoneyButton(true);
        return;
      }

      const { value: paymentMethod } = await Swal.fire({
        title: "Choose Payment Method",
        html: `<div class="text-left space-y-3"><p class="font-semibold">Amount: <span class="text-green-600">$20 USD</span></p><div class="space-y-2"><label class="flex items-center p-3 border rounded cursor-pointer hover:bg-gray-50"><input type="radio" name="addpayment" value="usdt" checked class="mr-3"><div><div class="font-semibold">💚 USDT (Recommended)</div></div></label><label class="flex items-center p-3 border rounded cursor-pointer hover:bg-gray-50"><input type="radio" name="addpayment" value="bnb" class="mr-3"><div><div class="font-semibold">🟡 BNB Payment</div></div></label></div></div>`,
        showCancelButton: false,
        confirmButtonText: "Continue",
        confirmButtonColor: "#0f7a4a",
        allowOutsideClick: false,
        preConfirm: () => { const selected = document.querySelector('input[name="addpayment"]:checked'); return selected ? selected.value : "usdt"; },
      });

      if (!paymentMethod) { setLoading(false); setShowAddMoneyButton(true); return; }

      Swal.fire({ title: `Processing ${paymentMethod.toUpperCase()} Payment...`, text: "Please confirm the transaction in your wallet", allowOutsideClick: false, didOpen: () => Swal.showLoading() });

      let paymentResult;
      if (paymentMethod === "usdt") paymentResult = await realWalletService.sendUSDTPayment(20);
      else paymentResult = await realWalletService.sendPayment(20);

      if (!paymentResult.success) throw new Error(paymentResult.error || "Transaction failed");

      Swal.fire({ title: "Transaction Sent!", text: "Waiting for blockchain confirmation...", allowOutsideClick: false, didOpen: () => Swal.showLoading() });
      await new Promise((resolve) => setTimeout(resolve, 5000));
      await realWalletService.validateTransaction(paymentResult.txHash);

      const response = await walletAPI.addBalance(20);
      if (!response.data.success) throw new Error("Failed to update balance");

      localStorage.removeItem('needsTopUp');
      setShowAddMoneyButton(false);

      await Swal.fire({ icon: "success", title: "$20 Added Successfully! 🎉", html: `<div class="text-center"><p>Trading balance added!</p><p class="mt-2 font-bold text-green-600">New Balance: $${response.data.newBalance}</p><p class="text-xs mt-2 text-gray-500">TX: ${paymentResult.txHash.slice(0, 15)}...</p></div>`, confirmButtonColor: "#0f7a4a", confirmButtonText: "Go to Dashboard 🚀", allowOutsideClick: false });
      navigate("/dashbord");
    } catch (error) {
      Swal.fire({ icon: "error", title: "Payment Failed", text: error.message || "Transaction failed. Please try again.", confirmButtonColor: "#0f7a4a" });
      setShowAddMoneyButton(true);
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = async (paymentMethod = "usdt") => {
    try {
      setLoading(true);
      if (!connectedWallet) {
        Swal.fire({ icon: "error", title: "Wallet Not Connected", text: "Please connect your wallet first", confirmButtonColor: "#0f7a4a" });
        setLoading(false);
        return;
      }

      try {
        const chainId = await window.ethereum.request({ method: "eth_chainId" });
        const currentChainId = parseInt(chainId, 16);
        if (currentChainId !== 56) {
          try {
            await window.ethereum.request({ method: "wallet_switchEthereumChain", params: [{ chainId: "0x38" }] });
          } catch (switchError) {
            if (switchError.code === 4902) {
              await window.ethereum.request({ method: "wallet_addEthereumChain", params: [{ chainId: "0x38", chainName: "BSC Mainnet", rpcUrls: ["https://bsc-dataseed.binance.org/"], blockExplorerUrls: ["https://bscscan.com"], nativeCurrency: { name: "BNB", symbol: "BNB", decimals: 18 } }] });
            } else throw switchError;
          }
          await new Promise((resolve) => setTimeout(resolve, 2000));
        }
      } catch (networkError) {
        Swal.fire({ icon: "error", title: "Network Switch Required", text: "Please switch to BSC Mainnet in your wallet and try again", confirmButtonColor: "#0f7a4a" });
        setLoading(false);
        return;
      }

      const planAmount = formData.selectedPlan === "premium" ? 20 : 15;
      let paymentResult;

      if (paymentMethod === "usdt") {
        const confirmResult = await Swal.fire({
          title: `<span style="color: #fff">Confirm USDT Protocol</span>`,
          background: '#111111',
          html: `<div style="text-align: left; color: #ccc; font-family: sans-serif;"><div style="background: #000; border: 1px solid rgba(255,255,255,0.05); padding: 15px; border-radius: 16px; margin-bottom: 15px;"><p style="font-size: 10px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.1em; color: #666; margin-bottom: 4px;">Authorization Amount</p><p style="font-size: 24px; font-weight: 900; color: #fff;">$${planAmount} USDT</p></div><p style="font-size: 11px; line-height: 1.5;">Network: <span style="color: #FCE270">BSC Mainnet</span></p><p style="font-size: 11px; line-height: 1.5;">Asset: <span style="color: #FCE270">USDT (BEP-20)</span></p></div>`,
          icon: "question", iconColor: "#FCE270", showCancelButton: true,
          confirmButtonColor: "#FCE270", cancelButtonColor: "#1A1A1A",
          confirmButtonText: `<span style="color: black; font-weight: 900;">AUTHORIZE</span>`, cancelButtonText: "CANCEL",
          customClass: { popup: 'rounded-[32px] border border-white/5' }
        });
        if (!confirmResult.isConfirmed) { setLoading(false); return; }

        Swal.fire({ title: `<span style="color: #fff">Processing Protocol...</span>`, text: "Confirming USDT transaction in your wallet", background: '#111111', color: '#ccc', allowOutsideClick: false, didOpen: () => Swal.showLoading() });
        paymentResult = await realWalletService.sendUSDTPayment(planAmount);
        if (!paymentResult.success) {
          const errMsg = paymentResult.error || '';
          const isCancelled = errMsg.toLowerCase().includes('cancel') || errMsg.toLowerCase().includes('reject') || errMsg.toLowerCase().includes('denied') || errMsg.toLowerCase().includes('user refused');
          Swal.close();
          Swal.fire({ icon: isCancelled ? 'warning' : 'error', title: `<span style="color:#fff">${isCancelled ? 'Payment Cancelled' : 'Payment Failed'}</span>`, text: isCancelled ? 'You cancelled the transaction in your wallet.' : errMsg, background: '#111111', confirmButtonColor: '#FCE270', confirmButtonText: '<span style="color:black;font-weight:900;">OK</span>', customClass: { popup: 'rounded-[32px] border border-white/5' } });
          setLoading(false);
          return;
        }
      } else {
        Swal.fire({ title: `<span style="color: #fff">Accessing Market...</span>`, text: `Calculating BNB swap for $${planAmount} USD`, background: '#111111', color: '#ccc', allowOutsideClick: false, didOpen: () => Swal.showLoading() });

        const currentBNBPrice = await fetchCurrentBNBPrice();
        const exactBNBAmount = (15 / currentBNBPrice).toFixed(6);

        const confirmResult = await Swal.fire({
          title: `<span style="color: #fff">Confirm BNB Payment</span>`,
          background: '#111111',
          html: `<div style="text-align: left; color: #ccc; font-family: sans-serif;"><div style="background: #000; border: 1px solid rgba(255,255,255,0.05); padding: 15px; border-radius: 16px; margin-bottom: 15px;"><p style="font-size: 10px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.1em; color: #666; margin-bottom: 4px;">Transfer Amount</p><p style="font-size: 24px; font-weight: 900; color: #fff;">${exactBNBAmount} BNB</p><p style="font-size: 10px; color: #FCE270;">≈ $${planAmount} USD</p></div><p style="font-size: 11px; line-height: 1.5;">Market Price: <span style="color: #fff">$${currentBNBPrice.toFixed(2)}</span></p></div>`,
          icon: "question", iconColor: "#FCE270", showCancelButton: true,
          confirmButtonColor: "#FCE270", cancelButtonColor: "#1A1A1A",
          confirmButtonText: `<span style="color: black; font-weight: 900;">AUTHORIZE</span>`, cancelButtonText: "CANCEL",
          customClass: { popup: 'rounded-[32px] border border-white/5' }
        });
        if (!confirmResult.isConfirmed) { setLoading(false); return; }

        Swal.fire({ title: "Processing BNB Payment...", text: "Please confirm the BNB transaction in your wallet", allowOutsideClick: false, didOpen: () => Swal.showLoading() });
        paymentResult = await realWalletService.sendPayment(planAmount, currentBNBPrice);
        if (!paymentResult.success) {
          const errMsg = paymentResult.error || '';
          const isCancelled = errMsg.toLowerCase().includes('cancel') || errMsg.toLowerCase().includes('reject') || errMsg.toLowerCase().includes('denied') || errMsg.toLowerCase().includes('user refused');
          Swal.close();
          Swal.fire({ icon: isCancelled ? 'warning' : 'error', title: `<span style="color:#fff">${isCancelled ? 'Payment Cancelled' : 'Payment Failed'}</span>`, text: isCancelled ? 'You cancelled the transaction in your wallet.' : errMsg, background: '#111111', confirmButtonColor: '#FCE270', confirmButtonText: '<span style="color:black;font-weight:900;">OK</span>', customClass: { popup: 'rounded-[32px] border border-white/5' } });
          setLoading(false);
          return;
        }
      }

      if (paymentResult.success) {
        Swal.fire({ title: `<span style="color: #fff">Protocol Dispatched</span>`, text: "Waiting for blockchain confirmation...", background: '#111111', color: '#ccc', allowOutsideClick: false, didOpen: () => Swal.showLoading() });
        await new Promise((resolve) => setTimeout(resolve, 5000));
        const validationResult = await realWalletService.validateTransaction(paymentResult.txHash);
        if (!validationResult.success) throw new Error("Transaction validation failed");

        try {
          const response = await authAPI.register({
            name: formData.name, email: formData.email, mobile: formData.mobile,
            country: formData.country, password: formData.password,
            walletAddress: connectedWallet, referralCode: formData.referralCode || undefined,
            planType: formData.selectedPlan,
          });

          localStorage.setItem("token", response.data.token);
          localStorage.setItem("user", JSON.stringify(response.data.user));

          try {
            const activationData = {
              txHash: paymentResult.txHash, walletAddress: connectedWallet,
              amount: paymentResult.amount, amountUSD: paymentResult.amountUSD,
              paymentType: paymentResult.paymentType || paymentMethod,
              tokenSymbol: paymentResult.tokenSymbol, companyWallet: paymentResult.to,
              userWallet: paymentResult.from, chainId: paymentResult.chainId,
            };
            await walletAPI.activate(activationData);
          } catch (activationError) { }

          await checkBalanceAndAddMoney(paymentResult);
          return;
        } catch (registrationError) {
          const errorMessage = registrationError.response?.data?.message || registrationError.message || "Unknown error occurred";
          Swal.fire({
            icon: "error", title: `<span style="color: #fff">Registration Error</span>`,
            background: '#111111',
            html: `<div style="text-align: left; color: #ccc; font-family: sans-serif;"><div style="background: rgba(34,197,94,0.1); border: 1px solid rgba(34,197,94,0.2); padding: 12px; border-radius: 12px; margin-bottom: 15px;"><p style="color: #4ade80; font-size: 11px; font-weight: 800;">✅ PAYMENT CONFIRMED</p><p style="color: #fff; font-size: 10px;">TX: ${paymentResult.txHash.slice(0, 20)}...</p></div><p style="font-size: 12px; color: #fff; font-weight: 800; margin-bottom: 8px;">ENCOUNTERED ERROR:</p><div style="background: rgba(239,68,68,0.1); border: 1px solid rgba(239,68,68,0.2); padding: 12px; border-radius: 12px; margin-bottom: 15px;"><p style="color: #f87171; font-size: 11px; font-weight: 800;">${errorMessage}</p></div><p style="font-size: 10px; color: #666; font-weight: 800; text-transform: uppercase;">Next Steps:</p><p style="font-size: 11px; line-height: 1.6; margin-top: 5px;">Our concierge team will manually activate your node within 24 hours. Please save your TX Hash.</p></div>`,
            confirmButtonColor: "#FCE270", confirmButtonText: `<span style="color: black; font-weight: 900;">CONTACT CONCIERGE</span>`,
            width: '500px', allowOutsideClick: false,
            customClass: { popup: 'rounded-[32px] border border-white/5' }
          });
          return;
        }
      }
    } catch (error) {
      Swal.fire({
        icon: "error", title: `<span style="color: #fff">Protocol Interrupted</span>`,
        text: error.message || "Transaction failed. Please try again.",
        background: '#111111', confirmButtonColor: "#FCE270",
        confirmButtonText: `<span style="color: black; font-weight: 900;">RETRY</span>`,
        customClass: { popup: 'rounded-[32px] border border-white/5' }
      });
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] max-w-md mx-auto relative font-sans">

      {/* STICKY HEADER */}


      {/* CONTENT */}
      <div className="px-4 pb-28 space-y-5">

        {/* HERO HEADER */}
        <div className="text-center pt-4 pb-2">
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">

          {/* STEP 1: Personal Info */}
          <div className={`space-y-4 ${step !== 1 ? 'hidden' : ''}`}>
            <div className="bg-gradient-to-br from-[#1A1A1A] to-[#151515] rounded-[24px] border border-white/5 p-5 space-y-4">
              <div className="flex justify-center mb-2">
                <img src="/Nextlogo-removebg-preview.png" alt="Logo" className="w-40 h-40 object-contain" />
              </div>
              <div className="flex items-center gap-2 mb-2">
                <FaUser size={12} className="text-[#FCE270]" />
                <span className="text-[11px] font-black text-white uppercase tracking-wider">Personal Details</span>
              </div>

              {/* Name */}
              <div className="space-y-1.5">
                <label className="text-[9px] text-gray-500 font-black uppercase tracking-widest">Full Name *</label>
                <input type="text" name="name" placeholder="Enter full name" value={formData.name} onChange={handleChange} required
                  className="w-full bg-black/40 border border-white/5 rounded-xl py-3.5 px-4 text-sm text-white placeholder-gray-700 focus:border-[#FCE270]/30 transition-all outline-none" />
              </div>

              {/* Email */}
              <div className="space-y-1.5">
                <label className="text-[9px] text-gray-500 font-black uppercase tracking-widest">Email *</label>
                <div className="relative">
                  <input type="email" name="email" placeholder="Enter email" value={formData.email} onChange={handleChange} required
                    className={`w-full bg-black/40 border rounded-xl py-3.5 px-4 text-sm text-white placeholder-gray-700 focus:border-[#FCE270]/30 transition-all outline-none ${emailError ? 'border-red-500/50' : emailStatus.exists ? 'border-red-500/50' : 'border-white/5'}`} />
                  {emailStatus.checking && (
                    <div className="absolute right-4 top-1/2 -translate-y-1/2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#FCE270]"></div>
                    </div>
                  )}
                </div>
                {emailError && (
                  <p className="text-[8px] font-black uppercase tracking-widest mt-1 text-red-500">
                    ❌ {emailError}
                  </p>
                )}
                {!emailError && emailStatus.message && (
                  <p className={`text-[8px] font-black uppercase tracking-widest mt-1 ${emailStatus.exists ? 'text-red-500' : 'text-green-500'}`}>
                    {emailStatus.message}
                  </p>
                )}
              </div>

              {/* Mobile */}
              <div className="space-y-1.5">
                <label className="text-[9px] text-gray-500 font-black uppercase tracking-widest">Mobile Number *</label>
                <div className="relative">
                  <PhoneInput country="in" enableSearch value={formData.mobile}
                    onChange={(value, country) => {
                      setMobileChecking(true);
                      setMobileError("");
                      setFormData(prev => ({ ...prev, mobile: value, country: country.countryCode.toUpperCase() }));
                      setTimeout(() => {
                        const phone = parsePhoneNumberFromString(`+${value}`, country.countryCode.toUpperCase());
                        if (!value) setMobileError("Mobile number is required");
                        else if (!phone || !phone.isValid()) setMobileError("Please enter a valid mobile number");
                        else setMobileError("");
                        setMobileChecking(false);
                      }, 600);
                    }}
                    isValid={() => true}
                    inputStyle={{ width: "100%", height: "50px", backgroundColor: "rgba(0,0,0,0.4)", borderRadius: "12px", border: mobileError ? "1px solid rgba(248,113,113,0.5)" : "1px solid rgba(255,255,255,0.05)", fontSize: "14px", color: "white", paddingLeft: "52px" }}
                    buttonStyle={{ border: "1px solid rgba(255,255,255,0.05)", borderRadius: "12px 0 0 12px", backgroundColor: "transparent" }}
                    dropdownStyle={{ backgroundColor: "#1A1A1A", color: "white", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.1)" }}
                  />
                  {/* Loader / tick / cross inside input */}
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                    {mobileChecking ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-[#FCE270] border-t-transparent" />
                    ) : formData.mobile && !mobileError ? (
                      <span className="text-green-400 text-sm">✓</span>
                    ) : formData.mobile && mobileError ? (
                      <span className="text-red-400 text-sm">✗</span>
                    ) : null}
                  </div>
                </div>
                {!mobileChecking && mobileError && (
                  <p className="text-[8px] font-black text-red-500 uppercase tracking-widest mt-1">{mobileError}</p>
                )}
              </div>

              {/* Referral */}
              <div className="space-y-1.5">
                <label className="text-[9px] text-gray-500 font-black uppercase tracking-widest">Referral Code *</label>
                <div className="relative">
                  <input type="text" name="referralCode" placeholder="Enter code" value={formData.referralCode} onChange={handleChange} readOnly={isReferralLocked}
                    className={`w-full bg-black/40 border rounded-xl py-3.5 px-4 pr-12 text-sm text-white placeholder-gray-700 focus:border-[#FCE270]/30 transition-all outline-none ${isReferralLocked ? 'opacity-50 cursor-not-allowed' : ''} ${referralStatus.valid === true ? 'border-green-500/50' : referralStatus.valid === false ? 'border-red-500/50' : 'border-white/5'}`} />
                  {/* Loader inside input */}
                  <div className="absolute right-4 top-1/2 -translate-y-1/2">
                    {referralStatus.checking ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-[#FCE270] border-t-transparent" />
                    ) : referralStatus.valid === true ? (
                      <span className="text-green-400 text-sm">✓</span>
                    ) : referralStatus.valid === false ? (
                      <span className="text-red-400 text-sm">✗</span>
                    ) : null}
                  </div>
                </div>
                {!referralStatus.checking && referralStatus.message && (
                  <p className={`text-[8px] font-black uppercase tracking-widest mt-1 ${referralStatus.valid ? 'text-green-500' : 'text-red-500'}`}>
                    {referralStatus.message}
                  </p>
                )}
              </div>
            </div>

            <button type="button" onClick={handleStep1Continue}
              className="w-full bg-[#FCE270] text-black h-13 rounded-2xl font-black text-[12px] uppercase tracking-widest active:scale-95 transition-all">
              {referralStatus.checking ? 'Verifying...' : 'Continue'}
            </button>
          </div>

          {/* STEP 2: Plan & Wallet */}
          <div className={`space-y-4 pt-6 ${step !== 2 ? 'hidden' : ''}`}>
            {/* Plan Selection */}
            <div className="bg-gradient-to-br from-[#1A1A1A] to-[#151515] rounded-[24px] border border-white/5 p-5 space-y-3">
              <div className="flex items-center gap-2 mb-1">
                <FaCrown size={12} className="text-[#FCE270]" />
                <span className="text-[11px] font-black text-white uppercase tracking-wider">Select Plan</span>
              </div>

              {['basic'].map((plan) => (
                <div key={plan} onClick={() => setFormData(prev => ({ ...prev, selectedPlan: plan }))}
                  className={`p-4 rounded-2xl border transition-all active:scale-[0.98] ${formData.selectedPlan === plan
                    ? 'bg-[#FCE270]/10 border-[#FCE270]/30'
                    : 'bg-black/30 border-white/5'
                    }`}>
                  <div className="flex items-center justify-between mb-2">
                    <span className={`text-[11px] font-black uppercase tracking-wider ${formData.selectedPlan === plan ? 'text-[#FCE270]' : 'text-gray-400'}`}>
                      {plan} Tier
                    </span>
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${formData.selectedPlan === plan ? 'border-[#FCE270] bg-[#FCE270]' : 'border-gray-600'
                      }`}>
                      {formData.selectedPlan === plan && <FaCheckCircle size={10} className="text-black" />}
                    </div>
                  </div>
                  <p className="text-[24px] font-black text-white">${plan === 'premium' ? '20' : '15'}</p>
                  <div className="flex gap-2 mt-2">
                    {(plan === 'premium' ? ['Unlimited', 'Global Pool', 'VIP Support'] : ['$500 Limit', 'Basic Pool', 'Standard']).map((f, i) => (
                      <span key={i} className="text-[8px] text-gray-500 font-black uppercase bg-white/5 px-2 py-1 rounded-lg">{f}</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Wallet Connect */}
            <div className="bg-gradient-to-br from-[#1A1A1A] to-[#151515] rounded-[24px] border border-white/5 p-5 space-y-3">
              <div className="flex items-center gap-2 mb-1">
                <FaWallet size={12} className="text-[#FCE270]" />
                <span className="text-[11px] font-black text-white uppercase tracking-wider">Crypto Wallet</span>
              </div>

              {!connectedWallet ? (
                <button type="button" onClick={connectWallet} disabled={loading}
                  className="w-full bg-black/40 border border-[#FCE270]/20 rounded-2xl py-4 font-black text-[11px] text-white uppercase tracking-wider flex items-center justify-center gap-2 active:scale-95 transition-all">
                  <FaWallet className="text-[#FCE270]" size={16} />
                  {loading ? "Connecting..." : "Connect Wallet"}
                </button>
              ) : (
                <div className="relative">
                  <input readOnly value={connectedWallet}
                    className="w-full bg-black/40 border border-[#FCE270]/20 rounded-xl py-3.5 px-4 pr-12 text-[10px] font-mono text-[#FCE270] tracking-tight outline-none" />
                  <button type="button" onClick={copyWallet} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#FCE270]/60 hover:text-[#FCE270] active:scale-75 transition-all">
                    <FaRegCopy size={14} />
                  </button>
                </div>
              )}

              <div className="flex items-center justify-center gap-4 opacity-40">
                <span className="text-[9px] text-gray-500 font-black uppercase">BSC Network</span>
                <span className="text-[9px] text-gray-500 font-black uppercase">BEP-20</span>
              </div>
            </div>

            <div className="flex gap-3">
              <button type="button" onClick={() => setStep(1)}
                className="flex-1 bg-white/5 border border-white/5 h-13 rounded-2xl font-black text-[12px] text-gray-400 uppercase tracking-widest active:scale-95 transition-all">
                Back
              </button>
              <button type="button" onClick={() => setStep(3)}
                className="flex-1 bg-[#FCE270] text-black h-13 rounded-2xl font-black text-[12px] uppercase tracking-widest active:scale-95 transition-all">
                Continue
              </button>
            </div>
          </div>

          {/* STEP 3: Password & Submit */}
          <div className={`space-y-4 pt-6 ${step !== 3 ? 'hidden' : ''}`}>
            <div className="bg-gradient-to-br from-[#1A1A1A] to-[#151515] rounded-[24px] border border-white/5 p-5 space-y-4">
              <div className="flex items-center gap-2 mb-1">
                <FaLock size={12} className="text-[#FCE270]" />
                <span className="text-[11px] font-black text-white uppercase tracking-wider">Set Password</span>
              </div>

              <div className="space-y-1.5">
                <label className="text-[9px] text-white font-black font-semibold uppercase tracking-widest">Password *</label>
                <div className="relative">
                  <input type={showPassword ? 'text' : 'password'} name="password" placeholder="••••••••" onChange={handleChange} required
                    className="w-full bg-black/40 border border-white/5 rounded-xl py-3.5 px-4 pr-12 text-sm text-white placeholder-gray-700 focus:border-[#FCE270]/30 transition-all outline-none" />
                  <button type="button" onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 active:scale-75 transition-all">
                    {showPassword ? <RiEyeOffLine size={16} /> : <RiEyeLine size={16} />}
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[9px] text-white font-black font-semibolduppercase tracking-widest">Confirm Password *</label>
                <div className="relative">
                  <input type={showConfirmPassword ? 'text' : 'password'} name="confirmPassword" placeholder="••••••••" onChange={handleChange} required
                    className="w-full bg-black/40 border border-white/5 rounded-xl py-3.5 px-4 pr-12 text-sm text-white placeholder-gray-700 focus:border-[#FCE270]/30 transition-all outline-none" />
                  <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 active:scale-75 transition-all">
                    {showConfirmPassword ? <RiEyeOffLine size={16} /> : <RiEyeLine size={16} />}
                  </button>
                </div>
              </div>
            </div>

            {/* Summary */}
            <div className="bg-black/30 rounded-xl p-4 border border-white/5 space-y-2">
              <p className="text-[9px] text-gray-500 font-black uppercase tracking-widest">Order Summary</p>
              {/* <div className="flex justify-between text-[11px] font-bold"><span className="text-gray-400">Plan</span><span className="text-white uppercase">{formData.selectedPlan}</span></div> */}
              <div className="flex justify-between text-[11px] font-bold"><span className="text-gray-400">Amount</span><span className="text-[#FCE270] font-black">${formData.selectedPlan === 'premium' ? '20' : '15'}</span></div>
              <div className="flex justify-between text-[11px] font-bold"><span className="text-gray-400">Wallet</span><span className="text-green-400 text-[9px]">{connectedWallet ? 'Connected' : 'Not connected'}</span></div>
            </div>

            <div className="flex gap-3">
              <button type="button" onClick={() => setStep(2)}
                className="flex-1 bg-white/5 border border-white/5 h-13 rounded-2xl font-black text-[12px] text-gray-400 uppercase tracking-widest active:scale-95 transition-all">
                Back
              </button>
              <button type="submit" disabled={loading}
                className="flex-1 bg-[#FCE270] text-black h-13 rounded-2xl font-black text-[12px] uppercase tracking-widest active:scale-95 transition-all disabled:opacity-50 shadow-lg shadow-[#FCE270]/20">
                {loading ? 'Processing...' : `Register $${formData.selectedPlan === 'premium' ? '20' : '15'}`}
              </button>
            </div>

            {showAddMoneyButton && (
              <button type="button" onClick={handleAddTradingBalance} disabled={loading}
                className="w-full bg-black/40 border border-[#FCE270]/20 text-[#FCE270] h-13 rounded-2xl font-black text-[11px] uppercase tracking-widest active:scale-95 transition-all flex items-center justify-center gap-2">
                💰 {loading ? 'Processing...' : 'Add $20 to Continue Trading'}
              </button>
            )}
          </div>
        </form>

        {/* LOGIN LINK */}
        <div className="text-center pb-4">
          <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">
            Already have an account?{" "}
            <span onClick={() => navigate("/login")} className="text-[#FCE270] font-black cursor-pointer active:underline">
              Sign In
            </span>
          </p>
        </div>



      </div>
    </div>
  );
};

export default Signup;