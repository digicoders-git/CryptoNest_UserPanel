# CryptoNest - Complete Code Flow Diagram (English)

## 🎯 High-Level Architecture

```
╔════════════════════════════════════════════════════════════════╗
║                    CRYPTONEST USER PANEL                      ║
║                     React.js Frontend                         ║
╚════════════════════════════════════════════════════════════════╝
              │
    ┌─────────┼─────────┐
    │         │         │
    ▼         ▼         ▼
┌───────┐ ┌───────┐ ┌────────┐
│ Auth  │ │ Wagmi │ │ Query  │
│Module │ │Wallet │ │Client  │
└───────┘ └───────┘ └────────┘
    │         │         │
    └─────────┼─────────┘
              │
    ┌─────────▼─────────┐
    │   Axios API       │
    │  (HTTP Requests)  │
    └───────────────────┘
              │
    ┌─────────▼─────────────────────┐
    │   Backend API Server          │
    │   (Node.js Express)           │
    │                               │
    │  ┌─────┐ ┌────────┐ ┌──────┐ │
    │  │Auth │ │ User   │ │Wallet│ │
    │  │APIs │ │ APIs   │ │APIs  │ │
    │  └─────┘ └────────┘ └──────┘ │
    │                               │
    │  ┌──────┐ ┌────────────────┐  │
    │  │NFT   │ │Transaction     │  │
    │  │APIs  │ │Management      │  │
    │  └──────┘ └────────────────┘  │
    └─────────────────────────────────┘
              │
    ┌─────────┴─────────┐
    │                   │
    ▼                   ▼
┌──────────────┐ ┌──────────────┐
│   MongoDB    │ │   Blockchain │
│  Database    │ │   (BSC)      │
│  (Storage)   │ │  (Payments)  │
└──────────────┘ └──────────────┘
```

---

## 🔄 Authentication Flow

```
┌─────────────────────────────────────┐
│     User Visits App                 │
└─────────────────────────────────────┘
              │
              ▼
┌─────────────────────────────────────┐
│  Check localStorage for token       │
│  (useAuthCheck hook)                │
└─────────────────────────────────────┘
              │
        ┌─────┴─────┐
        │           │
    Token Found   No Token
        │           │
        ▼           ▼
  ┌──────────┐  ┌──────────┐
  │Dashboard │  │ Welcome  │
  │Allowed   │  │ Page     │
  └──────────┘  └────┬─────┘
                     │
              ┌──────┴──────┐
              │             │
              ▼             ▼
          ┌──────────┐ ┌──────────┐
          │  Login   │ │ Register │
          │  Page    │ │  Page    │
          └────┬─────┘ └────┬─────┘
               │            │
               └────┬───────┘
                    │
                    ▼
        ┌──────────────────────┐
        │  Email & Password    │
        │  Submission          │
        └──────────────────────┘
                    │
                    ▼
        ┌──────────────────────┐
        │ /auth/login          │
        │ or                   │
        │ /auth/register       │
        └──────────────────────┘
                    │
                    ▼
        ┌──────────────────────┐
        │ Backend Validation   │
        │ Password Hashing     │
        │ User Creation        │
        └──────────────────────┘
                    │
        ┌───────────┴───────────┐
        │                       │
        ▼                       ▼
    Success                   Error
        │                       │
        ▼                       ▼
    ┌──────────────┐      ┌──────────────┐
    │ Return JWT   │      │ Return Error │
    │ Token        │      │ Message      │
    └──────────────┘      └──────────────┘
        │
        ▼
    ┌──────────────┐
    │ Save Token   │
    │ to Local     │
    │ Storage      │
    └──────────────┘
        │
        ▼
    ┌──────────────┐
    │ Request FCM  │
    │ Permission   │
    └──────────────┘
        │
        ▼
    ┌──────────────┐
    │ Dashboard    │
    │ Redirect     │
    └──────────────┘
```

---

## 💳 Wallet Connection Flow

