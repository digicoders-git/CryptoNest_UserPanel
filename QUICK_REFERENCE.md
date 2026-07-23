# CryptoNest - Quick Reference Guide

## 🎯 Main Files & Their Purpose

| File | Purpose | Key Function |
|------|---------|--------------|
| `main.jsx` | App entry point | Initialize Wagmi, Query Client, Router |
| `App.jsx` | Root component | Render Routes |
| `Page/Routes.jsx` | Route definitions | Define all app routes |
| `config/environment.js` | Configuration | Network, API URL, prices |
| `services/api.js` | API endpoints | All backend API calls |
| `services/realWalletService.js` | Wallet logic | Connect, send, validate TX |
| `services/firebaseService.js` | Notifications | Push notifications |
| `Dashbord/MainDashBord.jsx` | Layout | Header, nav, drawer |
| `Dashbord/Dashboard.jsx` | Main page | Stats, balance, activity |
| `Dashbord/Wallet.jsx` | Balance page | Deposit, withdraw |

---

## 🔑 Key Functions & Their Flow

### 1. **Authentication**

```javascript
// LOGIN
authAPI.login(email, password)
→ Backend validates
→ Returns { token, user }
→ localStorage.setItem('token', token)
→ Navigate to /dashbord

// REGISTER
authAPI.register(userData)
→ Backend creates user
→ Auto login
→ Navigate to /dashbord

// LOGOUT
localStorage.clear()
→ Navigate to /login
```

### 2. **Wallet Connection**

```javascript
// CONNECT WALLET
realWalletService.connectWallet()
→ modal.open()
→ User selects wallet
→ subscribeAccount() fires
→ Extract account address
→ Verify BSC Mainnet (chain 56)
→ Return { success, account, chainId }

// CHECK CONNECTION
realWalletService.isWalletConnected()
→ Return: boolean

// GET ACCOUNT
realWalletService.getAccount()
→ Return: "0x742d..."

// GET CHAIN ID
realWalletService.getChainId()
→ Return: 56 (BSC) or other
```

### 3. **Balance Management**

```javascript
// FETCH BALANCE
walletAPI.getBalance()
→ GET /wallet/balance
→ Return { balance: X }

// ADD BALANCE (After crypto payment)
walletAPI.addBalance(amount)
→ POST /wallet/add-balance
→ Backend adds to balance
→ Return { newBalance }

// WITHDRAW
walletAPI.withdraw(amount, walletAddress)
→ POST /wallet/withdraw
→ Backend creates withdrawal request
→ Pending 24-48 hours
→ Return { withdrawalId }
```

### 4. **Payment Processing**

```javascript
// SEND BNB PAYMENT
realWalletService.sendPayment(amountInUSD)
→ Calculate BNB needed: usd / price
→ sendTransaction() from Wagmi
→ User confirms in wallet
→ Return { txHash, success }

// SEND USDT PAYMENT
realWalletService.sendUSDTPayment(amountInUSD)
→ encodeFunctionData() for USDT transfer
→ sendTransaction() to USDT contract
→ User confirms in wallet
→ Return { txHash, success }

// VALIDATE TRANSACTION
realWalletService.validateTransaction(txHash)
→ waitForTransactionReceipt()
→ Wait for blockchain confirmation
→ Return { status: 'confirmed'/'failed' }
```

### 5. **Dashboard Data**

```javascript
// FETCH DASHBOARD
userAPI.getDashboard()
→ GET /user/dashboard
→ Return { stats: {...} }

// FETCH TEAM
userAPI.getTeam()
→ GET /user/team
→ Return { team: [...] }

// FETCH TRANSACTIONS
userAPI.getTransactions()
→ GET /user/transactions
→ Return { transactions: [...] }

// FETCH NFTs
nftAPI.getMyNFTs()
→ GET /nft/my-nfts
→ Return { nfts: [...], stats: {...} }
```

---

## 📊 API Endpoints Summary

### Auth Endpoints
```
POST /auth/register       - Create account
POST /auth/login          - Login user
POST /auth/check-email    - Check if email exists
GET  /auth/Getuser        - Get all users (admin)
```

