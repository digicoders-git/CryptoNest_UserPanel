# CryptoNest User Panel - Code Flow Explanation (Hinglish)

## 🎯 Overview
Yeh ek React-based cryptocurrency trading platform hai jaha users NFTs buy/sell kar sakte hain, wallet connect kar sakte hain, aur passive income kama sakte hain.

---

## 📱 App ka Architecture Flow

```
main.jsx
   ↓
React App Initialize (Wagmi + Query Client)
   ↓
App.jsx → Routes.jsx
   ↓
User Home Page (Welcome/Login/Register)
   ↓
MainDashBord.jsx (Authenticated)
   ↓
Sub-pages (Dashboard, Wallet, NFTs, etc.)
```

---

## 🔄 Step-by-Step Flow Explanation

### 1️⃣ **APP INITIALIZATION** (`main.jsx`)

```javascript
// 1. Wagmi Config Load hota hai (Wallet Connection ke liye)
WagmiProvider config={realWalletService.wagmiConfig}

// 2. React Query Client setup (Data caching ke liye)
QueryClientProvider

// 3. React Router Setup
BrowserRouter → Routes render
```

**Kya hota hai:** App start hone ke saath Wallet connection ready ho jata hai aur API calls optimize hoti hain.

---

### 2️⃣ **ENVIRONMENT CONFIGURATION** (`config/environment.js`)

```javascript
envConfig = {
  NETWORK_TYPE: 'bnb' (BSC Mainnet use kar rahe hain)
  API_URL: 'http://localhost:5000'
  COMPANY_WALLET: '0x9a1752939449bea35ca305fcb0c2f044c490e9e3'
  
  // Network settings automatically set hoti hain
  networks: [BSC (56), Sepolia]
  tokenPriceUSD: 774 (BNB ka current price)
}
```

**Use:** Pura app ko consistent settings provide karta hai.

---

### 3️⃣ **USER AUTHENTICATION FLOW**

#### A) **Registration** (`Singhup.jsx`)
```
User fills form → API call /auth/register
                    ↓
           User created in database
                    ↓
           Auto Login hota hai
                    ↓
           Dashboard redirect
```

#### B) **Login** (`Login.jsx`)
```
Email + Password → API call /auth/login
                    ↓
              Token milta hai
                    ↓
         localStorage mein save hota hai
                    ↓
        FCM notification permission request
                    ↓
        Dashboard redirect
```

**Token Usage:**
```javascript
// api.js mein automatically add hota hai
api.interceptors.request.use((config) => {
  config.headers.Authorization = `Bearer ${token}`
})
```

---

### 4️⃣ **WALLET CONNECTION FLOW** (`realWalletService.js`)

```
User clicks "Connect Wallet"
         ↓
WalletConnect Modal open hota hai
         ↓
User MetaMask/Trust Wallet select karta hai
         ↓
Wallet permission request
         ↓
connectWallet() function
         ↓
Account address + Chain ID capture hota hai
         ↓
BSC Mainnet (Chain 56) verify hota hai
         ↓
Wallet connected! ✅
```

**Code Flow:**
```javascript
async connectWallet() {
  if (connectionPromise) return; // Multiple calls prevent
  
  // Account subscription setup
  modal.subscribeAccount((account) => {
    this.account = account.address
    this.isConnected = true
    this.chainId = account.chainId
  })
  
  modal.open() // User select karta hai
}
```

---

### 5️⃣ **DASHBOARD MAIN FLOW** (`MainDashBord.jsx` → `Dashboard.jsx`)

```
MainDashBord (Layout)
     ↓
┌─────────────────────────────────────┐
│      Header (Top Navigation)         │
│   - Current Page Name                │
│   - Notification Bell                │
│   - Profile Icon                     │
└─────────────────────────────────────┘
     ↓
┌─────────────────────────────────────┐
│      Main Content (Outlet)           │
│   - Dashboard (Active by default)    │
│   - Wallet Page                      │
│   - NFT Pages                        │
│   - Team Pages                       │
└─────────────────────────────────────┘
     ↓
┌─────────────────────────────────────┐
│      Bottom Navigation Bar           │
│   - Exchange (NFT Marketplace)       │
│   - Ledger (Wallet)                  │
│   - Console (Main Dashboard)         │
│   - Refer (My Team)                  │
│   - Profile                          │
└─────────────────────────────────────┘
     ↓
┌─────────────────────────────────────┐
│      Side Drawer (Menu)              │
│   - All navigation links             │
│   - Logout button                    │
└─────────────────────────────────────┘
```

