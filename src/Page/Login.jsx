import React, { useState } from "react";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import { authAPI, walletAPI } from "../services/api";
import realWalletService from "../services/realWalletService";
import { IoChevronBack, IoEyeOutline, IoEyeOffOutline } from "react-icons/io5";
import { requestNotificationPermission } from "../services/firebaseService";

const Login = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (!formData.email || !formData.password) {
      Swal.fire({
        icon: "warning",
        title: "Missing Fields",
        text: "Please fill all fields",
        background: '#1A1A1A',
        color: '#fff',
        confirmButtonColor: "#FCE270",
        confirmButtonText: '<span style="color: #000; font-weight: 900;">OK</span>',
      });
      setLoading(false);
      return;
    }

    try {
      const response = await authAPI.login(formData);

      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      localStorage.setItem('userEmail', response.data.user.email);

      // ✅ FCM Token request karo login ke baad
      requestNotificationPermission();

      if (response.data.needsActivation || !response.data.user.isActive) {
        Swal.fire({
          icon: "warning",
          title: "Account Not Activated",
          text: "Please complete payment to activate your account",
          background: '#1A1A1A',
          color: '#fff',
          confirmButtonColor: "#FCE270",
          confirmButtonText: '<span style="color: #000; font-weight: 900;">ACTIVATE NOW</span>',
        });
        navigate("/activate");
        return;
      }

      const needsTopUp = localStorage.getItem('needsTopUp');
      if (needsTopUp === 'true') {
        await handleTopUpAfterLogin();
        return;
      }

      Swal.fire({
        icon: "success",
        title: "Login Successful 🎉",
        background: '#1A1A1A',
        color: '#fff',
        confirmButtonColor: "#FCE270",
        confirmButtonText: '<span style="color: #000; font-weight: 900;">ENTER DASHBOARD</span>',
      });
      navigate("/dashbord");
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Login Failed",
        text: error.response?.data?.message || "Something went wrong",
        background: '#1A1A1A',
        color: '#fff',
        confirmButtonColor: "#FCE270",
        confirmButtonText: '<span style="color: #000; font-weight: 900;">TRY AGAIN</span>',
      });
    }
    setLoading(false);
  };

  const handleTopUpAfterLogin = async () => {
    const popupResult = await Swal.fire({
      icon: "warning",
      title: "💰 Add $20 Trading Balance",
      background: '#1A1A1A',
      color: '#fff',
      html: `
        <div class="text-left space-y-3">
          <div class="bg-black p-4 rounded-xl border border-white/5">
            <p class="text-[#FCE270] font-black uppercase text-xs mb-2 tracking-widest">⚠️ Trading Balance Required</p>
            <p class="text-sm text-gray-400">Add $20 to start trading CryptoNest Tokens.</p>
          </div>
        </div>
      `,
      confirmButtonColor: "#FCE270",
      confirmButtonText: '<span style="color: #000; font-weight: 900;">💰 ADD $20 NOW</span>',
      allowOutsideClick: false,
    });

    if (!popupResult.isConfirmed) return;

    try {
      setLoading(true);
      // BSC Network switch logic (kept identical)
      try {
        const chainId = await window.ethereum.request({ method: "eth_chainId" });
        if (parseInt(chainId, 16) !== 56) {
          await window.ethereum.request({
            method: "wallet_switchEthereumChain",
            params: [{ chainId: "0x38" }],
          });
          await new Promise((r) => setTimeout(r, 2000));
        }
      } catch {
        Swal.fire({ icon: "error", title: "Switch to BSC Mainnet", confirmButtonColor: "#FCE270" });
        setLoading(false);
        return;
      }

      if (!realWalletService.isWalletConnected()) {
        const result = await realWalletService.connectWallet();
        if (!result.success) {
          Swal.fire({ icon: "error", title: "Wallet Connect Failed", text: result.error, confirmButtonColor: "#FCE270" });
          setLoading(false);
          return;
        }
      }

      const { value: paymentMethod } = await Swal.fire({
        title: "Choose Payment Method",
        background: '#1A1A1A',
        color: '#fff',
        html: `
          <div class="text-left space-y-4">
            <p class="font-black text-xs uppercase tracking-widest text-gray-500 mb-4">Amount: <span class="text-green-500">$20 USD</span></p>
            <div class="space-y-2">
              <label class="flex items-center p-4 border border-white/5 bg-black rounded-xl cursor-pointer hover:border-green-500/40 transition-all">
                <input type="radio" name="loginpayment" value="usdt" checked class="mr-3 accent-green-500">
                <div class="font-black text-white uppercase text-xs">💚 USDT (Recommended)</div>
              </label>
              <label class="flex items-center p-4 border border-white/5 bg-black rounded-xl cursor-pointer hover:border-[#FCE270]/40 transition-all">
                <input type="radio" name="loginpayment" value="bnb" class="mr-3 accent-[#FCE270]">
                <div class="font-black text-white uppercase text-xs">🟡 BNB Payment</div>
              </label>
            </div>
          </div>
        `,
        confirmButtonText: '<span style="color: #000; font-weight: 900;">CONTINUE</span>',
        confirmButtonColor: "#FCE270",
        preConfirm: () => {
          const selected = document.querySelector('input[name="loginpayment"]:checked');
          return selected ? selected.value : "usdt";
        },
      });

      if (!paymentMethod) { setLoading(false); return; }

      Swal.fire({
        title: `Processing Payment...`,
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading(),
      });

      const paymentResult = paymentMethod === "usdt"
        ? await realWalletService.sendUSDTPayment(20)
        : await realWalletService.sendPayment(20);

      if (!paymentResult.success) throw new Error(paymentResult.error || "Transaction failed");

      await new Promise((r) => setTimeout(r, 5000));
      await realWalletService.validateTransaction(paymentResult.txHash);
      const response = await walletAPI.addBalance(20);
      localStorage.removeItem('needsTopUp');

      await Swal.fire({
        icon: "success",
        title: "$20 Added! 🎉",
        background: '#1A1A1A',
        color: '#fff',
        confirmButtonColor: "#FCE270",
        confirmButtonText: '<span style="color: #000; font-weight: 900;">GET STARTED</span>',
      });

      navigate("/dashbord");
    } catch (error) {
      Swal.fire({ icon: "error", title: "Payment Failed", text: error.message, confirmButtonColor: "#FCE270" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-screen h-screen bg-black flex flex-col text-white font-sans overflow-y-auto">
      {/* HEADER */}
      <div className="flex items-center justify-center px-5 pt-8 pb-2">
        <img
          src="/Nextlogo-removebg-preview.png"
          alt="CryptoNest Logo"
          className="h-75 object-contain"
        />
      </div>

      <div className="px-6 pt-0">
        <form onSubmit={handleSubmit} className="mt-4 space-y-5">
          {/* EMAIL */}
          <div className="space-y-2">
            <input
              type="email"
              name="email"
              placeholder="Enter your email"
              value={formData.email}
              onChange={handleChange}
              className="w-full bg-[#1A1A1A] border-none rounded-2xl py-4 px-6 text-[15px] text-white placeholder-gray-600 focus:ring-2 focus:ring-[#FCE270]/50 transition-all"
            />
          </div>

          {/* PASSWORD */}
          <div className="space-y-2">
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleChange}
                className="w-full bg-[#1A1A1A] border-none rounded-2xl py-4 px-6 text-[15px] text-white placeholder-gray-600 focus:ring-2 focus:ring-[#FCE270]/50 transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-6 top-1/2 -translate-y-1/2 text-gray-500 active:text-white"
              >
                {showPassword ? <IoEyeOffOutline size={20} /> : <IoEyeOutline size={20} />}
              </button>
            </div>
          </div>

          {/* LOGIN BUTTON */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#FCE270] text-black h-[58px] rounded-2xl font-bold text-[16px] mt-4 shadow-[0_8px_20px_rgba(252,226,112,0.15)] active:scale-[0.97] transition-all disabled:opacity-50"
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <p className="mt-10 mb-8 text-gray-400 text-[14px] text-center font-medium">
          Don't have an account?{" "}
          <span
            onClick={() => navigate("/SingUp")}
            className="text-[#FCE270] font-bold cursor-pointer hover:underline underline-offset-4"
          >
            Sign Up
          </span>
        </p>
      </div>
    </div>
  );
};

export default Login;