### User Endpoints
```
GET  /user/profile        - User profile info
PUT  /user/update-profile - Update profile
GET  /user/dashboard      - Dashboard stats
GET  /user/team           - Referral team
GET  /user/transactions   - User transactions
GET  /user/mlm-tree       - MLM tree data
GET  /user/mlm-earnings   - MLM earnings
```

### Wallet Endpoints
```
POST /wallet/activate      - Activate account (payment)
GET  /wallet/balance       - Get balance
GET  /wallet/transactions  - Wallet history
POST /wallet/withdraw      - Request withdrawal
POST /wallet/record-payment - Record payment
POST /wallet/add-balance   - Add balance after crypto
```

### NFT Endpoints
```
GET  /nft/status          - NFT system status
GET  /nft/marketplace     - All available NFTs
GET  /nft/my-nfts         - User's NFTs
POST /nft/buy-prelaunch   - Buy pre-launch NFT
POST /nft/buy-trading     - Buy trading NFT
POST /nft/sell/:nftId     - Sell NFT
POST /nft/stake           - Stake NFT
POST /nft/burn            - Burn NFT
```

### Package Endpoints
```
GET  /package/plans       - Available plans
POST /package/upgrade     - Upgrade plan
GET  /package/current     - Current user plan
```

### MLM Endpoints
```
GET  /mlm/hierarchy       - Complete hierarchy
GET  /mlm/user/:id/tree   - User's tree
GET  /mlm/user/:id/stats  - User's stats
GET  /mlm/root-users      - Root users list
```

### Notification Endpoints
```
POST /notifications/token - Register FCM token
GET  /notifications/active - Get active notifications
POST /contacts            - Create contact
```

---

## 🔄 Component State Management

### Dashboard.jsx States
```javascript
stats: {
  balance,
  totalEarnings,
  teamSize,
  activeTeamMembers,
  totalTransactions,
  recentTransactions: [],
  nftCount
}

nftStats: {
  total,
  holding,
  sold,
  totalProfit
}

tokenProfit     // NFT sales profit
tradingIncome   // Parent bonus
referralIncome  // Direct referral
currentPackage  // User's plan

loading         // Initial load
balanceLoaded   // Balance fetched
refreshing      // Pull-to-refresh active
```

### Wallet.jsx States
```javascript
balance         // User's balance
profit          // Total profit
loading         // Processing payment
```

### MainDashBord.jsx States
```javascript
showMenu        // Side drawer open
```

---

## 🎨 Styling Guide

### Color System
```javascript
Primary:     #FCE270  (Yellow/Gold)
Background:  #0A0A0A  (Dark)
Dark Card:   #1A1A1A  (Slightly lighter)
Text:        #FFFFFF  (White)
Secondary:   #6B7280  (Gray)

Accents:
- Green:     #10B981  (Success)
- Red:       #EF4444  (Error)
- Blue:      #3B82F6  (Info)
- Purple:    #A855F7  (NFT)
```

### Common Classes
```
// Cards
bg-[#1A1A1A] p-6 rounded-[28px] border border-white/5

// Buttons
bg-[#FCE270] text-black font-black rounded-2xl

// Text
text-white font-bold tracking-wider uppercase

// Icons
text-[#FCE270] size-16
```

---

## 🚀 Common Code Snippets

### Fetch with Error Handling
```javascript
try {
  const response = await userAPI.getDashboard()
  setData(response.data)
} catch (error) {
  console.error('Error:', error)
  Swal.fire({
    icon: 'error',
    title: 'Error',
    text: error.response?.data?.message || 'Something went wrong',
    background: '#1A1A1A',
    color: '#fff'
  })
}
```

### Check if Wallet Connected
```javascript
if (!realWalletService.isWalletConnected()) {
  Swal.fire({
    icon: 'warning',
    title: 'Wallet Not Connected',
    text: 'Please connect wallet first'
  })
  return
}
```

### Update Balance Across App
```javascript
// After payment succeeds
setBalance(newBalance)

// Notify other components
window.dispatchEvent(
  new CustomEvent('balanceUpdate', {
    detail: { balance: newBalance }
  })
)

// Listen in other components
window.addEventListener('balanceUpdate', (event) => {
  setBalance(event.detail.balance)
})
```