```
╔══════════════════════════════════════════════════════════════╗
║           WALLET CONNECTION PROCESS                          ║
╚══════════════════════════════════════════════════════════════╝

User clicks "Connect Wallet" button
    │
    ▼
┌─────────────────────────────────┐
│ realWalletService.connectWallet()
└─────────────────────────────────┘
    │
    ▼
┌──────────────────────────────────┐
│ Check if browser environment     │
│ isNetworkAvailable()             │
└──────────────────────────────────┘
    │
    ├─ Not in Browser? ──→ Error
    │
    ▼
┌──────────────────────────────────┐
│ Initialize WalletKit             │
│ (Wagmi + Reown AppKit)           │
└──────────────────────────────────┘
    │
    ▼
┌──────────────────────────────────┐
│ modal.open({ view: "Connect" })  │
│ (WalletConnect Modal appears)    │
└──────────────────────────────────┘
    │
    ▼
User selects wallet
    ├─ MetaMask
    ├─ Trust Wallet
    ├─ Coinbase Wallet
    └─ Others...
    │
    ▼
┌──────────────────────────────────┐
│ Wallet requests permission       │
│ to connect                       │
└──────────────────────────────────┘
    │
    ▼
User approves in wallet
    │
    ▼
┌──────────────────────────────────┐
│ subscribeAccount() callback      │
│ receives account data            │
└──────────────────────────────────┘
    │
    ▼
┌──────────────────────────────────┐
│ Extract:                         │
│ - Account address                │
│ - Chain ID                       │
│ - isConnected status             │
└──────────────────────────────────┘
    │
    ▼
┌──────────────────────────────────┐
│ Check Network                    │
│ Is it BSC Mainnet (56)?          │
└──────────────────────────────────┘
    │
    ├─ No → Request chain switch
    │       │
    │       ▼
    │   wallet_switchEthereumChain
    │       │
    │       ▼
    │   User confirms in wallet
    │
    ▼
┌──────────────────────────────────┐
│ Save to Service:                 │
│ - this.account = address         │
│ - this.isConnected = true        │
│ - this.chainId = 56              │
└──────────────────────────────────┘
    │
    ▼
┌──────────────────────────────────┐
│ Close WalletConnect Modal        │
│ modal.close()                    │
└──────────────────────────────────┘
    │
    ▼
┌──────────────────────────────────┐
│ Return Success Status            │
│ Update UI                        │
│ Enable payment buttons           │
└──────────────────────────────────┘
```

---

## 💰 Payment Processing Flow (Deposit)