---

### 6️⃣ **DASHBOARD PAGE FLOW** (`Dashboard.jsx`)

```
Component Mount
     ↓
useEffect triggers:
  1. fetchDashboardData() 
  2. fetchNFTStats()
  3. fetchPackageInfo()
  4. fetchLevelEarnings()
  5. fetchTokenProfit()
     ↓
User ka data load hota hai:
  - Balance
  - Team Size
  - NFT Count
  - Income Stats
  - Recent Transactions
     ↓
Pull-to-Refresh support
  - User pull down kar sakta hai
  - Data refresh ho jati hai
     ↓
UI Display:
  - Balance Card (Hero section)
  - Quick Stats (2 columns)
  - Income Grid (Token Profit, Referral, Trading, Sold)
  - Recent Activity List
```

---

### 7️⃣ **WALLET & PAYMENT FLOW** (`Wallet.jsx`)

#### A) **Add Balance (Deposit) Flow**

```
User clicks "Add" button
         ↓
✅ Wallet connected? Check
         ↓
Payment method selection:
  - BNB Payment
  - USDT Payment
         ↓
Amount input modal
         ↓
User amount enter karta hai
         ↓
Confirmation popup
         ↓
Transaction process:
  1. realWalletService.sendPayment() or sendUSDTPayment()
  2. Blockchain mein transaction
  3. walletAPI.addBalance() - Backend update
  4. Balance update in UI
         ↓
Success message with TX hash
```

#### B) **BNB Payment Process**
```javascript
async processBNBPayment() {
  // 1. BNB balance fetch karo
  walletBalance = await realWalletService.getBalance()
  
  // 2. Current BNB price Binance se
  bnbPrice = await envConfig.fetchCurrentBNBPrice()
  
  // 3. Max USD amount calculate
  maxUsdAmount = bnbBalance * bnbPrice
  
  // 4. User se amount lao
  amount = prompt("Enter USD amount")
  
  // 5. Amount convert to BNB
  bnbRequired = amount / bnbPrice
  
  // 6. Transaction send karo
  txHash = await realWalletService.sendPayment(amount)
  
  // 7. Backend mein balance add karo
  await walletAPI.addBalance(amount)
  
  // 8. UI update
  setBalance(newBalance)
}
```

#### C) **USDT Payment Process**
```javascript
async processUSDTPayment() {
  // 1. USDT balance blockchain se fetch
  usdtBalance = await bnbTokenUtils.getUSDTBalance(walletAccount)
  
  // 2. Amount input
  amount = prompt("Enter USD amount")
  
  // 3. USDT transfer transaction
  txHash = await realWalletService.sendUSDTPayment(amount)
  
  // 4. Backend update
  await walletAPI.addBalance(amount)
}
```

#### D) **Withdraw Flow**
```
User clicks "Withdraw"
         ↓
Balance check
         ↓
Withdrawal form:
  - Amount input (Min $10)
  - BSC Wallet Address
         ↓
Validation:
  - Amount valid?
  - Address format valid? (0x...)
  - Address length 42?
         ↓
Confirmation
         ↓
API call: walletAPI.withdraw(amount, address)
         ↓
Request pending (24-48 hours)
         ↓
Success message
```

---

### 8️⃣ **API CALL STRUCTURE** (`services/api.js`)

```javascript
// API endpoints organized by module
authAPI.login()          // User authentication
authAPI.register()       // New user registration

userAPI.getProfile()     // User ka profile data
userAPI.getDashboard()   // Dashboard stats
userAPI.getTeam()        // Referral team
userAPI.getTransactions() // Transaction history

walletAPI.getBalance()   // Current balance
walletAPI.activate()     // Account activate (payment)
walletAPI.withdraw()     // Withdrawal request
walletAPI.addBalance()   // Balance add after crypto payment

nftAPI.getMyNFTs()       // NFT list
nftAPI.buyNFT()          // Buy NFT
nftAPI.sellNFT()         // Sell NFT

packageAPI.getPlans()    // Available plans
packageAPI.upgrade()     // Plan upgrade
```