### Show Loading Popup
```javascript
Swal.fire({
  title: 'Loading...',
  allowOutsideClick: false,
  didOpen: () => {
    Swal.showLoading()
  }
})
```

### Show Success Message
```javascript
Swal.fire({
  icon: 'success',
  title: 'Success!',
  text: 'Operation completed',
  background: '#1A1A1A',
  color: '#fff',
  confirmButtonColor: '#FCE270'
})
```

---

## 🔐 Security Checklist

- ✅ Token stored in localStorage (consider moving to secure storage)
- ✅ Private keys never stored in browser (wallet handles it)
- ✅ All API calls authenticated with Bearer token
- ✅ Password hashed on backend
- ✅ Protected routes check token before rendering
- ✅ USDT transfer only to verified company wallet
- ✅ Gas fees paid by user (not app)
- ✅ Blockchain validates all transactions

---

## 📱 Mobile Responsive Breakpoints

```
- Mobile: < 640px
- Tablet: 640px - 1024px
- Desktop: > 1024px

Max width: 420px (mobile-first design)
```

---

## 🐛 Debugging Tips

### Check Connection Status
```javascript
console.log(realWalletService.isWalletConnected())
console.log(realWalletService.getAccount())
console.log(realWalletService.getChainId())
```

### Check Token
```javascript
console.log(localStorage.getItem('token'))
```

### Check Balance in Console
```javascript
fetch(`${import.meta.env.VITE_API_URL}/api/wallet/balance`, {
  headers: {
    'Authorization': `Bearer ${localStorage.getItem('token')}`
  }
}).then(r => r.json()).then(console.log)
```

### Network Issues
```javascript
// Check which network in MetaMask
console.log(window.ethereum?.chainId) // Returns hex chainId

// Expected: 0x38 (56 in decimal = BSC)
```

---

## 📚 Important Environment Variables

```
VITE_APP_ENV              = production
VITE_API_URL              = http://localhost:5000
VITE_COMPANY_WALLET       = 0x...
VITE_NETWORK_TYPE         = bnb
VITE_REOWN_PROJECT_ID     = 5af094...
VITE_FIREBASE_API_KEY     = AIzaSy...
VITE_FIREBASE_PROJECT_ID  = collegepanel-1027b
```

---

## 🔗 External APIs Used

### Binance API (Price Feed)
```
GET https://api.binance.com/api/v3/ticker/price?symbol=BNBUSDT
Response: { symbol: "BNBUSDT", price: "774.50" }
```

### Firebase (Notifications)
```
POST /send-notification
Headers: Authorization: Bearer <FCM Key>
Body: { token, notification: { title, body } }
```

### Blockchain (Wagmi/Viem)
```
- Read balance: getBalance()
- Send transaction: sendTransaction()
- Wait for receipt: waitForTransactionReceipt()
```

---

## ✅ Common Issues & Solutions

| Issue | Solution |
|-------|----------|
| "Wallet not connected" | Call `realWalletService.connectWallet()` |
| "Wrong network" | Use wallet to switch to BSC (chain 56) |
| "Insufficient balance" | Add more balance via Deposit |
| "TX not confirmed" | Wait longer or check block explorer |
| "404 API error" | Check backend is running |
| "Token expired" | User needs to login again |
| "No notifications" | Check browser notification permission |

---

## 📞 Key Contact Points

**Backend API:** `http://localhost:5000/api`

**Block Explorer:** `https://bscscan.com` (Search by TX hash)

**Wallet Connection:** WalletConnect modal opens on demand

**Notifications:** Firebase Cloud Messaging

---

## 🎓 Learning Path

1. Understand authentication flow (Login.jsx)
2. Learn wallet connection (realWalletService.js)
3. Study payment process (Wallet.jsx)
4. Understand data fetching (Dashboard.jsx)
5. Learn component state management
6. Study routing and navigation
7. Learn event system for balance updates
8. Understand API interceptors
9. Study error handling patterns
10. Learn debugging techniques

---

**Last Updated:** 2024
**Version:** 1.0
**Status:** Production Ready ✅