```
╔══════════════════════════════════════════════════════════════╗
║        CRYPTO PAYMENT PROCESSING (ADD BALANCE)               ║
╚══════════════════════════════════════════════════════════════╝

1. USER CLICKS "ADD BALANCE"
   │
   ▼
┌─────────────────────────────────┐
│ Check if wallet connected       │
│ if (!isWalletConnected())       │
└─────────────────────────────────┘
   │
   ├─ Not Connected → Show popup
   │   "Please connect wallet"
   │
   ▼
┌─────────────────────────────────┐
│ Show Payment Method Selection    │
└─────────────────────────────────┘
   │
   ├─ Option 1: BNB Payment
   │
   ├─ Option 2: USDT Payment
   │
   └─ Option 3: Demo Balance (Test)

2. IF USER SELECTS BNB PAYMENT
   │
   ▼
┌─────────────────────────────────┐
│ Fetch wallet's BNB balance      │
│ getBalance() from Wagmi         │
└─────────────────────────────────┘
   │
   ▼
┌─────────────────────────────────┐
│ Fetch current BNB price         │
│ API call to Binance             │
│ /api/v3/ticker/price?BNB        │
└─────────────────────────────────┘
   │
   ▼
┌─────────────────────────────────┐
│ Calculate max USD available     │
│ maxUSD = bnbBalance × bnbPrice  │
└─────────────────────────────────┘
   │
   ▼
┌─────────────────────────────────┐
│ Show input modal for USD amount │
│ User enters amount              │
└─────────────────────────────────┘
   │
   ▼
┌─────────────────────────────────┐
│ Validate amount:                │
│ - Min: $10                      │
│ - Max: maxUSD available         │
│ - Must be positive number       │
└─────────────────────────────────┘
   │
   ├─ Validation Failed → Show error
   │
   ▼
┌─────────────────────────────────┐
│ Calculate BNB to send           │
│ bnbRequired = usdAmount/price   │
│ Convert to Wei precision        │
└─────────────────────────────────┘
   │
   ▼
┌─────────────────────────────────┐
│ Show Confirmation Popup         │
│ - Amount in USD                 │
│ - Amount in BNB                 │
│ - Network info                  │
│ - Company wallet address        │
└─────────────────────────────────┘
   │
   ▼
User clicks "Confirm Send"
   │
   ▼
┌─────────────────────────────────┐
│ sendTransaction() from Wagmi    │
│ Parameters:                     │
│ - to: company wallet            │
│ - value: bnb amount in wei      │
│ - chainId: 56 (BSC)             │
└─────────────────────────────────┘
   │
   ▼
┌─────────────────────────────────┐
│ Wallet shows transaction        │
│ User confirms in MetaMask       │
│ (User pays gas fees)            │
└─────────────────────────────────┘
   │
   ▼
┌─────────────────────────────────┐
│ Transaction sent to blockchain  │
│ Receive TX Hash                 │
└─────────────────────────────────┘
   │
   ▼
┌─────────────────────────────────┐
│ Backend API call:               │
│ POST /wallet/add-balance        │
│ Body: { amount: usdAmount }     │
└─────────────────────────────────┘
   │
   ▼
┌─────────────────────────────────┐
│ Backend receives request        │
│ Verify TX on blockchain         │
│ Update user balance in DB       │
│ Return new balance              │
└─────────────────────────────────┘
   │
   ▼
┌─────────────────────────────────┐
│ Frontend receives response      │
│ new balance in response         │
└─────────────────────────────────┘
   │
   ▼
┌─────────────────────────────────┐
│ Update component state:         │
│ setBalance(newBalance)          │
└─────────────────────────────────┘
   │
   ▼
┌─────────────────────────────────┐
│ Dispatch event to other         │
│ components:                     │
│ window.dispatchEvent(           │
│  "balanceUpdate"                │
│ )                               │
└─────────────────────────────────┘
   │
   ▼
┌─────────────────────────────────┐
│ Show success message with:      │
│ - Amount added                  │
│ - TX Hash                       │
│ - New balance                   │
└─────────────────────────────────┘
   │
   ▼
USER SEES: Balance increased ✅

3. IF USER SELECTS USDT PAYMENT
   │
   ▼
┌─────────────────────────────────┐
│ Fetch USDT balance from         │
│ blockchain using Web3           │
│ bnbTokenUtils.getUSDTBalance()  │
└─────────────────────────────────┘
   │
   ▼
┌─────────────────────────────────┐
│ Get user's USDT balance         │
│ (No price conversion needed,    │
│  1 USDT = $1 USD)               │
└─────────────────────────────────┘
   │
   ▼
[Similar flow to BNB, but...]
   │
   ▼
┌─────────────────────────────────┐
│ sendUSDTPayment(amount)         │
│ encodeFunctionData:             │
│ - Contract: USDT address        │
│ - Function: transfer()          │
│ - To: company wallet            │
│ - Amount: amount × 10^18        │
└─────────────────────────────────┘
   │
   ▼
[Rest same as BNB]
```

---

## 🔄 Dashboard Data Load Flow

