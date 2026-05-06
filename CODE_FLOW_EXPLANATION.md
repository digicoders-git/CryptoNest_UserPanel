# 🚀 NFT Trading Platform - Complete Code Flow Documentation

## 📋 Table of Contents

1. [Application Overview](#application-overview)
2. [Technology Stack](#technology-stack)
3. [Project Structure](#project-structure)
4. [Application Flow](#application-flow)
5. [Component Details](#component-details)
6. [API Integration](#api-integration)
7. [State Management](#state-management)
8. [Key Features](#key-features)

---

## 🎯 Application Overview

This is a **React-based NFT Trading & MLM Platform** that allows users to:

- Register with crypto wallet integration
- Buy and sell NFTs with 2x profit mechanism
- Build MLM teams with referral system
- Upgrade packages to unlock more levels
- Manage wallet and track earnings

**Business Model:**

- $10 one-time registration fee
- NFT buy at $10, sell at $20 (40% profit = $8)
- MLM commission system based on team levels
- Package upgrades unlock more earning levels

---

## 🛠️ Technology Stack

### Frontend

- **React 19.2.0** - UI Library
- **React Router DOM 7.11.0** - Navigation
- **Vite 7.2.4** - Build Tool
- **Tailwind CSS 4.1.18** - Styling
- **Axios 1.13.2** - HTTP Client
- **SweetAlert2 11.26.17** - Alerts/Modals
- **React Icons 5.5.0** - Icon Library
- **Lottie React 2.4.1** - Animations

### Blockchain Integration

- **Wagmi 3.2.0** - Ethereum React Hooks
- **Viem 2.43.5** - Ethereum Library
- **@reown/appkit** - Wallet Connection

### Backend API

- Base URL: `https://api.gtnworld.live/api`
- JWT Token Authentication

---

## 📁 Project Structure

```
Fornted/
├── public/
│   ├── girl.png
│   ├── image.png
│   └── WelcomeGreen.json (Lottie animation)
├── src/
│   ├── Page/
│   │   ├── Welcome.jsx          # Landing page
│   │   ├── Login.jsx            # User login
│   │   ├── Singhup.jsx          # Registration + Payment
│   │   └── Routes.jsx           # Route configuration
│   ├── Dashbord/
│   │   ├── MainDashBord.jsx     # Dashboard layout
│   │   ├── Dashboard.jsx        # Main dashboard
│   │   ├── NFTManagement.jsx    # NFT buy/sell
│   │   ├── NFTMarketplace.jsx   # NFT marketplace
│   │   ├── NFTHistory.jsx       # NFT transaction history
│   │   ├── MyTeam.jsx           # Team management
│   │   ├── MLMTree.jsx          # MLM network tree
│   │   ├── Wallet.jsx           # Wallet management
│   │   ├── History.jsx          # Transaction history
│   │   ├── PackageUpgrade.jsx   # Package upgrades
│   │   ├── Profile.jsx          # User profile
│   │   └── AdminDashboard.jsx   # Admin panel
│   ├── services/
│   │   ├── api.js               # API service layer
│   │   └── reownWalletService.js # Wallet integration
│   ├── App.jsx                  # Root component
│   ├── main.jsx                 # Entry point
│   └── index.css                # Global styles
├── package.json
├── vite.config.js
└── tailwind.config.js
```

---

## 🔄 Application Flow

### 1️⃣ **Entry Point Flow**

```
main.jsx → App.jsx → Routes.jsx → Components
```

**main.jsx:**

```javascript
- Creates React root
- Wraps app in <BrowserRouter>
- Renders <App />
```

**App.jsx:**

```javascript
- Simple wrapper component
- Renders <Routesr /> (Routes component)
```

**Routes.jsx:**

```javascript
- Defines all application routes
- Public routes: /, /Login, /SingUp
- Protected routes: /dashbord/* (nested routes)
```

---

### 2️⃣ **User Journey Flow**

#### **A. Welcome Screen → Registration → Payment → Dashboard**

```
┌─────────────┐
│  Welcome    │ (/)
│  Screen     │
└──────┬──────┘
       │ Click "Explore NFTs"
       ▼
┌─────────────┐
│   Login     │ (/Login)
│   Page      │ ◄──┐
└──────┬──────┘    │
       │           │ "Create account"
       │           │
       ▼           │
┌─────────────┐   │
│  Sign Up    │ (/SingUp)
│  Page       │ ──┘
└──────┬──────┘
       │ 1. Fill form
       │ 2. Connect wallet (dummy)
       │ 3. Submit registration
       │ 4. Auto-trigger $10 payment
       ▼
┌─────────────┐
│  Dashboard  │ (/dashbord)
│  Main       │
└─────────────┘
```

---

### 3️⃣ **Registration & Payment Flow (Singhup.jsx)**

```javascript
Step 1: User fills registration form
├── name, email, mobile, password
├── referralCode (optional)
└── Connect Wallet (generates dummy address)

Step 2: Form Submission
├── Validate: wallet connected, passwords match
├── API Call: POST /api/auth/register
│   └── Body: { name, email, mobile, password, walletAddress, referralCode }
├── Store: token & user in localStorage
└── Show success message

Step 3: Auto Payment (after 2 seconds)
├── Generate dummy transaction hash
├── API Call: POST /api/wallet/activate
│   └── Body: { txHash, walletAddress }
├── Show payment success
└── Navigate to /dashbord
```

**Key Functions:**

- `connectWallet()` - Generates random wallet address (0x + 40 hex chars)
- `handleSubmit()` - Registers user
- `handlePayment()` - Activates account with $10 payment

---

### 4️⃣ **Login Flow (Login.jsx)**

```javascript
Step 1: User enters credentials
├── email
└── password

Step 2: Form Submission
├── Validate: all fields filled
├── API Call: POST /api/auth/login
│   └── Body: { email, password }
├── Response: { token, user }
├── Store: token & user in localStorage
└── Navigate to /dashbord
```

---

### 5️⃣ **Dashboard Layout Flow (MainDashBord.jsx)**

```
┌─────────────────────────────────────┐
│  Header (Sticky)                    │
│  [☰ Menu] Dashboard          [A]    │
├─────────────────────────────────────┤
│                                     │
│  Content Area (<Outlet />)          │
│  - Renders nested route components  │
│                                     │
├─────────────────────────────────────┤
│  Bottom Navigation (Fixed)          │
│  [Team] [Wallet] [Home] [History]   │
│                    [Profile]        │
└─────────────────────────────────────┘

Side Drawer (when menu clicked):
├── NFT Marketplace
├── MLM Network
├── Package Upgrade
├── NFT History
├── Admin Panel
└── Logout
```

**Navigation Structure:**

- **Bottom Nav:** Quick access to main features
- **Side Drawer:** Additional features and settings
- **Outlet:** Renders child routes dynamically

---

### 6️⃣ **NFT Management Flow (NFTManagement.jsx)**

This is the **ACTIVE FILE** you're viewing!

```javascript
┌─────────────────────────────────────┐
│  NFT Management Component           │
├─────────────────────────────────────┤
│  State:                             │
│  ├── nfts: []                       │
│  ├── stats: {}                      │
│  └── loading: false                 │
├─────────────────────────────────────┤
│  useEffect (on mount):              │
│  └── fetchNFTs()                    │
├─────────────────────────────────────┤
│  Functions:                         │
│  ├── fetchNFTs()                    │
│  ├── buyNFT()                       │
│  └── sellNFT(nftId)                 │
└─────────────────────────────────────┘
```

#### **Buy NFT Flow:**

```javascript
1. User clicks "Buy NFT" button
   ↓
2. SweetAlert2 modal appears
   ├── Input: quantity (1-10)
   └── Validation: min 1
   ↓
3. User confirms quantity
   ↓
4. API Call: POST /api/nft/buy
   ├── Headers: Authorization Bearer token
   └── Body: { quantity: parseInt(quantity) }
   ↓
5. Success Response
   ├── Show success alert
   └── Refresh NFT list (fetchNFTs())
```

#### **Sell NFT Flow:**

```javascript
1. User clicks "Sell for $20" on NFT card
   ↓
2. SweetAlert2 confirmation
   ├── Title: "Sell NFT"
   └── Text: "Sell for $20 (40% = $8 profit)"
   ↓
3. User confirms
   ↓
4. API Call: POST /api/nft/sell/:nftId
   ├── Headers: Authorization Bearer token
   └── Empty body: {}
   ↓
5. Success Response
   ├── Show success: "You earned $8 profit"
   └── Refresh NFT list
```

#### **UI Components:**

**Stats Cards (4 cards):**

```javascript
1. Total NFTs (Blue) - stats.total
2. Holding (Green) - stats.holding
3. Sold (Yellow) - stats.sold
4. Profit (Purple) - stats.totalProfit
```

**NFT List:**

```javascript
For each NFT:
├── NFT ID (e.g., "NFT-001")
├── Status Badge (hold/sold)
├── Price Info: Buy: $10 → Sell: $20
└── Action Button:
    ├── If status='hold': "Sell for $20" button
    └── If status='sold': Show profit amount
```

---

### 7️⃣ **Dashboard Main Flow (Dashboard.jsx)**

```javascript
State Management:
├── stats: { balance, totalEarnings, teamSize, etc. }
├── nftStats: { total, holding, sold, totalProfit }
├── currentPackage: 'basic'
└── loading: true

Data Fetching (useEffect):
├── fetchDashboardData() → GET /api/user/dashboard
├── fetchNFTStats() → GET /api/nft/my-nfts
└── fetchPackageInfo() → GET /api/package/available

UI Sections:
├── Main Stats (Balance, Team Size)
├── NFT & Package Stats (4 cards)
├── Recent Activity (Transaction list)
└── Quick Actions (Buy NFT, Invite Team)
```

---

### 8️⃣ **NFT Marketplace Flow (NFTMarketplace.jsx)**

```javascript
Features:
├── View current batch info
├── Buy NFTs from marketplace
├── View owned NFTs
└── Sell NFTs at 2x price

Buy Flow:
1. Click "Buy NFT"
2. API: POST /api/nft/buy
3. Creates 2 new NFTs (locked mechanism)
4. Refresh marketplace

Sell Flow:
1. Click "Sell 2x" on owned NFT
2. Confirmation modal
3. API: POST /api/nft/sell/:nftId
4. Profit calculation
5. Refresh NFT list
```

---

### 9️⃣ **Package Upgrade Flow (PackageUpgrade.jsx)**

```javascript
Package Types:
├── basic: $10 → 2 levels
├── package1: $50 → 4 levels
├── package2: $100 → 6 levels
├── package3: $200 → 8 levels
├── package4: $500 → 10 levels
└── package5: $1000 → 12 levels

Upgrade Flow:
1. Check user balance
2. Select package
3. Confirm upgrade
4. API: POST /api/package/upgrade
   └── Body: { packageType }
5. Deduct amount from balance
6. Unlock new levels
7. Update UI
```

---

## 🔌 API Integration (services/api.js)

### **API Configuration**

```javascript
Base URL: https://api.gtnworld.live/api
Headers:
  - Content-Type: application/json
  - Authorization: Bearer <token>

Interceptor:
  - Automatically adds token from localStorage to all requests
```

### **API Endpoints**

#### **Auth API**

```javascript
authAPI.register(userData)
  → POST /api/auth/register
  → Body: { name, email, mobile, password, walletAddress, referralCode }
  → Response: { token, user }

authAPI.login(credentials)
  → POST /api/auth/login
  → Body: { email, password }
  → Response: { token, user }
```

#### **User API**

```javascript
userAPI.getProfile()
  → GET /api/user/profile
  → Response: { user }

userAPI.getTeam()
  → GET /api/user/team
  → Response: { team }

userAPI.getTransactions()
  → GET /api/user/transactions
  → Response: { transactions }

userAPI.getDashboard()
  → GET /api/user/dashboard
  → Response: { stats }
```

#### **Wallet API**

```javascript
walletAPI.activate(paymentData)
  → POST /api/wallet/activate
  → Body: { txHash, walletAddress }
  → Response: { success, message }

walletAPI.withdraw(withdrawData)
  → POST /api/wallet/withdraw
  → Body: { amount, address }
  → Response: { success, txHash }

walletAPI.getBalance()
  → GET /api/wallet/balance
  → Response: { balance }
```

#### **NFT API** (Direct axios calls)

```javascript
GET /api/nft/my-nfts
  → Response: { nfts, stats }

POST /api/nft/buy
  → Body: { quantity }
  → Response: { message, nfts }

POST /api/nft/sell/:nftId
  → Response: { message, profit }

GET /api/nft/marketplace
  → Response: { nfts, batch }
```

#### **Package API**

```javascript
GET /api/package/available
  → Response: { packages, currentPackage, userBalance }

POST /api/package/upgrade
  → Body: { packageType }
  → Response: { success, newPackage }
```

---

## 💾 State Management

### **Local Storage**

```javascript
Stored Data:
├── token: JWT authentication token
└── user: User object { id, name, email, walletAddress, etc. }

Usage:
├── Set on login/register
├── Read on API calls (interceptor)
└── Clear on logout
```

### **Component State (useState)**

```javascript
Common patterns:
├── Data state: nfts, stats, transactions
├── Loading state: loading, isLoading
├── Form state: formData, inputValues
└── UI state: showMenu, activeTab
```

### **Side Effects (useEffect)**

```javascript
Common patterns:
├── Fetch data on component mount
├── Refresh data after actions
└── Cleanup on unmount
```

---

## 🎨 Key Features Breakdown

### **1. Wallet Integration**

- **Dummy Implementation:** Generates random wallet addresses
- **Real Implementation Ready:** Uses @reown/appkit for actual wallet connection
- **Supported Wallets:** MetaMask, Trust Wallet, Coinbase, WalletConnect

### **2. NFT Trading System**

- **Buy:** $10 per NFT
- **Sell:** $20 per NFT (2x profit)
- **Profit:** 40% = $8 per NFT
- **Batch System:** NFTs organized in batches
- **Lock Mechanism:** Some NFTs locked until conditions met

### **3. MLM System**

- **Referral Code:** Each user gets unique code
- **Team Building:** Invite members using referral
- **Level System:** Earn from multiple levels
- **Package-Based:** Higher packages unlock more levels

### **4. Package System**

```
Direct Members → Unlocked Levels
1 member → 2 levels
2 members → 4 levels
3 members → 6 levels
4 members → 8 levels
5+ members → 10 levels
```

### **5. Transaction History**

- All buy/sell transactions tracked
- Profit calculations
- Date/time stamps
- Status tracking

---

## 🎯 Component Responsibilities

### **Page Components**

| Component   | Purpose                | Key Features                    |
| ----------- | ---------------------- | ------------------------------- |
| Welcome.jsx | Landing page           | Lottie animation, CTA button    |
| Login.jsx   | User authentication    | Form validation, token storage  |
| Singhup.jsx | Registration + Payment | Wallet connection, auto-payment |

### **Dashboard Components**

| Component          | Purpose               | Key Features                          |
| ------------------ | --------------------- | ------------------------------------- |
| MainDashBord.jsx   | Layout wrapper        | Navigation, routing, menu             |
| Dashboard.jsx      | Main overview         | Stats, recent activity, quick actions |
| NFTManagement.jsx  | NFT operations        | Buy/sell NFTs, view holdings          |
| NFTMarketplace.jsx | NFT trading           | Marketplace, batch info, trading      |
| MyTeam.jsx         | Team management       | View team members, referrals          |
| MLMTree.jsx        | Network visualization | Tree structure, levels                |
| Wallet.jsx         | Financial management  | Balance, transactions, withdraw       |
| History.jsx        | Transaction log       | All transactions, filters             |
| NFTHistory.jsx     | NFT transactions      | NFT-specific history                  |
| PackageUpgrade.jsx | Package management    | View/upgrade packages                 |
| Profile.jsx        | User settings         | Profile info, settings                |
| AdminDashboard.jsx | Admin panel           | Admin controls, analytics             |

---

## 🔐 Authentication Flow

```javascript
Registration:
1. User submits form
2. Backend creates user
3. Returns JWT token
4. Store token in localStorage
5. Redirect to dashboard

Login:
1. User submits credentials
2. Backend validates
3. Returns JWT token
4. Store token in localStorage
5. Redirect to dashboard

Protected Routes:
1. Check localStorage for token
2. Add token to API headers
3. Backend validates token
4. Allow/deny access

Logout:
1. Clear localStorage
2. Redirect to login
```

---

## 🎨 UI/UX Patterns

### **Color Scheme**

- Primary: `#0f7a4a` (Green)
- Success: Green shades
- Error: Red shades
- Warning: Yellow shades
- Info: Blue shades

### **Responsive Design**

- Mobile-first approach
- Breakpoints: sm, md, lg
- Max width: 390px (mobile), 820px (desktop)
- Grid layouts for cards

### **Loading States**

```javascript
{
  loading ? (
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0f7a4a]" />
  ) : (
    <Content />
  );
}
```

### **Alert System (SweetAlert2)**

```javascript
Success: Swal.fire({ icon: 'success', ... })
Error: Swal.fire({ icon: 'error', ... })
Confirm: Swal.fire({ showCancelButton: true, ... })
Input: Swal.fire({ input: 'number', ... })
```

---

## 🚀 Data Flow Summary

```
User Action
    ↓
Component Handler Function
    ↓
API Call (axios)
    ↓
Backend Processing
    ↓
Response
    ↓
Update Component State
    ↓
Re-render UI
    ↓
Show Feedback (SweetAlert2)
```

---

## 📊 NFTManagement.jsx Detailed Flow

### **Component Structure**

```javascript
NFTManagement
├── State
│   ├── nfts: [] (array of NFT objects)
│   ├── stats: {} (total, holding, sold, totalProfit)
│   └── loading: false
├── Effects
│   └── useEffect → fetchNFTs() on mount
├── Functions
│   ├── fetchNFTs() - Get user's NFTs
│   ├── buyNFT() - Purchase new NFTs
│   └── sellNFT(nftId) - Sell specific NFT
└── UI
    ├── Header (title + buy button)
    ├── Stats Cards (4 cards)
    └── NFT List (grid of NFT cards)
```

### **Data Structure**

**NFT Object:**

```javascript
{
  _id: "mongo_id",
  nftId: "NFT-001",
  buyPrice: 10,
  sellPrice: 20,
  status: "hold" | "sold",
  profit: 8,
  createdAt: "2024-01-01T00:00:00.000Z"
}
```

**Stats Object:**

```javascript
{
  total: 10,      // Total NFTs owned
  holding: 5,     // Currently holding
  sold: 5,        // Already sold
  totalProfit: 40 // Total profit earned
}
```

### **Function Details**

#### **fetchNFTs()**

```javascript
Purpose: Fetch user's NFTs and stats
Flow:
1. Get token from localStorage
2. API call: GET /api/nft/my-nfts
3. Update nfts state
4. Update stats state
5. Handle errors silently (console.error)
```

#### **buyNFT()**

```javascript
Purpose: Purchase new NFTs
Flow:
1. Show SweetAlert2 input modal
   - Input type: number
   - Default: 1
   - Min: 1, Max: 10
2. Validate quantity
3. Set loading state
4. API call: POST /api/nft/buy
   - Body: { quantity }
5. Show success alert
6. Refresh NFT list
7. Clear loading state
```

#### **sellNFT(nftId)**

```javascript
Purpose: Sell specific NFT
Flow:
1. Show confirmation modal
   - Text: "Sell for $20 (40% = $8 profit)"
2. Wait for user confirmation
3. Set loading state
4. API call: POST /api/nft/sell/:nftId
5. Show success alert
   - Text: "You earned $8 profit"
6. Refresh NFT list
7. Clear loading state
```

### **UI Rendering Logic**

**Stats Cards:**

```javascript
Grid: 2 columns on mobile, 4 on desktop
Cards:
1. Total NFTs (Blue background)
2. Holding (Green background)
3. Sold (Yellow background)
4. Profit (Purple background)
```

**NFT List:**

```javascript
Grid: 1 column mobile, 2 tablet, 3 desktop
Each card shows:
├── NFT ID (top left)
├── Status badge (top right)
├── Price info (middle)
└── Action button (bottom)
    ├── If hold: "Sell for $20" button
    └── If sold: Profit display
```

**Empty State:**

```javascript
When nfts.length === 0:
├── Large icon (FaImage)
└── Message: "No NFTs found. Buy your first NFT!"
```

---

## 🔄 Complete User Journey Example

### **Scenario: New User Registration to First NFT Sale**

```
1. User visits website (/)
   └── Sees welcome screen with Lottie animation

2. Clicks "Explore NFTs"
   └── Navigates to /Login

3. Clicks "Create an account"
   └── Navigates to /SingUp

4. Fills registration form
   ├── Name: John Doe
   ├── Email: john@example.com
   ├── Mobile: +1234567890
   ├── Password: ********
   └── Referral Code: ABC123 (optional)

5. Clicks "Connect Wallet"
   └── Generates: 0xabcd...1234

6. Clicks "Register & Pay $10"
   ├── API: POST /auth/register
   ├── Stores token
   └── Auto-triggers payment

7. Payment processed
   ├── Generates dummy txHash
   ├── API: POST /wallet/activate
   └── Navigates to /dashbord

8. Dashboard loads
   ├── Fetches user stats
   ├── Shows balance: $0
   └── Shows NFT count: 0

9. Navigates to NFT Management
   └── /dashbord/nft-management

10. Clicks "Buy NFT"
    ├── Enters quantity: 2
    ├── API: POST /nft/buy
    └── Success: "Successfully bought 2 NFT(s)"

11. NFT list updates
    ├── Shows 2 NFTs with status "hold"
    └── Stats: Total: 2, Holding: 2, Sold: 0

12. Clicks "Sell for $20" on first NFT
    ├── Confirms sale
    ├── API: POST /nft/sell/NFT-001
    └── Success: "You earned $8 profit"

13. NFT list updates
    ├── NFT-001 status: "sold"
    ├── Stats: Total: 2, Holding: 1, Sold: 1, Profit: $8
    └── Balance increases by $8

14. Dashboard reflects changes
    ├── Balance: $8
    ├── Recent activity shows NFT sale
    └── NFT stats updated
```

---

## 🎓 Key Concepts

### **1. JWT Authentication**

- Token stored in localStorage
- Sent with every API request
- Validates user identity
- Expires after set time

### **2. Dummy Wallet Implementation**

- Generates random addresses for demo
- Real implementation uses Web3 providers
- Supports MetaMask, WalletConnect, etc.

### **3. NFT Profit Mechanism**

```
Buy Price: $10
Sell Price: $20
Gross Profit: $10 (100%)
Net Profit: $8 (40% to user)
Platform Fee: $2 (60% to platform/MLM)
```

### **4. MLM Commission Structure**

```
Level 1: Direct referrals
Level 2: Referrals of referrals
...
Level N: Based on package

Commission distributed from platform fee
```

### **5. Package Unlock System**

```
Direct Members → Levels Unlocked
0 → 0 levels (basic)
1 → 2 levels
2 → 4 levels
3 → 6 levels
4 → 8 levels
5+ → 10 levels

Higher package = More levels available
```

---

## 🐛 Error Handling

### **API Errors**

```javascript
try {
  const response = await api.call();
} catch (error) {
  Swal.fire({
    icon: "error",
    title: "Operation Failed",
    text: error.response?.data?.message || "Something went wrong",
  });
}
```

### **Form Validation**

```javascript
if (!formData.email || !formData.password) {
  Swal.fire({
    icon: "warning",
    title: "Missing Fields",
    text: "Please fill all fields",
  });
  return;
}
```

### **Loading States**

```javascript
const [loading, setLoading] = useState(false);

const handleAction = async () => {
  setLoading(true);
  try {
    await apiCall();
  } finally {
    setLoading(false);
  }
};
```

---

## 🎯 Best Practices Used

1. **Component Separation:** Each feature in separate component
2. **Service Layer:** API calls centralized in services/api.js
3. **Error Handling:** Try-catch blocks with user feedback
4. **Loading States:** Visual feedback during async operations
5. **Responsive Design:** Mobile-first, works on all devices
6. **Code Reusability:** Shared components and utilities
7. **State Management:** Local state with useState, effects with useEffect
8. **Security:** JWT tokens, protected routes
9. **User Experience:** Smooth animations, clear feedback
10. **Code Organization:** Logical folder structure

---

## 📝 Summary

This NFT Trading Platform is a full-stack application that combines:

- **User Management:** Registration, login, profiles
- **NFT Trading:** Buy/sell mechanism with profit tracking
- **MLM System:** Referral-based team building
- **Package System:** Tiered packages with level unlocks
- **Wallet Integration:** Crypto wallet connection (dummy + real)
- **Dashboard:** Comprehensive analytics and management

The code follows React best practices with clean component structure, proper state management, and user-friendly UI/UX patterns.

---

**End of Documentation** 🎉
