# CryptoNest Frontend Code Flow Explanation (Hinglish)

Yeh guide aapko CryptoNest frontend project ka complete flow samjhayegi, step-by-step.

## 1. Application Initialization (Entry Point)
Sabse pehle start karte hain entry point se:

### main.jsx
- **WagmiProvider**: Yeh Web3/Wallet connectivity ke liye use hota hai. `realWalletService.wagmiConfig` se config load hoti hai.
- **QueryClientProvider**: `@tanstack/react-query` handle karta hai data fetching aur caching ko optimized tarike se.
- **BrowserRouter**: React Router ka use karke navigation enable karta hai.
- **realWalletService.initialize()**: Application start hote hi wallet service init ho jati hai.

### App.jsx
- Yeh simple component hai jo sirf `<Routesr />` ko render karta hai.

---

## 2. Routing Logic
Puri application ki navigation yahan define hai:

### Routes.jsx
- **Public Routes**: `/`, `/SingUp`, `/Login` (Welcome, Signup, aur Login pages).
- **Private/Protected Routes**: `/dashbord` ke andar saare main features hain.
- **Nested Routing**: `MainDashBord` layout component hai, aur uske andar `Outlet` ka use karke sub-pages render hote hain (jaise Wallet, History, NFT Marketplace).

---

## 3. Data Communication (API Services)
Backend se baat karne ke liye Axios ka use kiya gaya hai:

### api.js
- **Base URL**: `.env` file se `VITE_API_URL` leta hai.
- **Interceptors**: Har request ke header mein automatically `Bearer token` (localStorage se) add kar deta hai.
- **API Groups**: 
    - `authAPI`: Login/Register ke liye.
    - `userAPI`: Profile aur Dashboard stats ke liye.
    - `walletAPI`: Activate account, Balance check, aur Withdraw ke liye.
    - `nftAPI`: NFT buy/sell/stake logic ke liye.

---

## 4. Authentication Flow (Login/Signup)

### Signup Process (Singhup.jsx)
1. User form fill karta hai (Name, Email, Password, Referral Code).
2. `authAPI.register(formData)` call hoti hai.
3. Agar success hota hai, to token store hota hai aur user dashboard par redirect ho jata hai.

### Login Process
1. User Email aur Password dalta hai.
2. `authAPI.login()` call hoti hai.
3. `localStorage.setItem('token', response.token)` karke user session maintain hota hai.

---

## 5. Dashboard Structure

### MainDashBord.jsx
Yeh aapka main shell hai:
- **Header**: Top bar jisme Notification icon aur Logo hota hai.
- **Main Content**: `<Outlet />` yahan saare pages (Dashboard, Wallet, etc.) render hote hain.
- **Bottom Nav**: Mobile-friendly navigation menu.
- **Side Drawer**: Hamburger menu click karne par extra options dikhte hain (History, MLM Tree, Settings).
- **Notifications**: Dashboard load hote hi `fetchNotification` active announcements check karta hai aur `Swal` popup dikhata hai.

---

## 6. Real-Time Features
- **Firebase**: `firebaseService.js` push notifications handle karta hai.
- **Wallet Integration**: `realWalletService.js` smart contract se interact karne ke liye `wagmi` aur `viem` use karta hai.

## Summary Summary
Flow kuch aisa hai: 
`User` -> `main.jsx` (Init) -> `Routes.jsx` -> `Auth Check` -> `Dashboard (Layout)` -> `Pages (Logic via API.js)`.
