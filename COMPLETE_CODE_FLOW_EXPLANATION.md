# 🚀 GTN NFT Trading Platform - Complete Code Flow & Explanation

## 📋 Table of Contents

1. [Application Overview](#application-overview)
2. [Technology Stack](#technology-stack)
3. [Project Architecture](#project-architecture)
4. [Complete Application Flow](#complete-application-flow)
5. [Component-by-Component Breakdown](#component-by-component-breakdown)
6. [API Integration Details](#api-integration-details)
7. [State Management & Data Flow](#state-management--data-flow)
8. [Key Features Explained](#key-features-explained)

---

## 🎯 Application Overview

**GTN (Green Token Network)** is a React-based NFT Trading & MLM Platform with real cryptocurrency wallet integration.

### Core Business Model:
- **Registration**: $10 (Basic) or $20 (Premium) one-time fee via BNB/USDT
- **NFT Trading**: Buy at $10, Sell at $20
- **Profit Distribution**: 
  - Seller gets 70% ($14)
  - Company gets 20% ($4)
  - Parent referrer gets 10% ($2)
- **MLM System**: Multi-level referral commission structure
- **Package Upgrades**: Unlock more earning levels

---

## 🛠️ Technology Stack

### Frontend Core
```json
{
  "react": "19.2.0",
  "react-router-dom": "7.11.0",
  "vite": "7.2.4",
  "tailwindcss": "4.1.18"
}
```

### UI & UX
```json
{
  "sweetalert2": "11.26.17",
  "react-icons": "5.5.0",
  "lottie-react": "2.4.1",
  "react-phone-input-2": "2.15.1"
}
```

### Blockchain Integration
```json
{
  "wagmi": "3.2.0",
  "viem": "2.43.5",
  "@reown/appkit": "1.8.16",
  "@tanstack/react-query": "5.90.16"
}
```

### HTTP & Utilities
```json
{
  "axios": "1.13.2",
  "libphonenumber-js": "1.12.36"
}
```

---

## 📁 Project Architecture

```
Fornted/
├── public/
│   ├── 22.png                    # GTN Token logo
│   ├── girl.png                  # Welcome page image
│   └── WelcomeGreen.json         # Lottie animation
│
├── src/
│   ├── Page/                     # Public pages
│   │   ├── Welcome.jsx           # Landing page
│   │   ├── Login.jsx             # User login
│   │   ├── Singhup.jsx           # Registration + Payment
│   │   └── Routes.jsx            # Route configuration
│   │
│   ├── Dashbord/                 # Protected dashboard pages
│   │   ├── MainDashBord.jsx      # Dashboard layout wrapper
│   │   ├── Dashboard.jsx         # Main dashboard home
│   │   ├── MyNFTs.jsx            # User's NFT portfolio
│   │   ├── NFTMarketplace.jsx    # Buy NFTs from marketplace
│   │   ├── NFTManagement.jsx     # NFT operations
│   │   ├── NFTDashboard.jsx      # NFT analytics
│   │   ├── NFTHistory.jsx        # NFT transaction history
│   │   ├── MyTeam.jsx            # Team management
│   │   ├── MLMTree.jsx           # MLM network tree
│   │   ├── Wallet.jsx            # Wallet management
│   │   ├── History.jsx           # Transaction history
│   │   ├── PackageUpgrade.jsx    # Package upgrades
│   │   ├── Profile.jsx           # User profile
│   │   └── ContactUs.jsx         # Contact form
│   │
│   ├── Componect/                # Reusable components
│   │   ├── LevelEarningsModal.jsx
│   │   ├── PaymentComponent.jsx
│   │   ├── ScrollToTop.jsx
│   │   ├── TrustWalletHelper.jsx
│   │   ├── WalletStatus.jsx
│   │   └── WalletTest.jsx
│   │
│   ├── services/                 # API service layer
│   │   ├── api.js                # Main API configuration
│   │   ├── realWalletService.js  # Real wallet integration
│   │   ├── reownWalletService.js # Reown wallet service
│   │   ├── simpleWalletService.js
│   │   ├── directWalletService.js
│   │   └── upgradeAPI.js
│   │
│   ├── utils/                    # Utility functions
│   │   ├── balanceDebug.js
│   │   ├── bnbTokenUtils.js
│   │   ├── fallbackWallet.js
│   │   ├── networkChecker.js
│   │   ├── networkSwitcher.js
│   │   ├── networkUtils.js
│   │   ├── useAuthCheck.js
│   │   ├── walletDebug.js
│   │   └── walletUtils.js
│   │
│   ├── config/
│   │   └── environment.js        # Environment configuration
│   │
│   ├── styles/
│   │   └── modal-fix.css         # Modal styling fixes
│   │
│   ├── App.jsx                   # Root component
│   ├── main.jsx                  # Entry point
│   └── index.css                 # Global styles
│
├── .env                          # Environment variables
├── package.json
├── vite.config.js
└── tailwind.config.js
```

---

## 🔄 Complete Application Flow

### 1️⃣ Entry Point Flow

```
main.jsx
  ↓
  Creates React Root
  ↓
  Wraps in WagmiProvider (Blockchain)
  ↓
  Wraps in QueryClientProvider (React Query)
  ↓
  Wraps in BrowserRouter (Routing)
  ↓
  Renders <App />
  ↓
App.jsx
  ↓
  Renders <Routesr /> (Routes component)
  ↓
Routes.jsx
  ↓
  Defines all application routes
  ↓
  Renders appropriate component based on URL
```

**main.jsx Code:**
```javascript
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { WagmiProvider } from "wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import App from "./App.jsx";
import realWalletService from "./services/realWalletService.js";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 1000 * 60 * 5, // 5 minutes
      refetchOnWindowFocus: false,
    },
  },
});

// Initialize wallet service
realWalletService.initialize();

createRoot(document.getElementById("root")).render(
  <WagmiProvider config={realWalletService.wagmiConfig}>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </QueryClientProvider>
  </WagmiProvider>
);
```

---

### 2️⃣ User Journey Flow

```
┌─────────────────────────────────────────────────────────────┐
│                    WELCOME PAGE (/)                         │
│  - Lottie animation                                         │
│  - "Explore NFTs" button                                    │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│                   LOGIN PAGE (/Login)                       │
│  - Email & Password fields                                  │
│  - "Create account" link → Signup                           │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│                  SIGNUP PAGE (/SingUp)                      │
│  1. Fill registration form                                  │
│  2. Connect crypto wallet (MetaMask/Trust Wallet)           │
│  3. Select plan (Basic $10 / Premium $20)                   │
│  4. Choose payment method (USDT/BNB)                        │
│  5. Complete blockchain payment                             │
│  6. Account activated automatically                         │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│              DASHBOARD (/dashbord)                          │
│  - Main stats overview                                      │
│  - NFT portfolio                                            │
│  - Team management                                          │
│  - Wallet operations                                        │
└─────────────────────────────────────────────────────────────┘
```

---

### 3️⃣ Registration & Payment Flow (Singhup.jsx)

This is the most complex flow in the application:

```javascript
STEP 1: User fills registration form
├── name: Full name
├── email: Email address (with real-time validation)
├── mobile: Phone number with country code
├── country: Auto-detected from phone
├── password: Password
├── confirmPassword: Confirm password
├── referralCode: Optional referral code (can be locked via URL)
└── selectedPlan: "basic" ($10) or "premium" ($20)

STEP 2: Connect Crypto Wallet
├── Click "Connect Real Wallet" button
├── Detect available wallets (MetaMask, Trust Wallet, etc.)
├── If no wallet found → Show installation instructions
├── Open wallet connection modal
├── User approves connection in wallet
├── Wallet address stored in state
└── Display connected address with copy button

STEP 3: Form Submission
├── Validate all fields
├── Check email doesn't exist (real-time API check)
├── Verify passwords match
├── Ensure wallet is connected
└── Proceed to payment selection

STEP 4: Payment Method Selection
├── Show SweetAlert2 modal
├── Options:
│   ├── USDT Payment (Recommended)
│   └── BNB Payment
├── User selects payment method
└── Proceed to blockchain transaction

STEP 5: Blockchain Payment Processing
├── Check current network (must be BSC Mainnet)
├── If wrong network → Auto-switch to BSC
├── Calculate payment amount:
│   ├── Basic: $10 = 0.014 BNB or 10 USDT
│   └── Premium: $20 = 0.028 BNB or 20 USDT
├── Show confirmation modal with details
├── User confirms payment
├── Trigger wallet transaction
├── Wait for blockchain confirmation (5 seconds)
├── Validate transaction on blockchain
└── Transaction hash received

STEP 6: Backend Registration
├── API Call: POST /api/auth/register
├── Body: {
│     name, email, mobile, country,
│     password, walletAddress,
│     referralCode, planType
│   }
├── Response: { token, user }
├── Store token in localStorage
└── Store user object in localStorage

STEP 7: Account Activation
├── API Call: POST /api/wallet/activate
├── Body: {
│     txHash, walletAddress, amount,
│     amountUSD, paymentType, tokenSymbol,
│     companyWallet, userWallet, chainId
│   }
├── Backend verifies transaction
├── Account marked as active
└── User can now access dashboard

STEP 8: Success & Redirect
├── Show success modal with transaction details
├── Display:
│   ├── Transaction hash
│   ├── From address (user wallet)
│   ├── To address (company wallet)
│   └── Amount paid
└── Navigate to /dashbord
```

**Key Code Snippets:**

```javascript
// Email validation with debounce
React.useEffect(() => {
  const timer = setTimeout(() => {
    if (formData.email) {
      checkEmailExists(formData.email);
    }
  }, 500);
  return () => clearTimeout(timer);
}, [formData.email]);

// Wallet connection
const connectWallet = async () => {
  const result = await realWalletService.connectWallet();
  if (result.success) {
    setConnectedWallet(result.account);
  }
};

// Payment processing
const handlePayment = async (paymentMethod) => {
  // Switch to BSC network
  await window.ethereum.request({
    method: "wallet_switchEthereumChain",
    params: [{ chainId: "0x38" }], // BSC Mainnet
  });

  // Send payment
  const paymentResult = paymentMethod === "usdt"
    ? await realWalletService.sendUSDTPayment(planAmount)
    : await realWalletService.sendPayment(planAmount);

  // Register user
  const response = await authAPI.register({...formData});
  
  // Activate account
  await walletAPI.activate({
    txHash: paymentResult.txHash,
    walletAddress: connectedWallet,
    ...paymentResult
  });
};
```

---


### 4️⃣ Login Flow (Login.jsx)

```javascript
STEP 1: User enters credentials
├── email: Email address
└── password: Password

STEP 2: Form validation
├── Check all fields filled
└── Validate email format

STEP 3: API authentication
├── API Call: POST /api/auth/login
├── Body: { email, password }
├── Response: { token, user, needsActivation }
└── Handle response

STEP 4: Check activation status
├── If needsActivation or !user.isActive:
│   ├── Show warning: "Account Not Activated"
│   └── Redirect to /activate
└── Else: Account is active

STEP 5: Store credentials & redirect
├── localStorage.setItem('token', token)
├── localStorage.setItem('user', JSON.stringify(user))
├── Show success message
└── Navigate to /dashbord
```

**Login.jsx Key Code:**
```javascript
const handleSubmit = async (e) => {
  e.preventDefault();
  
  if (!formData.email || !formData.password) {
    Swal.fire({
      icon: "warning",
      title: "Missing Fields",
      text: "Please fill all fields"
    });
    return;
  }

  try {
    const response = await authAPI.login(formData);
    
    localStorage.setItem('token', response.data.token);
    localStorage.setItem('user', JSON.stringify(response.data.user));

    if (response.data.needsActivation || !response.data.user.isActive) {
      Swal.fire({
        icon: "warning",
        title: "Account Not Activated",
        text: "Please complete $10 payment to activate"
      });
      navigate("/activate");
      return;
    }

    Swal.fire({
      icon: "success",
      title: "Login Successful 🎉"
    });
    navigate("/dashbord");
  } catch (error) {
    Swal.fire({
      icon: "error",
      title: "Login Failed",
      text: error.response?.data?.message || "Something went wrong"
    });
  }
};
```

---

### 5️⃣ Dashboard Layout Flow (MainDashBord.jsx)

```
┌─────────────────────────────────────────────────────────────┐
│                    HEADER (Sticky Top)                      │
│  [☰ Menu]  Dashboard                            [Avatar]    │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│                   CONTENT AREA                              │
│              (<Outlet /> renders here)                      │
│                                                             │
│  - Dashboard.jsx                                            │
│  - MyNFTs.jsx                                               │
│  - NFTMarketplace.jsx                                       │
│  - MyTeam.jsx                                               │
│  - etc.                                                     │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│              BOTTOM NAVIGATION (Fixed)                      │
│  [Team]  [Wallet]  [Dashboard]  [History]  [Profile]       │
└─────────────────────────────────────────────────────────────┘

SIDE DRAWER (when menu clicked):
┌─────────────────────────┐
│  Menu                 ✕ │
├─────────────────────────┤
│  📊 MY Dashboard        │
│  🛒 GTN Token Buy/Sell  │
│  💼 MY Portfolio        │
│  ⚙️  Token Management   │
│  👥 My Community        │
│  📦 Package Upgrade     │
│  📜 Token History       │
│  📧 Contact Us          │
│  🚪 Logout              │
└─────────────────────────┘
```

**MainDashBord.jsx Structure:**
```javascript
const MainDashBord = () => {
  const [showMenu, setShowMenu] = useState(false);
  const navigate = useNavigate();

  // Bottom navigation items
  const bottomNavItems = [
    { to: "/dashbord/my-team", label: "Team", icon: <FaUsers /> },
    { to: "/dashbord/wallet", label: "Wallet", icon: <FaWallet /> },
    { to: "/dashbord", label: "Dashboard", icon: <MdDashboard />, exact: true },
    { to: "/dashbord/history", label: "History", icon: <FaHistory /> },
    { to: "/dashbord/profile", label: "Profile", icon: <FaUser /> }
  ];

  // Side menu items
  const menuItems = [
    { to: "/dashbord/nft-dashboard", label: "MY Dashboard", icon: <FaChartBar /> },
    { to: "/dashbord/nft-marketplace", label: "GTN Token Buy & Sell", icon: <FaImage /> },
    { to: "/dashbord/my-nfts", label: "MY Portfolio", icon: <FaImage /> },
    { to: "/dashbord/nft-management", label: "Token Management", icon: <FaCog /> },
    { to: "/dashbord/mlm-tree", label: "My Community", icon: <FaUsers /> },
    { to: "/dashbord/package-upgrade", label: "Package Upgrade", icon: <FaChartBar /> },
    { to: "/dashbord/nft-history", label: "Token History", icon: <FaImage /> },
    { to: "/dashbord/contact-us", label: "Contact Us", icon: <FaEnvelope /> }
  ];

  return (
    <div className="flex flex-col min-h-screen bg-gray-100 max-w-md mx-auto">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-white/90 backdrop-blur">
        <button onClick={() => setShowMenu(true)}>
          <FaBars />
        </button>
        <h1>Dashboard</h1>
        <div onClick={() => navigate("/dashbord/profile")}>Avatar</div>
      </header>

      {/* Content */}
      <main className="flex-1 overflow-y-auto">
        <Outlet /> {/* Child routes render here */}
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-3 left-1/2 -translate-x-1/2">
        {bottomNavItems.map(item => (
          <NavLink key={item.to} to={item.to} end={item.exact}>
            {item.icon}
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Side Drawer */}
      {showMenu && (
        <div className="fixed inset-0 z-50 flex bg-black/40">
          <aside className="w-72 bg-white">
            {menuItems.map(item => (
              <NavLink key={item.to} to={item.to} onClick={() => setShowMenu(false)}>
                {item.icon} {item.label}
              </NavLink>
            ))}
            <button onClick={() => {
              localStorage.clear();
              navigate("/login");
            }}>
              <FaSignOutAlt /> Logout
            </button>
          </aside>
        </div>
      )}
    </div>
  );
};
```

---

### 6️⃣ MyNFTs Component Flow (MyNFTs.jsx)

This is your **ACTIVE FILE** - the NFT portfolio management component.

```javascript
COMPONENT STRUCTURE:
├── State Management
│   ├── myNFTs: [] (array of user's NFTs)
│   ├── stats: {} (portfolio statistics)
│   ├── loading: true (loading state)
│   └── selling: null (currently selling NFT ID)
│
├── useEffect (on mount)
│   └── fetchMyNFTs() - Load user's NFT portfolio
│
├── Functions
│   ├── fetchMyNFTs() - Fetch NFTs from API
│   ├── checkSellConditions(nft) - Validate if NFT can be sold
│   └── sellNFT(nftId) - List NFT for sale in marketplace
│
└── UI Rendering
    ├── Header with total count
    ├── Stats Cards (4 cards)
    │   ├── Hold NFTs (green)
    │   ├── Sell NFTs (blue)
    │   ├── Staked NFTs (purple)
    │   └── Potential Profit (green)
    └── NFT List (grid of NFT cards)
```

**Data Flow:**

```javascript
// 1. Fetch NFTs on component mount
useEffect(() => {
  fetchMyNFTs();
}, []);

// 2. Fetch NFTs function
const fetchMyNFTs = async () => {
  try {
    const response = await nftAPI.getMyNFTs();
    const nfts = response.data.nfts || [];
    const apiStats = response.data.stats || {};

    // Calculate profit for each NFT
    const nftsWithProfit = nfts.map((nft) => {
      const potentialProfit = nft.sellPrice ? nft.sellPrice * 0.7 : 0;
      return {
        ...nft,
        profit: nft.profit || potentialProfit,
        potentialProfit: potentialProfit,
      };
    });

    // Calculate stats
    const calculatedStats = {
      total: nftsWithProfit.length,
      holdNFTs: nftsWithProfit.filter(nft => nft.holdStatus === "hold").length,
      sellNFTs: nftsWithProfit.filter(nft => nft.holdStatus === "sell").length,
      stakedNFTs: nftsWithProfit.filter(nft => nft.isStaked).length,
      soldNFTs: nftsWithProfit.filter(nft => nft.status === "sold").length,
      totalValue: nftsWithProfit.reduce((sum, nft) => sum + (nft.buyPrice || 0), 0),
      totalProfit: nftsWithProfit.filter(nft => nft.status === "sold")
        .reduce((sum, nft) => sum + (nft.profit || 0), 0),
      potentialProfit: nftsWithProfit.filter(nft => nft.holdStatus === "sell")
        .reduce((sum, nft) => sum + (nft.potentialProfit || 0), 0),
    };

    setMyNFTs(nftsWithProfit);
    setStats(calculatedStats);
  } catch (error) {
    console.error("Error fetching NFTs:", error);
    // Show demo NFTs if API fails
  }
  setLoading(false);
};
```

**Sell Conditions Check:**

```javascript
const checkSellConditions = (nft) => {
  // Check if NFT is staked
  if (nft.isStaked) {
    return {
      allowed: false,
      reason: "NFT is currently staked",
      suggestion: "Unstake the NFT first before selling."
    };
  }

  // Check if NFT is burned
  if (nft.status === "burned") {
    return {
      allowed: false,
      reason: "NFT has been burned",
      suggestion: "Burned NFTs cannot be sold."
    };
  }

  // Check if already listed
  if (nft.status === "listed") {
    return {
      allowed: false,
      reason: "NFT is already listed in marketplace",
      suggestion: "Remove from marketplace first."
    };
  }

  // Check holdStatus - only 'sell' status can be sold
  if (nft.holdStatus !== "sell") {
    return {
      allowed: false,
      reason: `NFT holdStatus is '${nft.holdStatus}' - only 'sell' status can be sold`,
      suggestion: "Only NFTs with 'sell' holdStatus can be sold."
    };
  }

  return {
    allowed: true,
    reason: "All conditions met",
    suggestion: "NFT is ready to be sold"
  };
};
```

**Sell NFT Flow:**

```javascript
const sellNFT = async (nftId) => {
  const nft = myNFTs.find(n => n.nftId === nftId);
  
  // 1. Check sell conditions
  const canSell = checkSellConditions(nft);
  if (!canSell.allowed) {
    Swal.fire({
      icon: "warning",
      title: "Cannot Sell NFT",
      html: `
        <div>
          <p><strong>NFT:</strong> ${nft.nftId}</p>
          <p><strong>Reason:</strong> ${canSell.reason}</p>
          <p>${canSell.suggestion}</p>
        </div>
      `
    });
    return;
  }

  // 2. Show confirmation modal
  const result = await Swal.fire({
    title: "List NFT for Sale",
    html: `
      <div>
        <p><strong>NFT ID:</strong> ${nft.nftId}</p>
        <p><strong>List Price:</strong> $${nft.sellPrice}</p>
        <h4>💰 Payment When Sold</h4>
        <p>Your Share (70%): $${(nft.sellPrice * 0.7).toFixed(2)}</p>
        <p>Company Share (20%): $${(nft.sellPrice * 0.2).toFixed(2)}</p>
        <p>Parent Bonus (10%): $${(nft.sellPrice * 0.1).toFixed(2)}</p>
        <h4>🎁 Buyer Gets</h4>
        <p>• 2 new NFTs (1 Hold + 1 Sell)</p>
      </div>
    `,
    showCancelButton: true,
    confirmButtonText: "List for sell Confirm"
  });

  if (!result.isConfirmed) return;

  // 3. Call API to list NFT
  setSelling(nftId);
  try {
    const response = await nftAPI.sellNFT(nftId);

    Swal.fire({
      icon: "success",
      title: "NFT Listed Successfully!",
      html: `
        <div>
          <p><strong>NFT ID:</strong> ${response.data.nft?.nftId || nftId}</p>
          <p><strong>Listed Price:</strong> $${response.data.listedPrice || nft.sellPrice}</p>
          <p>💰 You will receive $${(nft.sellPrice * 0.7).toFixed(2)} when someone buys it</p>
        </div>
      `
    });

    // 4. Refresh NFT list
    fetchMyNFTs();

    // 5. Dispatch event to refresh marketplace
    window.dispatchEvent(new CustomEvent("nftListedForSale", {
      detail: { nftId: nftId, listedPrice: nft.sellPrice }
    }));
  } catch (error) {
    Swal.fire("Error", error.response?.data?.message || "Listing failed", "error");
  }
  setSelling(null);
};
```

**NFT Card UI:**

```javascript
{myNFTs.map((nft) => {
  const canSell = checkSellConditions(nft);
  return (
    <div key={nft.nftId} className="bg-white rounded-xl p-6">
      {/* NFT Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <img src="/22.png" alt="GTN Token" />
          <div>
            <h3>{nft.nftId}</h3>
            <p>Generation {nft.generation}</p>
            <p>{new Date(nft.createdAt).toLocaleDateString()}</p>
          </div>
        </div>
        <span className={`badge ${nft.holdStatus}`}>
          {nft.isStaked ? "Staked" : nft.holdStatus}
        </span>
      </div>

      {/* NFT Details */}
      <div className="grid grid-cols-3 gap-4">
        <div>
          <p>Buy Price</p>
          <p>${nft.buyPrice}</p>
        </div>
        <div>
          <p>Sell Price</p>
          <p>${nft.sellPrice}</p>
        </div>
        <div>
          <p>Potential Profit</p>
          <p>${nft.holdStatus === "sell" ? (nft.sellPrice * 0.7).toFixed(2) : "0.00"}</p>
          <p>{nft.holdStatus === "sell" ? "70% seller share" : "Hold NFT"}</p>
        </div>
      </div>

      {/* Action Button */}
      {canSell.allowed ? (
        <button onClick={() => sellNFT(nft.nftId)}>
          Token sell Price ${nft.sellPrice}
        </button>
      ) : (
        <div>
          <button disabled>Cannot Sell</button>
          <div className="error-message">
            <p>Reason: {canSell.reason}</p>
          </div>
        </div>
      )}
    </div>
  );
})}
```

---


### 7️⃣ NFT Marketplace Flow (NFTMarketplace.jsx)

```javascript
COMPONENT PURPOSE:
Buy NFTs from the marketplace (admin-created or user-listed)

STATE MANAGEMENT:
├── nfts: [] (available NFTs in current batch)
├── allNfts: [] (all NFTs from marketplace)
├── userBalance: 0 (user's current balance)
├── loading: true
├── buying: null (currently buying NFT ID)
└── currentBatch: 0 (current batch number)

DATA FLOW:
1. Component mounts
2. fetchMarketplace() - Load available NFTs
3. fetchBalance() - Get user's balance
4. Display NFTs in batches of 10
5. User clicks "Buy" button
6. buyNFT() - Process purchase
7. Update balance and NFT list
```

**Fetch Marketplace:**

```javascript
const fetchMarketplace = async () => {
  try {
    const response = await nftAPI.getMarketplace();
    const nftData = response.data.nfts || response.data || [];

    setAllNfts(nftData);
    
    // Calculate which batch to show based on sold NFTs
    let batchIndex = 0;
    for (let i = 0; i < nftData.length; i += 10) {
      const batch = nftData.slice(i, i + 10);
      const allSoldInBatch = batch.every(nft => 
        nft.status === 'sold' || nft.status === 'purchased'
      );
      
      if (!allSoldInBatch) {
        batchIndex = Math.floor(i / 10);
        break;
      }
    }
    
    const startIdx = batchIndex * 10;
    const currentBatchNfts = nftData.slice(startIdx, startIdx + 10);
    
    // Filter out sold NFTs
    const availableNfts = currentBatchNfts.filter(nft => 
      nft.status !== 'sold' && nft.status !== 'purchased'
    );
    
    setNfts(availableNfts);
    setCurrentBatch(batchIndex);
  } catch (error) {
    console.error("Error fetching marketplace:", error);
    setNfts([]);
  }
  setLoading(false);
};
```

**Buy NFT:**

```javascript
const buyNFT = async (nftId, price, isUserListed = false) => {
  // 1. Check balance
  if (userBalance < price) {
    Swal.fire("Error", `Insufficient balance. Need $${price}`, "error");
    return;
  }

  setBuying(nftId);
  try {
    let response;

    if (isUserListed) {
      // Buying user-listed NFT (resold NFT)
      response = await nftAPI.buyNFT(nftId);

      Swal.fire({
        icon: "success",
        title: "User NFT Purchased!",
        html: `
          <div>
            <h4>🎁 You Received 2 NFTs:</h4>
            <p>• 1 Hold NFT (for keeping)</p>
            <p>• 1 Sell NFT (can sell later)</p>
            <h4>💰 Payment Distribution:</h4>
            <p>• Original seller: $${(price * 0.7).toFixed(2)} (70%)</p>
            <p>• Company: $${(price * 0.2).toFixed(2)} (20%)</p>
            <p>• Parents: $${(price * 0.1).toFixed(2)} (10%)</p>
          </div>
        `
      });
    } else {
      // Buying admin NFT
      try {
        response = await nftAPI.buyPreLaunchNFT();
      } catch (error) {
        if (error.response?.status === 400) {
          response = await nftAPI.buyTradingNFT();
        } else {
          throw error;
        }
      }

      Swal.fire({
        icon: "success",
        title: "NFT Purchased Successfully",
        text: "Thanks for being a Part of GTN Project in Phase-1"
      });
    }

    // Refresh data
    await fetchMarketplace();
    await fetchBalance();

    // Dispatch balance update event
    window.dispatchEvent(new CustomEvent("balanceUpdate", {
      detail: { balance: response.data.newBalance || userBalance - price }
    }));
  } catch (error) {
    Swal.fire("Error", error.response?.data?.message || "Purchase failed", "error");
  }
  setBuying(null);
};
```

**NFT Card in Marketplace:**

```javascript
{nfts.map((nft) => (
  <div key={nft._id || nft.nftId} className="bg-white rounded-lg p-4">
    {/* NFT Header */}
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <img src="/22.png" alt="GTN Token" />
        <div>
          <h3>{nft.nftId}</h3>
          <p>Gen {nft.generation} • Phase {nft.batchId}</p>
        </div>
      </div>
      <span className="badge">{nft.status}</span>
    </div>

    {/* NFT Details */}
    <div className="grid grid-cols-2 gap-2">
      <div>
        <p>Buy Price</p>
        <p>${nft.buyPrice}</p>
      </div>
      <div>
        <p>Sell Price</p>
        <p>${nft.sellPrice}</p>
      </div>
    </div>

    {/* Profit Preview */}
    <div className="bg-blue-50 p-2 rounded">
      <p>💰 Potential Profit: ${(nft.sellPrice * 0.4).toFixed(2)} (40%)</p>
      <p>+ 2 new NFTs worth ${nft.sellPrice}</p>
    </div>

    {/* Buy Button */}
    <button
      onClick={() => buyNFT(nft.nftId, nft.buyPrice, nft.type === "user_resold")}
      disabled={buying === nft.nftId || userBalance < nft.buyPrice}
      className={userBalance >= nft.buyPrice ? "btn-primary" : "btn-disabled"}
    >
      {buying === nft.nftId ? (
        <Spinner />
      ) : userBalance >= nft.buyPrice ? (
        <>Buy ${nft.buyPrice} {nft.type === "user_resold" ? "(User)" : "(GTN Token)"}</>
      ) : (
        <>Need ${(nft.buyPrice - userBalance).toFixed(2)} More</>
      )}
    </button>

    {/* Status Messages */}
    {userBalance < nft.buyPrice && (
      <div className="error-message">
        ⚠️ Insufficient Balance: Need ${nft.buyPrice}, Have ${userBalance.toFixed(2)}
      </div>
    )}
  </div>
))}
```

---

### 8️⃣ Dashboard Component Flow (Dashboard.jsx)

```javascript
COMPONENT PURPOSE:
Main dashboard overview with stats and recent activity

STATE MANAGEMENT:
├── stats: {
│     balance, totalEarnings, teamSize,
│     activeTeamMembers, totalTransactions,
│     recentTransactions, nftCount
│   }
├── nftStats: { total, holding, sold, totalProfit }
├── currentPackage: "basic"
├── loading: true
├── balanceLoaded: false
├── showLevelModal: false
└── levelEarnings: []

DATA FETCHING:
1. fetchDashboardData() - User stats
2. fetchNFTStats() - NFT portfolio stats
3. fetchPackageInfo() - Current package
4. fetchLevelEarnings() - MLM earnings by level
```

**Fetch Dashboard Data:**

```javascript
const fetchDashboardData = async () => {
  try {
    // Fetch dashboard and balance in parallel
    const [dashboardRes, balanceRes] = await Promise.allSettled([
      userAPI.getDashboard(),
      walletAPI.getBalance()
    ]);
    
    const dashboardData = dashboardRes.status === 'fulfilled' 
      ? dashboardRes.value.data.stats || {} 
      : {};
    const balanceData = balanceRes.status === 'fulfilled' 
      ? balanceRes.value.data 
      : { balance: 0 };
    
    // Use balance from API or localStorage fallback
    const balance = balanceData.balance || 
      parseFloat(localStorage.getItem('demoBalance') || '0');

    // Fetch recent transactions
    let recentTransactions = [];
    try {
      const userTransRes = await userAPI.getTransactions();
      recentTransactions = (userTransRes.data.transactions || [])
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 5);
    } catch {
      recentTransactions = [];
    }

    setStats({
      balance,
      teamSize: dashboardData.teamSize || 0,
      activeTeamMembers: dashboardData.activeTeamMembers || 0,
      recentTransactions,
      totalEarnings: dashboardData.totalEarnings || 0,
      nftCount: dashboardData.nftCount || 0,
      totalInvestment: dashboardData.totalInvestment || 0,
      currentPlan: dashboardData.currentPlan || "basic"
    });
    setBalanceLoaded(true);
  } catch (error) {
    // Fallback to localStorage
    const localBalance = localStorage.getItem("demoBalance") || 
      localStorage.getItem("userBalance");
    let balance = localBalance ? parseFloat(localBalance) : 0;

    setStats(prev => ({ ...prev, balance }));
    setBalanceLoaded(true);
  }
};
```

**Dashboard UI:**

```javascript
return (
  <div className="min-h-screen bg-gray-50">
    {/* Wallet Status */}
    <WalletStatus />

    {/* Balance + Team Cards */}
    <div className="grid grid-cols-1 gap-3">
      <div className="bg-gradient-to-r from-green-600 to-green-700 p-4 rounded-xl text-white">
        <FaWallet size={22} />
        <p>Balance</p>
        <p className="text-2xl font-bold">${stats.balance.toFixed(2)}</p>
      </div>

      <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-4 rounded-xl text-white">
        <FaUsers size={22} />
        <p>Team Size</p>
        <p className="text-2xl font-bold">{stats.teamSize}</p>
      </div>
    </div>

    {/* NFT + Package Stats */}
    <div className="grid grid-cols-2 gap-3">
      <div className="bg-white p-3 rounded-xl">
        <FaImage />
        <p>Total GTN Token</p>
        <p className="font-bold">{nftStats.total}</p>
      </div>
      <div className="bg-white p-3 rounded-xl">
        <FaImage />
        <p>Holding</p>
        <p className="font-bold">{nftStats.holding}</p>
      </div>
      <div className="bg-white p-3 rounded-xl">
        <FaChartLine />
        <p>GTN Profit</p>
        <p className="font-bold">${nftStats.totalProfit}</p>
      </div>
      <div className="bg-white p-3 rounded-xl">
        <FaRocket />
        <p>Package</p>
        <p className="font-bold">{currentPackage.toUpperCase()}</p>
      </div>
    </div>

    {/* Recent Activity */}
    <div className="bg-white rounded-xl">
      <div className="px-4 py-3 border-b font-semibold">Recent Activity</div>
      <div className="p-4 space-y-3">
        {stats.recentTransactions.length ? (
          stats.recentTransactions.map((t, i) => (
            <div key={i} className="flex justify-between">
              <span>{t.description || t.type}</span>
              <span className="font-semibold">${t.amount}</span>
            </div>
          ))
        ) : (
          <p className="text-center text-gray-400">No activity</p>
        )}
      </div>
    </div>
  </div>
);
```

---

## 🔌 API Integration Details (services/api.js)

### API Configuration

```javascript
const API_URL = import.meta.env.VITE_API_URL;
const API_BASE_URL = `${API_URL}/api`;

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to all requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

### API Endpoints

#### Auth API
```javascript
export const authAPI = {
  checkEmail: (email) => api.post('/auth/check-email', { email }),
  register: (userData) => api.post('/auth/register', userData),
  login: (credentials) => api.post('/auth/login', credentials),
  getAllUsers: () => api.get('/auth/Getuser'),
};
```

#### User API
```javascript
export const userAPI = {
  getProfile: () => api.get('/user/profile'),
  getDashboard: () => api.get('/user/dashboard'),
  getTeam: () => api.get('/user/team'),
  getTransactions: () => api.get('/user/transactions'),
  getMLMTree: () => api.get('/user/mlm-tree'),
  getMLMEarnings: () => api.get('/user/mlm-earnings'),
};
```

#### Wallet API
```javascript
export const walletAPI = {
  activate: (paymentData) => api.post('/wallet/activate', paymentData),
  withdraw: (amount, walletAddress) => api.post('/wallet/withdraw', { amount, walletAddress }),
  getBalance: () => api.get('/wallet/balance'),
  getTransactions: () => api.get('/wallet/transactions'),
  recordPayment: (paymentData) => api.post('/wallet/record-payment', paymentData),
  addBalance: (amount) => api.post('/admin/demo-add-balance', { amount }),
};
```

#### NFT API
```javascript
export const nftAPI = {
  initializeSystem: () => api.post('/nft/initialize'),
  getNFTStatus: () => api.get('/nft/status'),
  getMarketplace: () => api.get('/nft/marketplace'),
  buyPreLaunchNFT: () => api.post('/nft/buy-prelaunch'),
  buyTradingNFT: () => api.post('/nft/buy-trading'),
  sellNFT: (nftId) => api.post(`/nft/sell/${nftId}`),
  getMyNFTs: () => api.get('/nft/my-nfts'),
  stakeNFT: (nftId) => api.post('/nft/stake', { nftId }),
  burnNFT: (nftId) => api.post('/nft/burn', { nftId }),
  buyNFT: (nftId) => api.post('/nft/buy', { nftId }),
};
```

#### Package API
```javascript
export const packageAPI = {
  getPlans: () => api.get('/package/plans'),
  upgrade: () => api.post('/package/upgrade'),
  getCurrent: () => api.get('/package/current'),
};
```

#### MLM API
```javascript
export const mlmAPI = {
  getHierarchy: () => api.get('/mlm/hierarchy'),
  getUserTree: (userId) => api.get(`/mlm/user/${userId}/tree`),
  getUserStats: (userId) => api.get(`/mlm/user/${userId}/stats`),
  getRootUsers: () => api.get('/mlm/root-users'),
};
```

---

## 💾 State Management & Data Flow

### Local Storage Usage

```javascript
// Stored Data
localStorage.setItem('token', jwtToken);              // JWT authentication token
localStorage.setItem('user', JSON.stringify(user));   // User object
localStorage.setItem('demoBalance', balance);         // Demo balance (fallback)
localStorage.setItem('hasSeenPhase2Notice', 'true'); // Notice flag

// Reading Data
const token = localStorage.getItem('token');
const user = JSON.parse(localStorage.getItem('user'));
const balance = parseFloat(localStorage.getItem('demoBalance') || '0');

// Clearing Data (Logout)
localStorage.clear();
```

### Event-Driven Updates

```javascript
// Dispatch balance update event
window.dispatchEvent(new CustomEvent("balanceUpdate", {
  detail: { balance: newBalance }
}));

// Listen for balance updates
useEffect(() => {
  const handleBalanceUpdate = (event) => {
    setBalance(event.detail.balance);
  };
  
  window.addEventListener("balanceUpdate", handleBalanceUpdate);
  window.addEventListener("walletBalanceUpdate", handleBalanceUpdate);
  
  return () => {
    window.removeEventListener("balanceUpdate", handleBalanceUpdate);
    window.removeEventListener("walletBalanceUpdate", handleBalanceUpdate);
  };
}, []);

// Dispatch NFT listed event
window.dispatchEvent(new CustomEvent("nftListedForSale", {
  detail: { nftId, listedPrice }
}));

// Dispatch package update event
window.dispatchEvent(new CustomEvent("packageUpdate", {
  detail: { package: newPackage }
}));
```

### Component State Patterns

```javascript
// Data state
const [nfts, setNfts] = useState([]);
const [stats, setStats] = useState({});
const [transactions, setTransactions] = useState([]);

// Loading state
const [loading, setLoading] = useState(true);
const [isLoading, setIsLoading] = useState(false);

// Form state
const [formData, setFormData] = useState({
  name: "",
  email: "",
  password: ""
});

// UI state
const [showMenu, setShowMenu] = useState(false);
const [activeTab, setActiveTab] = useState("overview");
```

---