```
╔══════════════════════════════════════════════════════════════╗
║        DASHBOARD PAGE DATA LOADING                           ║
╚══════════════════════════════════════════════════════════════╝

Component Mounts
   │
   ▼
┌──────────────────────────────────────┐
│ useEffect hook triggers              │
│ Dependency: [empty] = once on mount  │
└──────────────────────────────────────┘
   │
   ├─ fetchDashboardData()
   │   │
   │   ▼
   │ Promise.all([
   │   userAPI.getDashboard(),
   │   walletAPI.getBalance()
   │ ])
   │   │
   │   ├─ GET /user/dashboard
   │   │  Response: { stats: {...} }
   │   │
   │   ├─ GET /wallet/balance
   │   │  Response: { balance: X }
   │   │
   │   ▼
   │ setStats({
   │   balance,
   │   teamSize,
   │   nftCount,
   │   recentTransactions
   │ })
   │
   ├─ fetchNFTStats()
   │   │
   │   ▼
   │  GET /nft/my-nfts
   │   │
   │   ▼
   │  setNftStats({
   │    total,
   │    holding,
   │    sold,
   │    totalProfit
   │  })
   │
   ├─ fetchPackageInfo()
   │   │
   │   ▼
   │  GET /package/plans
   │   │
   │   ▼
   │  setCurrentPackage()
   │
   ├─ fetchLevelEarnings()
   │   │
   │   ▼
   │  GET /user/mlm-earnings
   │   │
   │   ▼
   │  setLevelEarnings()
   │
   └─ fetchTokenProfit()
       │
       ▼
      GET /user/transactions
       │
       ▼
      Filter by type:
      - nft_sale → Token Profit
      - referral_bonus → Referral Income
      - nft_parent_bonus → Trading Income
       │
       ▼
      setTokenProfit()
      setReferralIncome()
      setTradingIncome()

   │
   ▼
┌──────────────────────────────────────┐
│ All data loaded successfully         │
│ setLoading(false)                    │
│ setBalanceLoaded(true)               │
└──────────────────────────────────────┘
   │
   ▼
┌──────────────────────────────────────┐
│ Render UI with data:                 │
│                                      │
│ ┌────────────────────────────────┐  │
│ │ Balance Card (Hero)            │  │
│ │ $X.XX                          │  │
│ └────────────────────────────────┘  │
│                                      │
│ ┌────────────────────────────────┐  │
│ │ Quick Stats (2 columns)        │  │
│ │ Team | NFTs                    │  │
│ └────────────────────────────────┘  │
│                                      │
│ ┌────────────────────────────────┐  │
│ │ Income Grid (4 columns)        │  │
│ │ Token | Referral | Trading     │  │
│ │ Profit | Sold                  │  │
│ └────────────────────────────────┘  │
│                                      │
│ ┌────────────────────────────────┐  │
│ │ Recent Activity                │  │
│ │ Transaction list               │  │
│ └────────────────────────────────┘  │
└──────────────────────────────────────┘
   │
   ▼
┌──────────────────────────────────────┐
│ Listen for events:                   │
│ - balanceUpdate                      │
│ - walletBalanceUpdate                │
│ - packageUpdate                      │
│                                      │
│ When event fires:                    │
│ Update corresponding state           │
│ Re-render affected components        │
└──────────────────────────────────────┘
```

---

## 📊 Balance Update Synchronization

```
╔══════════════════════════════════════════════════════════════╗
║     BALANCE UPDATE SYNC ACROSS ALL COMPONENTS                ║
╚══════════════════════════════════════════════════════════════╝

Payment Success
   │
   ▼
┌──────────────────────────────┐
│ setBalance(newBalance)       │
│ Update Wallet component      │
└──────────────────────────────┘
   │
   ▼
┌──────────────────────────────┐
│ window.dispatchEvent(        │
│   "balanceUpdate",           │
│   { detail: {               │
│     balance: newBalance     │
│   }}                         │
│ )                            │
└──────────────────────────────┘
   │
   └─────────┬──────────────────────────────────┐
             │                                  │
             ▼                                  ▼
    ┌──────────────────┐          ┌──────────────────┐
    │ Dashboard        │          │ MainDashboard    │
    │ Listening...     │          │ Listening...     │
    └──────────────────┘          └──────────────────┘
             │                                  │
             ▼                                  ▼
    ┌──────────────────┐          ┌──────────────────┐
    │ Receives event   │          │ Receives event   │
    │ Updates state    │          │ Updates state    │
    │ Re-renders       │          │ Re-renders       │
    └──────────────────┘          └──────────────────┘
             │                                  │
             └──────────────┬───────────────────┘
                            │
                            ▼
                  All components show
                  updated balance ✅
```

---

## 🌐 API Request Flow with Auth

