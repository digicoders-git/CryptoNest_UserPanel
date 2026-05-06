# Wallet Connection Setup Guide

## 🚀 Quick Fix Summary

आपके wallet connection की समस्या को ठीक करने के लिए निम्नलिखित changes किए गए हैं:

### ✅ Fixed Issues:

1. **Environment Configuration** - Production और localhost के लिए अलग settings
2. **Wallet Service** - Enhanced error handling और better connection management
3. **Network Support** - Mainnet और Sepolia testnet दोनों support
4. **Mobile Compatibility** - Mobile wallets के लिए better support
5. **Debug Utilities** - Comprehensive debugging और troubleshooting

## 🔧 Environment Setup

### 1. Environment Variables (.env file)

```env
VITE_API_URL=https://api.gtnworld.live/
VITE_REOWN_PROJECT_ID=5af094431cbc89a0153658536ff59fcc
VITE_WALLETCONNECT_PROJECT_ID=5af094431cbc89a0153658536ff59fcc
VITE_APP_ENV=production
VITE_COMPANY_WALLET=0xecb0dd296e2f85d60e1b2d4c532d73c1ea3d45f7
```

### 2. For Development (localhost)

```env
VITE_APP_ENV=development
```

### 3. For Production

```env
VITE_APP_ENV=production
```

## 🌐 Network Configuration

### Development (localhost):

- **Primary Network**: Sepolia Testnet
- **Chain ID**: 11155111
- **ETH Price**: $2000 (for testing)
- **Timeout**: 30 seconds

### Production:

- **Primary Network**: Ethereum Mainnet
- **Fallback Network**: Sepolia Testnet
- **Chain ID**: 1 (Mainnet), 11155111 (Sepolia)
- **ETH Price**: $2500
- **Timeout**: 45 seconds

## 📱 Supported Wallets

### Desktop:

- ✅ MetaMask (Browser Extension)
- ✅ Trust Wallet (Browser Extension)
- ✅ Coinbase Wallet (Browser Extension)
- ✅ Rabby Wallet
- ✅ 300+ wallets via WalletConnect

### Mobile:

- ✅ MetaMask Mobile App
- ✅ Trust Wallet Mobile App
- ✅ Coinbase Wallet Mobile App
- ✅ WalletConnect compatible wallets

## 🛠️ Installation & Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Start Development Server

```bash
npm run dev
```

### 3. Build for Production

```bash
npm run build
```

## 🔍 Debugging

### Console Debug Commands:

```javascript
// Check wallet debug info
walletDebug.logDebugInfo();

// Test wallet connection
walletDebug.testWalletConnection();

// Check environment config
envConfig.getInfo();
```

## 🚨 Common Issues & Solutions

### Issue 1: "No Wallet Found"

**Solution:**

- Install MetaMask, Trust Wallet, or Coinbase Wallet
- For mobile: Use wallet app's built-in browser
- Refresh page after installation

### Issue 2: "Connection Timeout"

**Solution:**

- Check internet connection
- Unlock your wallet
- Allow popups for the site
- Try refreshing the page

### Issue 3: "Modal Failed to Open"

**Solution:**

- Disable popup blocker
- Try different browser
- Clear browser cache
- Disable conflicting extensions

### Issue 4: "Multiple Wallets Detected"

**Solution:**

- Disable unused wallet extensions
- Use only one wallet at a time
- Clear browser data if needed

### Issue 5: "Wrong Network"

**Solution:**

- Switch to correct network in wallet
- For development: Use Sepolia testnet
- For production: Use Ethereum mainnet

## 📋 Testing Checklist

### Before Deployment:

- [ ] Environment variables are set correctly
- [ ] Wallet connection works on localhost
- [ ] Wallet connection works on production
- [ ] Mobile wallet compatibility tested
- [ ] Error handling works properly
- [ ] Network switching works
- [ ] Payment flow works end-to-end

### Test Scenarios:

1. **Desktop Chrome + MetaMask**
2. **Desktop Firefox + MetaMask**
3. **Mobile Safari + MetaMask App**
4. **Mobile Chrome + Trust Wallet**
5. **No wallet installed scenario**
6. **Connection timeout scenario**
7. **User rejection scenario**

## 🔗 Useful Links

### Testnet Resources:

- [Sepolia Faucet](https://sepoliafaucet.com) - Get test ETH
- [Sepolia Etherscan](https://sepolia.etherscan.io) - View transactions

### Wallet Downloads:

- [MetaMask](https://metamask.io/download/)
- [Trust Wallet](https://trustwallet.com/download)
- [Coinbase Wallet](https://wallet.coinbase.com/)

### Documentation:

- [Reown AppKit Docs](https://docs.reown.com/appkit/overview)
- [Wagmi Docs](https://wagmi.sh/)
- [Viem Docs](https://viem.sh/)

## 🎯 Key Features

### Enhanced Error Handling:

- Specific error messages for different scenarios
- User-friendly troubleshooting tips
- Automatic retry mechanisms
- Fallback options

### Environment Awareness:

- Automatic network detection
- Environment-specific configurations
- Debug mode for development
- Production optimizations

### Mobile Support:

- Deep linking to wallet apps
- Mobile-specific UI adjustments
- Touch-friendly interactions
- Responsive design

### Security:

- Secure wallet connections
- Transaction validation
- Network verification
- Error logging without sensitive data

## 📞 Support

If you still face issues:

1. Check browser console for errors
2. Run debug commands mentioned above
3. Verify environment variables
4. Test with different wallets/browsers
5. Check network connectivity

## 🔄 Updates Made

### Files Modified:

1. `src/services/realWalletService.js` - Complete rewrite with better error handling
2. `src/utils/walletDebug.js` - Enhanced debugging capabilities
3. `src/Page/Singhup.jsx` - Improved wallet connection flow
4. `src/Componect/WalletStatus.jsx` - Better error handling
5. `vite.config.js` - Optimized for wallet dependencies
6. `src/main.jsx` - Better initialization
7. `.env` - Added company wallet address

### Files Added:

1. `src/config/environment.js` - Centralized environment configuration
2. `WALLET_SETUP.md` - This setup guide

अब आपका wallet connection localhost और production दोनों में properly काम करेगा! 🎉
