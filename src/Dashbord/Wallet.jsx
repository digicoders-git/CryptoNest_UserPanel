import React, { useState, useEffect } from "react";
import {
  FaWallet,
  FaPlus,
  FaMinus,
  FaHistory,
  FaCoins,
  FaArrowUp,
  FaArrowDown,
} from "react-icons/fa";
import Swal from "sweetalert2";
import { walletAPI, userAPI, demoAPI } from "../services/api";
import WalletStatus from "../Componect/WalletStatus";
import realWalletService from "../services/realWalletService";
import bnbTokenUtils from "../utils/bnbTokenUtils";
import envConfig from "../config/environment";

const Wallet = () => {
  const [balance, setBalance] = useState(0);
  const [profit, setProfit] = useState(0);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchBalance();
    fetchProfit();
    fetchTransactions();

    // Listen for balance updates from other components
    const handleBalanceUpdate = (event) => {
      setBalance(event.detail.balance);
    };

    window.addEventListener("balanceUpdate", handleBalanceUpdate);

    return () => {
      window.removeEventListener("balanceUpdate", handleBalanceUpdate);
    };
  }, []);

  const fetchBalance = async () => {
    try {
      // ✅ Always fetch from database API
      const response = await walletAPI.getBalance();
      const realBalance = response.data.balance || 0;

      console.log("🔍 Database Balance:", realBalance);
      setBalance(realBalance);
    } catch (error) {
      console.error("❌ Failed to fetch balance:", error);
      setBalance(0);
    }
  };

  const fetchProfit = async () => {
    try {
      const response = await walletAPI.getBalance();
      setProfit(response.data.profit || 0);
    } catch (error) {
      console.error("Error fetching profit:", error);
      setProfit(0);
    }
  };

  const fetchTransactions = async () => {
    try {
      // Use same API as History page
      const response = await userAPI.getTransactions();
      const apiTransactions = response.data.transactions || [];

      // Sort by date (newest first) and take only 5 recent transactions
      const recentTransactions = apiTransactions
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 5);

      setTransactions(recentTransactions);
      console.log("✅ Recent transactions loaded:", recentTransactions.length);
    } catch (error) {
      console.error("❌ Error fetching transactions:", error);
      setTransactions([]);
    }
  };

  const handleAddBalance = async () => {
    // Step 1: Check if wallet is connected
    if (!realWalletService.isWalletConnected()) {
      Swal.fire({
        icon: "warning",
        title: "Wallet Not Connected",
        text: "Please connect your crypto wallet first to add balance",
        background: '#1A1A1A',
        color: '#fff',
        confirmButtonColor: "#FCE270",
        confirmButtonText: '<span style="color: #000; font-weight: 900;">OK</span>',
      });
      return;
    }

    // Step 2: Show payment method selection
    await showPaymentMethodSelection();
  };

  const showPaymentMethodSelection = async () => {
    try {
      setLoading(true);

      const walletAccount = realWalletService.getAccount();
      const networkInfo = realWalletService.getNetworkInfo();

      console.log("🔄 Wallet Account:", walletAccount);
      console.log("🔄 Network Info:", networkInfo);

      setLoading(false);

      // Step 3: Payment method selection popup
      const { value: paymentMethod } = await Swal.fire({
        title: "Choose Payment Method",
        background: '#1A1A1A',
        color: '#fff',
        html: `
          <div class="text-left space-y-4">
            <div class="bg-black p-3 rounded-lg border border-white/10">
              <p class="text-green-500 font-medium text-xs">✅ Wallet Connected: ${walletAccount.substring(0, 6)}...${walletAccount.substring(-4)}</p>
              <p class="text-[10px] text-gray-500 uppercase font-bold mt-1">Network: ${networkInfo.networkName}</p>
            </div>
            
            <div class="space-y-3">
              <p class="font-black text-xs uppercase tracking-widest text-gray-400">Select payment method:</p>
              
              <div class="space-y-2">
                <label class="flex items-center p-4 border border-white/5 bg-black/40 rounded-xl cursor-pointer hover:border-[#FCE270]/40 transition-all group">
                  <input type="radio" name="payment" value="bnb" checked class="mr-3 accent-[#FCE270]">
                  <div class="flex-1">
                    <div class="font-bold text-white uppercase text-xs">Pay with BNB</div>
                  </div>
                  <div class="text-[#FCE270] font-bold text-lg">🟡</div>
                </label>
                
                <label class="flex items-center p-4 border border-white/5 bg-black/40 rounded-xl cursor-pointer hover:border-green-500/40 transition-all group">
                  <input type="radio" name="payment" value="usdt" class="mr-3 accent-green-500">
                  <div class="flex-1">
                    <div class="font-bold text-white uppercase text-xs">Pay with USDT</div>
                  </div>
                  <div class="text-green-500 font-bold text-lg">💚</div>
                </label>
              </div>
            </div>
          </div>
        `,
        showCancelButton: true,
        confirmButtonColor: "#FCE270",
        confirmButtonText: '<span style="color: #000; font-weight: 900;">CONTINUE</span>',
        cancelButtonColor: "#2A2A2A",
        cancelButtonText: "CANCEL",
        preConfirm: () => {
          const selected = document.querySelector(
            'input[name="payment"]:checked',
          );
          if (!selected) {
            Swal.showValidationMessage("Please select a payment method");
            return false;
          }
          return selected.value;
        },
      });

      if (paymentMethod) {
        // Step 4: Process based on selected method
        console.log("🔄 Selected payment method:", paymentMethod);

        if (paymentMethod === "bnb") {
          console.log("🟡 Processing BNB payment...");
          await processBNBPayment();
        } else if (paymentMethod === "usdt") {
          console.log("💚 Processing USDT payment...");
          await processUSDTPayment();
        } else {
          console.log("❌ Unknown payment method:", paymentMethod);
          Swal.fire({
            icon: "error",
            title: "Invalid Selection",
            text: "Please select a valid payment method",
            confirmButtonColor: "#0f7a4a",
          });
        }
      } else {
        console.log("❌ Payment method selection cancelled");
      }
    } catch (error) {
      setLoading(false);
      console.error("❌ Payment method selection failed:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to load payment options. Please try again.",
        confirmButtonColor: "#0f7a4a",
      });
    }
  };

  const processBNBPayment = async () => {
    try {
      setLoading(true);

      // Get BNB balance
      const walletBalance = await realWalletService.getBalance();
      const walletAccount = realWalletService.getAccount();

      if (!walletBalance.success) {
        throw new Error(walletBalance.error || "Failed to fetch BNB balance");
      }

      const bnbBalance = parseFloat(walletBalance.balance);

      // ✅ Fetch real-time BNB price from Binance API
      const bnbPrice = await envConfig.fetchCurrentBNBPrice();
      const maxUsdAmount = (bnbBalance * bnbPrice).toFixed(2);

      setLoading(false);

      // Step 5: Show amount input for BNB
      const { value: amount } = await Swal.fire({
        title: "Add Balance with BNB",
        background: '#1A1A1A',
        color: '#fff',
        html: `
          <div class="text-left space-y-4 mb-4">
            <div class="bg-black p-4 rounded-xl border border-white/5">
              <h4 class="font-black text-[#FCE270] uppercase text-xs mb-3 tracking-widest">🟡 BNB Payment</h4>
              <div class="space-y-2 text-[10px] font-bold uppercase tracking-widest">
                <div class="flex justify-between">
                  <span class="text-gray-500">Connected Wallet:</span>
                  <span class="text-white">${walletAccount.substring(0, 6)}...${walletAccount.substring(-4)}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-gray-500">BNB Balance:</span>
                  <span class="text-white">${bnbBalance} BNB</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-gray-500">Available:</span>
                  <span class="text-green-500">~$${maxUsdAmount}</span>
                </div>
              </div>
            </div>
          </div>
        `,
        input: "number",
        inputLabel: `Enter Amount (Max: $${maxUsdAmount} USD)`,
        inputPlaceholder: "Enter USD amount",
        background: '#1A1A1A',
        color: '#fff',
        showCancelButton: true,
        confirmButtonColor: "#FCE270",
        confirmButtonText: '<span style="color: #000; font-weight: 900;">DEPOSIT BNB</span>',
        cancelButtonColor: "#2A2A2A",
        inputValidator: (value) => {
          if (!value || value <= 0) {
            return "Please enter a valid amount!";
          }
          if (parseFloat(value) > parseFloat(maxUsdAmount)) {
            return `Insufficient BNB balance! Max: $${maxUsdAmount}`;
          }
        },
      });

      if (amount) {
        await confirmAndProcessPayment(parseFloat(amount), "bnb", bnbPrice);
      }
    } catch (error) {
      setLoading(false);
      console.error("❌ BNB payment failed:", error);
      Swal.fire({
        icon: "error",
        title: "BNB Payment Error",
        text: error.message || "Failed to process BNB payment",
        confirmButtonColor: "#0f7a4a",
      });
    }
  };

  const processUSDTPayment = async () => {
    try {
      setLoading(true);

      const walletAccount = realWalletService.getAccount();

      // ✅ Fetch real USDT balance from blockchain
      const usdtBalanceResult = await bnbTokenUtils.getUSDTBalance(walletAccount);

      if (!usdtBalanceResult.success) {
        throw new Error("Failed to fetch USDT balance");
      }

      const usdtBalance = parseFloat(usdtBalanceResult.balance);
      const maxUsdAmount = usdtBalance.toFixed(2);

      setLoading(false);

      // Step 5: Show amount input for USDT
      const { value: amount } = await Swal.fire({
        title: "Add Balance with USDT",
        background: '#1A1A1A',
        color: '#fff',
        html: `
          <div class="text-left space-y-4 mb-4">
            <div class="bg-black p-4 rounded-xl border border-white/5">
              <h4 class="font-black text-green-500 uppercase text-xs mb-3 tracking-widest">💚 USDT Payment</h4>
              <div class="space-y-2 text-[10px] font-bold uppercase tracking-widest">
                <div class="flex justify-between">
                  <span class="text-gray-500">Connected Wallet:</span>
                  <span class="text-white">${walletAccount.substring(0, 6)}...${walletAccount.substring(-4)}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-gray-500">USDT Balance:</span>
                  <span class="text-white">${usdtBalance} USDT</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-gray-500">Available:</span>
                  <span class="text-green-500">$${maxUsdAmount}</span>
                </div>
              </div>
              <div class="mt-3 p-2 bg-yellow-500/10 rounded border border-yellow-500/20">
                <p class="text-[9px] text-yellow-500 font-black uppercase tracking-tighter">⚠️ Ensure you have BNB for gas fees</p>
              </div>
            </div>
          </div>
        `,
        input: "number",
        inputLabel: `Enter Amount (Max: $${maxUsdAmount} USD)`,
        inputPlaceholder: "Enter USD amount",
        showCancelButton: true,
        confirmButtonColor: "#FCE270",
        confirmButtonText: '<span style="color: #000; font-weight: 900;">DEPOSIT USDT</span>',
        cancelButtonColor: "#2A2A2A",
        inputValidator: (value) => {
          if (!value || value <= 0) {
            return "Please enter a valid amount!";
          }
          if (parseFloat(value) > parseFloat(maxUsdAmount)) {
            return `Insufficient USDT balance! Max: $${maxUsdAmount}`;
          }
        },
      });

      if (amount) {
        await confirmAndProcessPayment(parseFloat(amount), "usdt", 1);
      }
    } catch (error) {
      setLoading(false);
      console.error("❌ USDT payment failed:", error);
      Swal.fire({
        icon: "error",
        title: "USDT Payment Error",
        text: error.message || "Failed to process USDT payment",
        confirmButtonColor: "#0f7a4a",
      });
    }
  };

  const confirmAndProcessPayment = async (
    addAmount,
    paymentMethod,
    tokenPrice,
  ) => {
    try {
      setLoading(true);

      const walletAccount = realWalletService.getAccount();
      const tokenRequired = (addAmount / tokenPrice).toFixed(6);
      const tokenSymbol = paymentMethod === "bnb" ? "BNB" : "USDT";

      // Step 7: Confirm transaction
      const confirmResult = await Swal.fire({
        title: "Confirm Transaction",
        background: '#1A1A1A',
        color: '#fff',
        html: `
          <div class="text-left space-y-3">
            <div class="bg-black p-4 rounded-xl border border-white/5">
              <p class="text-xs flex justify-between"><span class="text-gray-500 uppercase font-black">Amount:</span> <span class="text-[#FCE270] font-black">$${addAmount} USD</span></p>
              <p class="text-xs flex justify-between mt-2"><span class="text-gray-500 uppercase font-black">Required:</span> <span class="text-white font-black">${tokenRequired} ${tokenSymbol}</span></p>
              <p class="text-xs flex justify-between mt-2 pt-2 border-t border-white/5"><span class="text-gray-500 uppercase font-black">Network:</span> <span class="text-blue-400 font-black tracking-widest">BSC MAINNET</span></p>
            </div>
          </div>
        `,
        icon: "question",
        showCancelButton: true,
        confirmButtonColor: "#FCE270",
        confirmButtonText: `<span style="color: #000; font-weight: 900;">CONFIRM SEND</span>`,
        cancelButtonColor: "#2A2A2A",
        cancelButtonText: "CANCEL",
      });

      if (confirmResult.isConfirmed) {
        // Step 8: Process payment
        let paymentResult;

        if (paymentMethod === "bnb") {
          paymentResult = await realWalletService.sendPayment(addAmount);
        } else {
          paymentResult = await realWalletService.sendUSDTPayment(addAmount);
        }

        if (paymentResult.success) {
          // Step 10: Update platform balance via backend API
          console.log('💰 Updating balance via backend API...');

          const response = await walletAPI.addBalance(addAmount);

          if (response.data.success) {
            const newBalance = response.data.newBalance;
            setBalance(newBalance);

            // Notify other components
            window.dispatchEvent(
              new CustomEvent("balanceUpdate", {
                detail: { balance: newBalance },
              }),
            );

            console.log('✅ Balance updated in database:', newBalance);

            // Step 11: Success message
            Swal.fire({
              icon: "success",
              title: "Balance Added Successfully! 🎉",
              background: '#1A1A1A',
              color: '#fff',
              html: `
                <div class="text-left space-y-2">
                  <div class="bg-black p-4 rounded-xl border border-white/10 mb-2">
                    <p class="text-[10px] text-gray-500 uppercase font-black">Amount Added</p>
                    <p class="text-2xl font-black text-[#FCE270] tracking-tighter">$${addAmount}</p>
                  </div>
                  <p class="text-[10px] text-gray-500 uppercase font-black tracking-widest mt-4">Transaction Details</p>
                  <p class="text-xs bg-black/40 p-2 rounded border border-white/5 text-gray-400 break-all font-mono">${paymentResult.txHash}</p>
                  <p class="text-xs text-green-500 font-bold uppercase tracking-widest mt-2">✅ Processed on Blockchain</p>
                </div>
              `,
              confirmButtonColor: "#FCE270",
              confirmButtonText: '<span style="color: #000; font-weight: 900;">DONE</span>',
            });
          } else {
            throw new Error('Failed to update balance in database');
          }
        } else {
          throw new Error(paymentResult.error || "Transaction failed");
        }

        // Refresh data
        fetchBalance();
        fetchTransactions();
      }
    } catch (error) {
      console.error("❌ Payment processing failed:", error);
      Swal.fire({
        icon: "error",
        title: "Transaction Failed",
        text: error.message || "Failed to process payment. Please try again.",
        confirmButtonColor: "#0f7a4a",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleWithdraw = async () => {
    // Step 1: Check if user has sufficient balance
    if (balance <= 0) {
      Swal.fire({
        icon: "warning",
        title: "Insufficient Balance",
        text: "You don't have enough balance to withdraw",
        confirmButtonColor: "#0f7a4a",
      });
      return;
    }

    // Step 2: Show loading while preparing form
    Swal.fire({
      title: 'Loading...',
      text: 'Preparing withdrawal form',
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });

    // Small delay for smooth transition
    await new Promise(resolve => setTimeout(resolve, 500));

    // Step 3: Show beautiful withdrawal modal
    const { value: formValues } = await Swal.fire({
      title: '<strong>💰 Withdraw Funds</strong>',
      html: `
        <div style="padding: 5px;">
          <!-- Balance Info -->
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 12px; border-radius: 10px; color: white; margin-bottom: 12px;">
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <div>
                <p style="font-size: 11px; opacity: 0.9; margin: 0;">Available Balance</p>
                <p style="font-size: 20px; font-weight: bold; margin: 5px 0 0 0;">$${balance.toFixed(2)}</p>
              </div>
              <div style="font-size: 28px;">💵</div>
            </div>
          </div>

          <!-- Amount Input -->
          <div style="margin-bottom: 12px;">
            <label style="display: block; font-weight: 600; margin-bottom: 6px; color: #374151; font-size: 13px; text-align: left;">
              💵 Withdrawal Amount
            </label>
            <input 
              id="amount" 
              class="swal2-input" 
              placeholder="Min: $10" 
              type="number"
              min="10"
              max="${balance}"
              step="0.01"
              style="width: 100%; margin: 0; padding: 10px; border: 2px solid #e5e7eb; border-radius: 8px; font-size: 15px; box-sizing: border-box;"
            >
          </div>

          <!-- Wallet Address Input -->
          <div style="margin-bottom: 12px;">
            <label style="display: block; font-weight: 600; margin-bottom: 6px; color: #374151; font-size: 13px; text-align: left;">
              🔐 BSC Wallet Address
            </label>
            <input 
              id="wallet" 
              class="swal2-input" 
              placeholder="0x..." 
              type="text"
              style="width: 100%; margin: 0; padding: 10px; border: 2px solid #e5e7eb; border-radius: 8px; font-size: 13px; font-family: monospace; box-sizing: border-box; word-break: break-all;"
            >
            <p style="font-size: 10px; color: #6b7280; margin: 4px 0 0 0; text-align: left;">
              ℹ️ Enter your BSC wallet address
            </p>
          </div>

          <!-- Info Box -->
          <div style="background: #fef3c7; border: 2px solid #fbbf24; padding: 10px; border-radius: 8px;">
            <p style="font-size: 11px; color: #92400e; margin: 0; line-height: 1.4; text-align: left;">
              ⚠️ <strong>Important:</strong> Withdrawals processed in 24-48 hours
            </p>
          </div>
        </div>
      `,
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonColor: "#0f7a4a",
      cancelButtonColor: "#6b7280",
      confirmButtonText: '✅ Request',
      cancelButtonText: '❌ Cancel',
      width: window.innerWidth < 640 ? '95%' : '550px',
      padding: '15px',
      customClass: {
        popup: 'animated-popup',
        title: 'custom-title',
        confirmButton: 'custom-confirm-btn',
        cancelButton: 'custom-cancel-btn'
      },
      preConfirm: () => {
        const amount = document.getElementById("amount").value;
        const wallet = document.getElementById("wallet").value;

        if (!amount || parseFloat(amount) <= 0) {
          Swal.showValidationMessage("❌ Please enter a valid amount");
          return false;
        }

        if (parseFloat(amount) < 10) {
          Swal.showValidationMessage("❌ Minimum withdrawal is $10");
          return false;
        }

        if (parseFloat(amount) > balance) {
          Swal.showValidationMessage(`❌ Insufficient balance. Available: $${balance.toFixed(2)}`);
          return false;
        }

        if (!wallet || wallet.trim() === '') {
          Swal.showValidationMessage("❌ Please enter wallet address");
          return false;
        }

        if (!wallet.startsWith("0x")) {
          Swal.showValidationMessage("❌ Wallet address must start with 0x");
          return false;
        }

        if (wallet.length !== 42) {
          Swal.showValidationMessage("❌ Invalid wallet address length");
          return false;
        }

        return [parseFloat(amount), wallet.trim()];
      },
    });

    if (formValues) {
      const [amount, walletAddress] = formValues;

      // Show processing loader
      Swal.fire({
        title: '🔄 Processing...',
        html: '<p>Submitting your withdrawal request</p>',
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        }
      });

      setLoading(true);

      try {
        console.log('📤 Sending withdrawal request:', { amount, walletAddress });
        console.log('🔑 Token:', localStorage.getItem('token') ? 'Present' : 'Missing');
        console.log('🎯 API URL:', import.meta.env.VITE_API_URL);

        const response = await walletAPI.withdraw(amount, walletAddress);

        console.log('✅ Withdrawal response:', response);
        console.log('✅ Response data:', response.data);

        // Update balance immediately
        const newBalance = balance - amount;
        setBalance(newBalance);

        window.dispatchEvent(
          new CustomEvent("balanceUpdate", {
            detail: { balance: newBalance },
          })
        );

        // Success SweetAlert
        Swal.fire({
          icon: "success",
          title: '<strong>🎉 Success!</strong>',
          html: `
            <div style="padding: 5px;">
              <!-- Success Header -->
              <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 12px; border-radius: 10px; color: white; margin-bottom: 12px;">
                <p style="font-size: 12px; margin: 0; opacity: 0.9;">Withdrawal Amount</p>
                <p style="font-size: 22px; font-weight: bold; margin: 5px 0;">$${amount.toFixed(2)}</p>
              </div>

              <!-- Details -->
              <div style="background: #f9fafb; padding: 12px; border-radius: 8px; margin-bottom: 12px;">
                <p style="font-size: 12px; margin: 0 0 6px 0; color: #374151; text-align: left;"><strong>🔐 To Wallet:</strong></p>
                <p style="font-size: 10px; font-family: monospace; background: white; padding: 8px; border-radius: 6px; word-break: break-all; border: 1px solid #e5e7eb; margin: 0;">
                  ${walletAddress}
                </p>
              </div>

              <!-- Status -->
              <div style="background: #fef3c7; border: 2px solid #fbbf24; padding: 10px; border-radius: 8px; margin-bottom: 12px;">
                <p style="font-size: 11px; color: #92400e; margin: 0; text-align: left;"><strong>📄 Status:</strong> Pending</p>
                ${response.data.withdrawalId ? `<p style="font-size: 10px; color: #92400e; margin: 4px 0 0 0; text-align: left;"><strong>ID:</strong> ${response.data.withdrawalId}</p>` : ''}
              </div>

              <!-- Info Cards -->
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 12px;">
                <div style="background: #dbeafe; padding: 10px; border-radius: 8px; text-align: center;">
                  <p style="font-size: 10px; color: #1e40af; margin: 0;">New Balance</p>
                  <p style="font-size: 16px; font-weight: bold; color: #1e40af; margin: 4px 0 0 0;">$${newBalance.toFixed(2)}</p>
                </div>
                <div style="background: #fce7f3; padding: 10px; border-radius: 8px; text-align: center;">
                  <p style="font-size: 10px; color: #be185d; margin: 0;">Time</p>
                  <p style="font-size: 16px; font-weight: bold; color: #be185d; margin: 4px 0 0 0;">24-48h</p>
                </div>
              </div>

              <!-- Success Message -->
              <div style="background: #d1fae5; border: 2px solid #10b981; padding: 10px; border-radius: 8px;">
                <p style="font-size: 11px; color: #065f46; margin: 0; line-height: 1.5; text-align: left;">
                  ✅ Request submitted!<br>
                  📧 You'll be notified once processed.
                </p>
              </div>
            </div>
          `,
          confirmButtonColor: "#0f7a4a",
          confirmButtonText: '✅ Done',
          width: window.innerWidth < 640 ? '95%' : '550px',
          padding: '15px'
        });

        fetchBalance();
        fetchProfit();
        fetchTransactions();

      } catch (error) {
        console.error('❌ Withdrawal error:', error);
        console.error('❌ Error details:', error.response);

        const errorData = error.response?.data;
        const errorMessage = errorData?.message || error.message || "Withdrawal failed";
        const errorDetails = errorData?.error || "";

        let errorTitle = "❌ Withdrawal Failed";
        let errorHtml = '';

        if (errorMessage.includes('Invalid wallet address format')) {
          errorTitle = "❌ Invalid Address";
          errorHtml = `
            <div style="padding: 5px;">
              <div style="background: #fee2e2; border: 2px solid #ef4444; padding: 12px; border-radius: 8px; margin-bottom: 12px;">
                <p style="font-size: 12px; color: #991b1b; margin: 0; font-weight: 600; text-align: left;">${errorMessage}</p>
                ${errorDetails ? `<p style="font-size: 11px; color: #991b1b; margin: 6px 0 0 0; text-align: left;">${errorDetails}</p>` : ''}
              </div>
              <div style="background: #dbeafe; border: 2px solid #3b82f6; padding: 12px; border-radius: 8px;">
                <p style="font-size: 12px; color: #1e40af; margin: 0 0 8px 0; font-weight: 600; text-align: left;">📝 Valid Format:</p>
                <ul style="font-size: 11px; color: #1e40af; margin: 0; padding-left: 18px; line-height: 1.6; text-align: left;">
                  <li>Start with <code>0x</code></li>
                  <li>42 characters long</li>
                  <li>Example: <code>0x742d...f0bEb</code></li>
                </ul>
              </div>
            </div>
          `;
        } else if (errorMessage.includes('zero address')) {
          errorTitle = "❌ Invalid Address";
          errorHtml = `
            <div style="padding: 5px;">
              <div style="background: #fee2e2; border: 2px solid #ef4444; padding: 12px; border-radius: 8px;">
                <p style="font-size: 12px; color: #991b1b; margin: 0; text-align: left;">🚫 Cannot use zero address</p>
                <p style="font-size: 11px; color: #991b1b; margin: 6px 0 0 0; text-align: left;">Enter a valid wallet address</p>
              </div>
            </div>
          `;
        } else if (errorMessage.includes('Insufficient balance')) {
          errorTitle = "❌ Low Balance";
          errorHtml = `
            <div style="padding: 5px;">
              <div style="background: #fef3c7; border: 2px solid #f59e0b; padding: 12px; border-radius: 8px;">
                <p style="font-size: 12px; color: #92400e; margin: 0; font-weight: 600; text-align: left;">${errorMessage}</p>
                <p style="font-size: 11px; color: #92400e; margin: 8px 0 0 0; text-align: left;">Balance: <strong>$${balance.toFixed(2)}</strong></p>
                <p style="font-size: 11px; color: #92400e; margin: 6px 0 0 0; text-align: left;">💰 Add funds first</p>
              </div>
            </div>
          `;
        } else {
          errorHtml = `
            <div style="padding: 5px;">
              <div style="background: #fee2e2; border: 2px solid #ef4444; padding: 12px; border-radius: 8px; margin-bottom: 12px;">
                <p style="font-size: 12px; color: #991b1b; margin: 0; font-weight: 600; text-align: left;">${errorMessage}</p>
                ${errorDetails ? `<p style="font-size: 11px; color: #991b1b; margin: 6px 0 0 0; text-align: left;">${errorDetails}</p>` : ''}
              </div>
              <div style="background: #f3f4f6; padding: 10px; border-radius: 8px;">
                <p style="font-size: 10px; color: #4b5563; margin: 0; text-align: left;">📞 Contact support if issue persists</p>
              </div>
            </div>
          `;
        }

        Swal.fire({
          icon: "error",
          title: errorTitle,
          html: errorHtml,
          confirmButtonColor: "#ef4444",
          confirmButtonText: '🔄 Try Again',
          width: window.innerWidth < 640 ? '95%' : '550px',
          padding: '15px'
        });
      }
      setLoading(false);
    }
  };

  return (
    <div className="space-y-5 pb-16 px-2 bg-black min-h-screen font-sans pt-3">
      {/* Simple Header */}


      <div className="mb-1">
        <WalletStatus />
      </div>

      {/* Simple Balance Card */}
      <div className="bg-[#1A1A1A] p-6 rounded-[28px] border border-white/5 relative overflow-hidden mt-4">
        <div className="absolute top-0 right-0 w-24 h-24 bg-[#FCE270]/5 rounded-full -mr-12 -mt-12 blur-2xl"></div>
        <p className="text-[14px] text-white font-semibold tracking-widest mb-1">Available Balance</p>
        <h3 className="text-[34px] font-black text-white tracking-tighter">

          {balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
        </h3>
        <div className="flex items-center gap-4 mt-4 text-[11px] font-bold">
          <p className="text-green-500">+$ {profit.toFixed(2)} Profit</p>
          <p className="text-gray-500">● Active</p>
        </div>
      </div>

      {/* Side-by-Side Action Buttons */}
      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={handleAddBalance}
          disabled={loading}
          className="flex items-center justify-center gap-2 bg-[#FCE270] text-black h-14 rounded-2xl font-black text-sm uppercase tracking-wider active:scale-95 transition-all shadow-lg shadow-[#FCE270]/5"
        >
          <FaPlus size={12} /> Add
        </button>
        <button
          onClick={handleWithdraw}
          disabled={loading}
          className="flex items-center justify-center gap-2 bg-white/5 text-white h-14 rounded-2xl font-black text-sm uppercase tracking-wider border border-white/10 active:scale-95 transition-all"
        >
          <FaArrowUp size={12} /> Withdraw
        </button>
      </div>

      {/* Simple Transaction List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-1">
          <h3 className="font-semibold text-[14px] text-gray-300 tracking-wide">Recent Activity</h3>
          <button onClick={fetchTransactions} className="text-[#FCE270] text-[12px] font-semibold">Refresh</button>
        </div>

        <div className="bg-[#1A1A1A] rounded-[24px] border border-white/5 p-2 space-y-1">
          {transactions.length > 0 ? (
            transactions.slice(0, 5).map((transaction, index) => {
              const isMoneyAdded =
                transaction.type === "credit" ||
                transaction.type === "add" ||
                transaction.description?.toLowerCase().includes("added") ||
                transaction.description?.toLowerCase().includes("deposit");

              return (
                <div key={index} className="flex items-center justify-between p-3.5 hover:bg-white/[0.02] rounded-xl transition-colors">
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${isMoneyAdded ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'
                      }`}>
                      {isMoneyAdded ? <FaPlus size={12} /> : <FaMinus size={12} />}
                    </div>
                    <div className="min-w-0">
                      <p className="text-[13px] font-bold text-gray-200 truncate max-w-[120px]">
                        {transaction.description || 'Transaction'}
                      </p>
                      <p className="text-[9px] text-gray-500 font-bold uppercase tracking-widest">
                        {new Date(transaction.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`text-[15px] font-black tracking-tight ${isMoneyAdded ? 'text-green-500' : 'text-red-500'
                      }`}>
                      {isMoneyAdded ? '+' : '-'}${transaction.amount.toFixed(2)}
                    </p>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="py-10 text-center">
              <p className="text-gray-600 text-[10px] font-black uppercase tracking-widest">No activity</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Wallet;