```
╔══════════════════════════════════════════════════════════════╗
║        AXIOS REQUEST WITH TOKEN INJECTION                    ║
╚══════════════════════════════════════════════════════════════╝

Component calls: userAPI.getDashboard()
   │
   ▼
┌──────────────────────────────┐
│ Axios request interceptor    │
│ triggers automatically       │
└──────────────────────────────┘
   │
   ▼
┌──────────────────────────────┐
│ Read token from localStorage │
│ const token =               │
│   localStorage.getItem(     │
│     'token'                 │
│   )                         │
└──────────────────────────────┘
   │
   ├─ Token exists?
   │  └─ Yes → Continue
   │  └─ No → Send without auth
   │
   ▼
┌──────────────────────────────┐
│ Add to request headers:      │
│ Authorization:              │
│   "Bearer <token>"          │
└──────────────────────────────┘
   │
   ▼
┌──────────────────────────────┐
│ Send HTTP request            │
│ GET /api/user/dashboard      │
│ Headers: {                  │
│   Authorization: Bearer...  │
│   Content-Type: json        │
│ }                           │
└──────────────────────────────┘
   │
   ▼
Backend receives request
   │
   ▼
┌──────────────────────────────┐
│ Extract token from header    │
│ Verify token signature       │
│ Check token expiry           │
│ Extract user ID from token   │
└──────────────────────────────┘
   │
   ├─ Token invalid? → Return 401
   ├─ Token expired? → Return 401
   │
   ▼
┌──────────────────────────────┐
│ Fetch user's dashboard data  │
│ from database                │
└──────────────────────────────┘
   │
   ▼
┌──────────────────────────────┐
│ Return 200 OK with data      │
│ { stats: {...} }             │
└──────────────────────────────┘
   │
   ▼
Frontend receives response
   │
   ▼
┌──────────────────────────────┐
│ Response interceptor         │
│ (Optional error handling)    │
└──────────────────────────────┘
   │
   ▼
┌──────────────────────────────┐
│ Component receives data      │
│ setStats(response.data)      │
│ Re-render with new data      │
└──────────────────────────────┘
```

---

## 🔐 Protected Route Flow

```
╔══════════════════════════════════════════════════════════════╗
║        PROTECTED ROUTE CHECK (useAuthCheck)                  ║
╚══════════════════════════════════════════════════════════════╝

User navigates to /dashbord
   │
   ▼
┌──────────────────────────────┐
│ Route component mounts       │
│ useAuthCheck() hook runs     │
└──────────────────────────────┘
   │
   ▼
┌──────────────────────────────┐
│ Check localStorage:          │
│ const token =               │
│   localStorage.getItem(     │
│     'token'                 │
│   )                         │
└──────────────────────────────┘
   │
   ├─ Token exists?
   │
   ├─ Yes
   │  │
   │  ▼
   │ Component renders
   │ Return Dashboard
   │
   └─ No
      │
      ▼
     const navigate =
       useNavigate()
      │
      ▼
     navigate('/login')
      │
      ▼
     Redirect to login
     User sees login page
```

---

## 🔔 Firebase Notifications Flow

```
╔══════════════════════════════════════════════════════════════╗
║        PUSH NOTIFICATIONS SYSTEM                             ║
╚══════════════════════════════════════════════════════════════╝

User logs in
   │
   ▼
┌──────────────────────────────┐
│ requestNotificationPermission()
└──────────────────────────────┘
   │
   ▼
┌──────────────────────────────┐
│ Initialize Firebase:         │
│ import getMessaging          │
│ const messaging =            │
│   getMessaging(app)          │
└──────────────────────────────┘
   │
   ▼
┌──────────────────────────────┐
│ Request browser permission   │
│ Notification.requestPermission()
└──────────────────────────────┘
   │
   ├─ User allows
   │  │
   │  ▼
   │ getToken(messaging, {...})
   │  │
   │  ▼
   │ Receive FCM token
   │  │
   │  ▼
   │ Send to backend API:
   │ POST /notifications/token
   │ Body: { fcmToken: token }
   │  │
   │  ▼
   │ Backend stores token in DB
   │ Associated with user ID
   │
   └─ User denies
      No notifications setup

   ▼
┌──────────────────────────────┐
│ onForegroundMessage listener │
│ Setup callback               │
└──────────────────────────────┘
   │
   ▼
[App running in foreground]
   │
   ▼
Backend sends notification:
POST /send-notification
   │
   ▼
┌──────────────────────────────┐
│ Firebase receives             │
│ Sends to device with token   │
└──────────────────────────────┘
   │
   ├─ App in foreground
   │  │
   │  ▼
   │ onForegroundMessage fires
   │  │
   │  ▼
   │ Show Swal toast:
   │ Swal.fire({
   │   icon: 'info',
   │   toast: true,
   │   title: payload.title,
   │   text: payload.body,
   │   timer: 5000
   │ })
   │
   └─ App in background
      │
      ▼
     Browser notification
     appears in system tray
```