**Axios Interceptor:**
```javascript
api.interceptors.request.use((config) => {
  // Har request mein token automatically add hota hai
  token = localStorage.getItem('token')
  config.headers.Authorization = `Bearer ${token}`
  return config
})
```

---

### 9️⃣ **BALANCE UPDATE MECHANISM**

```
Balance update kahan se hota hai:

1. Dashboard load → fetchDashboardData()
   ↓
   userAPI.getDashboard() → Backend se balance

2. Wallet page → fetchBalance()
   ↓
   walletAPI.getBalance() → Backend se balance

3. Payment complete → walletAPI.addBalance()
   ↓
   Backend mein balance add hota hai
   ↓
   setBalance(newBalance) → State update
   ↓
   window.dispatchEvent("balanceUpdate") → Other components ko notify

4. Event Listener → Components local update
   ```
   window.addEventListener("balanceUpdate", (event) => {
     setBalance(event.detail.balance)
   })
   ```
```

---

### 🔟 **NOTIFICATION SYSTEM** (`firebaseService.js`)

```
App start
   ↓
requestNotificationPermission()
   ↓
User allow karta hai
   ↓
FCM token generate hota hai
   ↓
Backend ko token bheja jata hai
   ↓
User ko push notifications mil sakte hain
   ↓
Foreground notification → Swal toast popup
Background notification → Browser notification
```

---

## 🛡️ **SECURITY FLOW**

```
Token Storage:
  localStorage.setItem('token', response.data.token)

Token Usage:
  axios interceptor → Har request mein add hota hai

Protected Routes:
  useAuthCheck() → Token verify karta hai
  If no token → Redirect to login

Wallet Security:
  Private keys browser mein nahi store
  MetaMask/Trust Wallet handle karta hai
```

---

## 📊 **DATA FLOW DIAGRAM**

```
┌─────────────────────────────────────────────────────────┐
│              User Interface (React Components)           │
│  Dashboard | Wallet | NFT | Team | Profile              │
└──────────────────────┬──────────────────────────────────┘
                       │
        ┌──────────────┼──────────────┐
        ↓              ↓              ↓
┌──────────────┐ ┌──────────────┐ ┌──────────────┐
│ axios API    │ │ Wagmi Hooks  │ │ Event System │
│ (services)   │ │ (Wallet)     │ │ (Custom)     │
└──────────────┘ └──────────────┘ └──────────────┘
        │              │              │
        └──────────────┼──────────────┘
                       ↓
        ┌──────────────────────────────┐
        │    Backend API Server        │
        │  (Node.js/Express)           │
        │  - /api/auth/*               │
        │  - /api/user/*               │
        │  - /api/wallet/*             │
        │  - /api/nft/*                │
        └──────────────────────────────┘
                       ↓
        ┌──────────────────────────────┐
        │    Database (MongoDB)        │
        │  - Users Collection          │
        │  - Transactions              │
        │  - NFT Records               │
        │  - Balances                  │
        └──────────────────────────────┘
                       ↓
        ┌──────────────────────────────┐
        │  Blockchain Network (BSC)    │
        │  - Wallet Transactions       │
        │  - USDT Transfers            │
        │  - NFT Smart Contracts       │
        └──────────────────────────────┘
```

---

## 🔑 **KEY FEATURES FLOW**

### 1. **Multi-Payment Support**
```
User choice:
  ├─ BNB Payment (Native token)
  │  └─ Real-time price from Binance API
  ├─ USDT Payment (Stablecoin)
  │  └─ Direct USDT transfer from wallet
  └─ Demo Balance (For testing)
```

### 2. **Real-time Balance Sync**
```
Backend balance ← → Frontend balance
  ↑ Update
  │ Event dispatch
  │ All components
```

### 3. **Pull-to-Refresh**
```
User pulls down on dashboard
  ↓
Touch position detect
  ↓
Refresh indicator animate
  ↓
All data re-fetch (Promise.all)
  ↓
Smooth UI update
```