---

## 📁 Component File Structure

```
CryptoNest_UserPanel/
│
├── src/
│   │
│   ├── main.jsx
│   │   └── App entry point, Wagmi + Query Client setup
│   │
│   ├── App.jsx
│   │   └── Renders Routes component
│   │
│   ├── Page/
│   │   ├── Routes.jsx (Main router)
│   │   ├── Welcome.jsx (Home page)
│   │   ├── Login.jsx (Authentication)
│   │   └── Singhup.jsx (Registration)
│   │
│   ├── Dashbord/
│   │   ├── MainDashBord.jsx (Layout wrapper)
│   │   ├── Dashboard.jsx (Main dashboard)
│   │   ├── Wallet.jsx (Balance management)
│   │   ├── History.jsx (Transaction history)
│   │   ├── MyTeam.jsx (Referral team)
│   │   ├── MLMTree.jsx (Team tree view)
│   │   ├── MyNFTs.jsx (NFT collection)
│   │   ├── NFTMarketplace.jsx (Trading)
│   │   ├── NFTHistory.jsx (NFT transactions)
│   │   ├── Profile.jsx (User profile)
│   │   ├── ChangePassword.jsx (Security)
│   │   └── ... (Other pages)
│   │
│   ├── Componect/
│   │   ├── WalletStatus.jsx
│   │   ├── LevelEarningsModal.jsx
│   │   ├── TrustWalletHelper.jsx
│   │   └── PaymentComponent.jsx
│   │
│   ├── services/
│   │   ├── api.js (Axios setup + endpoints)
│   │   ├── realWalletService.js (Wagmi + Wallet)
│   │   ├── firebaseService.js (Notifications)
│   │   └── reownWalletService.js (WalletConnect)
│   │
│   ├── utils/
│   │   ├── useAuthCheck.js (Auth verification)
│   │   ├── walletUtils.js (Wallet helpers)
│   │   ├── bnbTokenUtils.js (USDT balance)
│   │   ├── networkUtils.js (Network checks)
│   │   └── balanceDebug.js (Balance debugging)
│   │
│   ├── config/
│   │   └── environment.js (Environment settings)
│   │
│   └── styles/
│       └── index.css (Tailwind styles)
│
├── public/
│   ├── firebase-messaging-sw.js
│   └── ... (Assets)
│
└── vite.config.js (Build config)
```

---

## 🔑 Key Data Flows Summary

```
1. AUTHENTICATION FLOW
   Credentials → Backend → JWT Token → localStorage → Protected Routes

2. WALLET CONNECTION FLOW
   User Action → WalletConnect Modal → Provider → Web3 → Account Details

3. PAYMENT FLOW
   User Input → Amount Validation → Wallet Popup → Blockchain TX → Backend API → Balance Update

4. DATA FETCHING FLOW
   Component Mount → useEffect → API Call → Response → State Update → UI Render

5. NOTIFICATION FLOW
   Backend → Firebase Cloud Messaging → Device Token → Browser/Foreground Message

6. BALANCE SYNC FLOW
   Payment Success → State Update → Event Dispatch → All Components Listening → UI Update
```

---

## ✅ Conclusion

This document provides a complete visual representation of how CryptoNest User Panel works from end to end. Each flow diagram shows the exact sequence of operations, data movement, and system interactions.

**Key Takeaways:**
- ✅ User authentication via JWT tokens
- ✅ Wallet connection via Wagmi + WalletConnect
- ✅ Real crypto payments via blockchain
- ✅ API communication with token injection
- ✅ Real-time data synchronization
- ✅ Push notifications via Firebase
- ✅ Protected routes via auth checks