### 4. **MLM/Referral System**
```
User ka team → Level earnings
Level 1: Direct referral bonus
Level 2: Second level commission
Level 3: Third level commission
...and so on
```

---

## 🎨 **UI COMPONENT HIERARCHY**

```
App.jsx
├── Routes.jsx
│   ├── Welcome.jsx (Home page)
│   ├── Login.jsx (Authentication)
│   ├── Singhup.jsx (Registration)
│   └── MainDashBord.jsx (Layout)
│       ├── Header
│       │   ├── Menu button
│       │   ├── Current page name
│       │   ├── Notification bell
│       │   └── Profile icon
│       ├── Main content (Outlet)
│       │   ├── Dashboard.jsx (Stats & activity)
│       │   ├── Wallet.jsx (Balance & transactions)
│       │   ├── MyNFTs.jsx (NFT collection)
│       │   ├── NFTMarketplace.jsx (Trading)
│       │   ├── MyTeam.jsx (Referral list)
│       │   ├── History.jsx (Transactions)
│       │   ├── Profile.jsx (User info)
│       │   └── ... (Other pages)
│       ├── Bottom Navigation Bar
│       │   ├── Exchange
│       │   ├── Ledger
│       │   ├── Console
│       │   ├── Refer
│       │   └── Profile
│       └── Side Drawer Menu
│           ├── Navigation Links
│           └── Logout button
```

---

## 🚀 **COMPLETE USER JOURNEY**

```
1. Welcome Page
   ↓
2. Sign Up / Login
   ↓
3. Dashboard Main Page
   ├─ See balance
   ├─ See team stats
   ├─ See income
   └─ See recent activity
   ↓
4. Connect Wallet (Optional but required for real payments)
   ├─ MetaMask
   └─ Trust Wallet
   ↓
5. Add Balance
   ├─ BNB Payment
   ├─ USDT Payment
   └─ Or Demo Balance
   ↓
6. Start Trading
   ├─ Buy NFTs
   ├─ Sell NFTs
   └─ Stake NFTs
   ↓
7. Earn Income
   ├─ Trading profit
   ├─ Referral bonus
   └─ Level earnings
   ↓
8. Withdraw Balance
   ├─ Enter amount
   ├─ Enter wallet address
   └─ Wait 24-48 hours
```

---

## 💾 **LOCAL STORAGE USAGE**

```javascript
localStorage.setItem('token', token)           // Auth token
localStorage.setItem('user', JSON.stringify(user)) // User data
localStorage.setItem('userEmail', email)       // Email
localStorage.setItem('demoBalance', balance)   // Demo balance
localStorage.setItem('hasSeenNotice', 'true')  // Notification flag
localStorage.removeItem('needsTopUp')          // After payment
```

---

## ⚙️ **ERROR HANDLING**

```
try {
  API call karo
} catch (error) {
  // Specific error messages
  if (error.includes('Insufficient balance'))
    → Show balance error
  
  if (error.includes('Invalid address'))
    → Show address format error
  
  if (error.includes('Network error'))
    → Show network error
  
  Default → Show generic error
}
```

---

## 🔗 **EXTERNAL INTEGRATIONS**

```
1. Firebase (Push Notifications)
   ├─ FCM token generation
   ├─ Foreground message handling
   └─ Background notification handling

2. Binance API (Price Feed)
   ├─ Real-time BNB price
   └─ Used for payment calculation

3. MetaMask/Trust Wallet (Web3)
   ├─ Wallet connection
   ├─ Transaction signing
   └─ Balance checking

4. BSC Blockchain
   ├─ BNB transaction
   ├─ USDT transfer
   └─ Smart contract interaction
```

---

## 📝 **SUMMARY**

```
CryptoNest Flow:

1. React frontend ← → Backend API
2. User authentication via JWT tokens
3. Wallet connection via WalletConnect/Reown
4. Real payments via blockchain (BNB/USDT)
5. Balance tracking in database
6. NFT trading via smart contracts
7. Passive income via referral system
8. Push notifications via Firebase
9. All data real-time synced
10. Smooth mobile-first UI
```

---

**Note:** Yeh complete flow explanation hai CryptoNest User Panel ka. Agar koi specific part ka detail chahiye to poochna!

