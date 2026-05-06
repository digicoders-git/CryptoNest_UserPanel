# 📦 NFTManagement.jsx - Detailed Component Analysis

## Component Overview

**File:** `src/Dashbord/NFTManagement.jsx`  
**Purpose:** Manage user's NFT portfolio - buy, sell, and track NFTs  
**Route:** `/dashbord/nft-management`

---

## Component Structure

```javascript
NFTManagement (Functional Component)
├── Imports
│   ├── React, useState, useEffect
│   ├── Icons (FaImage, FaShoppingCart, FaDollarSign)
│   ├── Swal (SweetAlert2)
│   └── axios
├── State Variables
│   ├── nfts: []
│   ├── stats: {}
│   └── loading: false
├── Effects
│   └── useEffect → fetchNFTs()
├── Functions
│   ├── fetchNFTs()
│   ├── buyNFT()
│   └── sellNFT(nftId)
└── JSX Return
    ├── Header Section
    ├── Stats Cards
    └── NFT List
```

---

## State Management

### 1. **nfts** (Array)

```javascript
const [nfts, setNfts] = useState([]);
```

**Purpose:** Store user's NFT collection  
**Structure:**

```javascript
[
  {
    _id: "mongo_object_id",
    nftId: "NFT-001",
    buyPrice: 10,
    sellPrice: 20,
    status: "hold" | "sold",
    profit: 8,
    createdAt: "2024-01-01T00:00:00.000Z",
  },
  // ... more NFTs
];
```

**Updates:**

- On component mount (fetchNFTs)
- After buying NFTs (buyNFT)
- After selling NFTs (sellNFT)

---

### 2. **stats** (Object)

```javascript
const [stats, setStats] = useState({});
```

**Purpose:** Track NFT statistics  
**Structure:**

```javascript
{
  total: 10,        // Total NFTs ever owned
  holding: 5,       // Currently holding
  sold: 5,          // Already sold
  totalProfit: 40   // Total profit earned ($)
}
```

**Display:**

- Blue Card: Total NFTs
- Green Card: Holding
- Yellow Card: Sold
- Purple Card: Total Profit

---

### 3. **loading** (Boolean)

```javascript
const [loading, setLoading] = useState(false);
```

**Purpose:** Manage loading state during API calls  
**Usage:**

- Set to `true` before API call
- Set to `false` after API call completes
- Disables buttons when `true`

---

## Functions Deep Dive

### 1. fetchNFTs()

**Purpose:** Fetch user's NFTs from backend

```javascript
const fetchNFTs = async () => {
  try {
    // Get authentication token
    const token = localStorage.getItem("token");

    // API call with authorization
    const response = await axios.get(
      "https://api.gtnworld.live/api/nft/my-nfts",
      { headers: { Authorization: `Bearer ${token}` } },
    );

    // Update state
    setNfts(response.data.nfts);
    setStats(response.data.stats);
  } catch (error) {
    console.error("Error fetching NFTs:", error);
  }
};
```

**Flow:**

1. Retrieve JWT token from localStorage
2. Make GET request to `/api/nft/my-nfts`
3. Include token in Authorization header
4. Parse response data
5. Update `nfts` and `stats` state
6. Handle errors silently (console.error)

**Called:**

- On component mount (useEffect)
- After successful buy
- After successful sell

**API Response:**

```javascript
{
  nfts: [
    { _id, nftId, buyPrice, sellPrice, status, profit, createdAt },
    // ...
  ],
  stats: {
    total: 10,
    holding: 5,
    sold: 5,
    totalProfit: 40
  }
}
```

---

### 2. buyNFT()

**Purpose:** Purchase new NFTs

```javascript
const buyNFT = async () => {
  // Step 1: Show input modal
  const { value: quantity } = await Swal.fire({
    title: "Buy NFT",
    input: "number",
    inputLabel: "Quantity",
    inputValue: 1,
    inputAttributes: { min: 1, max: 10 },
    showCancelButton: true,
    confirmButtonColor: "#0f7a4a",
    inputValidator: (value) => {
      if (!value || value < 1) return "Please enter valid quantity";
    },
  });

  // Step 2: Process purchase
  if (quantity) {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        "https://api.gtnworld.live/api/nft/buy",
        { quantity: parseInt(quantity) },
        { headers: { Authorization: `Bearer ${token}` } },
      );

      // Step 3: Show success
      Swal.fire({
        icon: "success",
        title: "NFT Purchased!",
        text: `Successfully bought ${quantity} NFT(s)`,
        confirmButtonColor: "#0f7a4a",
      });

      // Step 4: Refresh data
      fetchNFTs();
    } catch (error) {
      // Step 5: Handle error
      Swal.fire({
        icon: "error",
        title: "Purchase Failed",
        text: error.response?.data?.message || "Something went wrong",
      });
    }
    setLoading(false);
  }
};
```

**Flow Breakdown:**

**Step 1: User Input**

- Display SweetAlert2 modal
- Input type: number
- Default value: 1
- Min: 1, Max: 10
- Validation: Must be ≥ 1

**Step 2: API Call**

- Endpoint: POST `/api/nft/buy`
- Body: `{ quantity: parseInt(quantity) }`
- Headers: Authorization Bearer token

**Step 3: Success Handling**

- Show success alert
- Message: "Successfully bought X NFT(s)"
- Refresh NFT list

**Step 4: Error Handling**

- Show error alert
- Display backend error message
- Or generic "Something went wrong"

**User Experience:**

```
Click "Buy NFT"
  → Modal appears
  → Enter quantity (e.g., 3)
  → Click confirm
  → Loading state
  → Success message
  → NFT list updates
  → Stats update
```

---

### 3. sellNFT(nftId)

**Purpose:** Sell specific NFT for profit

```javascript
const sellNFT = async (nftId) => {
  // Step 1: Confirmation
  const result = await Swal.fire({
    title: "Sell NFT",
    text: "Sell for $20 (40% = $8 profit)",
    icon: "question",
    showCancelButton: true,
    confirmButtonColor: "#0f7a4a",
    confirmButtonText: "Sell Now",
  });

  // Step 2: Process sale
  if (result.isConfirmed) {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        `https://api.gtnworld.live/api/nft/sell/${nftId}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } },
      );

      // Step 3: Show success
      Swal.fire({
        icon: "success",
        title: "NFT Sold!",
        text: "You earned $8 profit",
        confirmButtonColor: "#0f7a4a",
      });

      // Step 4: Refresh data
      fetchNFTs();
    } catch (error) {
      // Step 5: Handle error
      Swal.fire({
        icon: "error",
        title: "Sale Failed",
        text: error.response?.data?.message || "Something went wrong",
      });
    }
    setLoading(false);
  }
};
```

**Flow Breakdown:**

**Step 1: Confirmation**

- Display confirmation modal
- Show profit calculation
- Text: "Sell for $20 (40% = $8 profit)"
- User can cancel or confirm

**Step 2: API Call**

- Endpoint: POST `/api/nft/sell/:nftId`
- URL parameter: nftId (e.g., "NFT-001")
- Body: Empty object `{}`
- Headers: Authorization Bearer token

**Step 3: Success Handling**

- Show success alert
- Message: "You earned $8 profit"
- Refresh NFT list
- Update stats

**Step 4: Error Handling**

- Show error alert
- Display backend error message
- Or generic "Something went wrong"

**Profit Calculation:**

```
Buy Price:    $10
Sell Price:   $20
Gross Profit: $10 (100%)
User Profit:  $8  (40%)
Platform Fee: $2  (60% - goes to MLM/platform)
```

**User Experience:**

```
Click "Sell for $20" on NFT card
  → Confirmation modal
  → Shows profit: $8
  → Click "Sell Now"
  → Loading state
  → Success message
  → NFT status changes to "sold"
  → Stats update (holding -1, sold +1, profit +$8)
```

---

## useEffect Hook

```javascript
useEffect(() => {
  fetchNFTs();
}, []);
```

**Purpose:** Load NFTs when component mounts  
**Dependencies:** Empty array `[]` - runs once on mount  
**Action:** Calls `fetchNFTs()` to load initial data

**Lifecycle:**

```
Component Mounts
  ↓
useEffect Runs
  ↓
fetchNFTs() Called
  ↓
API Request
  ↓
State Updated
  ↓
Component Re-renders with Data
```

---

## JSX Structure

### Header Section

```jsx
<div className="flex items-center justify-between">
  <h2>NFT Management</h2>
  <button onClick={buyNFT} disabled={loading}>
    <FaShoppingCart />
    Buy NFT
  </button>
</div>
```

**Features:**

- Title: "NFT Management"
- Buy button with icon
- Disabled during loading

---

### Stats Cards Section

```jsx
<div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
  {/* Card 1: Total NFTs */}
  <div className="bg-blue-50 p-4 rounded-xl text-center">
    <FaImage className="mx-auto text-blue-600 mb-2" />
    <p className="text-sm text-gray-600">Total NFTs</p>
    <p className="text-xl font-bold text-blue-600">{stats.total || 0}</p>
  </div>

  {/* Card 2: Holding */}
  <div className="bg-green-50 p-4 rounded-xl text-center">
    <FaImage className="mx-auto text-green-600 mb-2" />
    <p className="text-sm text-gray-600">Holding</p>
    <p className="text-xl font-bold text-green-600">{stats.holding || 0}</p>
  </div>

  {/* Card 3: Sold */}
  <div className="bg-yellow-50 p-4 rounded-xl text-center">
    <FaImage className="mx-auto text-yellow-600 mb-2" />
    <p className="text-sm text-gray-600">Sold</p>
    <p className="text-xl font-bold text-yellow-600">{stats.sold || 0}</p>
  </div>

  {/* Card 4: Profit */}
  <div className="bg-purple-50 p-4 rounded-xl text-center">
    <FaDollarSign className="mx-auto text-purple-600 mb-2" />
    <p className="text-sm text-gray-600">Profit</p>
    <p className="text-xl font-bold text-purple-600">
      ${stats.totalProfit || 0}
    </p>
  </div>
</div>
```

**Layout:**

- Grid: 2 columns on mobile, 4 on desktop
- Each card has icon, label, and value
- Color-coded by category
- Fallback to 0 if stats undefined

---

### NFT List Section

```jsx
<div className="bg-white rounded-xl p-4">
  <h3 className="font-semibold mb-4">My NFTs</h3>

  {nfts.length > 0 ? (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {nfts.map((nft) => (
        <div key={nft._id} className="border rounded-lg p-4">
          {/* NFT Header */}
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">{nft.nftId}</span>
            <span className={`px-2 py-1 rounded text-xs ${
              nft.status === 'hold'
                ? 'bg-green-100 text-green-700'
                : 'bg-gray-100 text-gray-700'
            }`}>
              {nft.status}
            </span>
          </div>

          {/* Price Info */}
          <p className="text-sm text-gray-600 mb-3">
            Buy: ${nft.buyPrice} → Sell: ${nft.sellPrice}
          </p>

          {/* Action Button (if holding) */}
          {nft.status === 'hold' && (
            <button
              onClick={() => sellNFT(nft.nftId)}
              className="w-full bg-[#0f7a4a] text-white py-2 rounded text-sm"
            >
              Sell for $20
            </button>
          )}

          {/* Profit Display (if sold) */}
          {nft.status === 'sold' && (
            <p className="text-sm text-green-600 font-medium">
              Profit: ${nft.profit}
            </p>
          )}
        </div>
      ))}
    </div>
  ) : (
    {/* Empty State */}
    <div className="text-center py-8 text-gray-500">
      <FaImage size={48} className="mx-auto mb-4 opacity-50" />
      <p>No NFTs found. Buy your first NFT!</p>
    </div>
  )}
</div>
```

**Features:**

- Grid layout: 1/2/3 columns (responsive)
- Each NFT card shows:
  - NFT ID (e.g., "NFT-001")
  - Status badge (hold/sold)
  - Price information
  - Action button (if holding)
  - Profit display (if sold)
- Empty state when no NFTs

---

## Styling Details

### Color Scheme

```css
Primary Green: #0f7a4a
Blue (Total): bg-blue-50, text-blue-600
Green (Holding): bg-green-50, text-green-600
Yellow (Sold): bg-yellow-50, text-yellow-600
Purple (Profit): bg-purple-50, text-purple-600
```

### Responsive Classes

```
Mobile: grid-cols-1, grid-cols-2
Tablet: sm:grid-cols-2, sm:grid-cols-4
Desktop: lg:grid-cols-3
```

### Spacing

```
Gap: gap-3, gap-4
Padding: p-4, p-6
Margin: mb-2, mb-3, mb-4
```

---

## API Integration

### Endpoints Used

**1. GET /api/nft/my-nfts**

```javascript
Request:
  Headers: { Authorization: 'Bearer <token>' }

Response:
  {
    nfts: [
      {
        _id: "...",
        nftId: "NFT-001",
        buyPrice: 10,
        sellPrice: 20,
        status: "hold",
        profit: 0,
        createdAt: "..."
      }
    ],
    stats: {
      total: 10,
      holding: 5,
      sold: 5,
      totalProfit: 40
    }
  }
```

**2. POST /api/nft/buy**

```javascript
Request:
  Headers: { Authorization: 'Bearer <token>' }
  Body: { quantity: 3 }

Response:
  {
    message: "Successfully purchased 3 NFT(s)",
    nfts: [...]
  }
```

**3. POST /api/nft/sell/:nftId**

```javascript
Request:
  Headers: { Authorization: 'Bearer <token>' }
  Body: {}

Response:
  {
    message: "NFT sold successfully",
    profit: 8,
    newBalance: 108
  }
```

---

## Error Handling

### Network Errors

```javascript
catch (error) {
  Swal.fire({
    icon: 'error',
    title: 'Operation Failed',
    text: error.response?.data?.message || 'Something went wrong'
  });
}
```

### Validation Errors

```javascript
inputValidator: (value) => {
  if (!value || value < 1) {
    return "Please enter valid quantity";
  }
};
```

### Silent Errors

```javascript
catch (error) {
  console.error('Error fetching NFTs:', error);
  // No user notification for fetch errors
}
```

---

## User Interactions

### 1. Buy NFT

```
User clicks "Buy NFT" button
  ↓
Modal appears with quantity input
  ↓
User enters quantity (1-10)
  ↓
User clicks confirm
  ↓
Loading state activates
  ↓
API call processes
  ↓
Success alert shows
  ↓
NFT list refreshes
  ↓
Stats update
```

### 2. Sell NFT

```
User clicks "Sell for $20" on NFT card
  ↓
Confirmation modal appears
  ↓
Shows profit calculation ($8)
  ↓
User clicks "Sell Now"
  ↓
Loading state activates
  ↓
API call processes
  ↓
Success alert shows profit
  ↓
NFT status changes to "sold"
  ↓
Stats update
```

---

## State Updates Timeline

### Initial Load

```
1. Component mounts
2. useEffect runs
3. fetchNFTs() called
4. nfts = []
5. stats = {}
6. API response received
7. nfts = [NFT-001, NFT-002, ...]
8. stats = { total: 2, holding: 2, sold: 0, totalProfit: 0 }
9. Component re-renders with data
```

### After Buy

```
1. buyNFT() called
2. loading = true
3. API call
4. loading = false
5. fetchNFTs() called
6. nfts updated with new NFTs
7. stats.total increases
8. stats.holding increases
9. Component re-renders
```

### After Sell

```
1. sellNFT(nftId) called
2. loading = true
3. API call
4. loading = false
5. fetchNFTs() called
6. NFT status changes to "sold"
7. stats.holding decreases
8. stats.sold increases
9. stats.totalProfit increases by $8
10. Component re-renders
```

---

## Performance Considerations

### Optimizations

1. **Conditional Rendering:** Only render NFT list if data exists
2. **Loading States:** Prevent multiple simultaneous API calls
3. **Error Boundaries:** Graceful error handling
4. **Memoization:** Could use useMemo for stats calculations

### Potential Improvements

```javascript
// Add loading skeleton
{
  loading && <Skeleton />;
}

// Memoize expensive calculations
const totalValue = useMemo(
  () => nfts.reduce((sum, nft) => sum + nft.buyPrice, 0),
  [nfts],
);

// Debounce rapid clicks
const debouncedBuy = useDebounce(buyNFT, 300);
```

---

## Testing Scenarios

### Unit Tests

```javascript
// Test 1: Component renders
test("renders NFT Management title", () => {
  render(<NFTManagement />);
  expect(screen.getByText("NFT Management")).toBeInTheDocument();
});

// Test 2: Fetch on mount
test("fetches NFTs on mount", () => {
  render(<NFTManagement />);
  expect(axios.get).toHaveBeenCalledWith("/api/nft/my-nfts");
});

// Test 3: Buy NFT flow
test("opens modal on buy click", async () => {
  render(<NFTManagement />);
  fireEvent.click(screen.getByText("Buy NFT"));
  expect(Swal.fire).toHaveBeenCalled();
});
```

### Integration Tests

```javascript
// Test full buy flow
test("completes NFT purchase", async () => {
  // Mock API
  axios.post.mockResolvedValue({ data: { message: "Success" } });

  // Render component
  render(<NFTManagement />);

  // Click buy
  fireEvent.click(screen.getByText("Buy NFT"));

  // Enter quantity
  // Confirm
  // Assert success
});
```

---

## Summary

**NFTManagement.jsx** is a well-structured React component that:

✅ Manages NFT portfolio (buy/sell)  
✅ Displays real-time statistics  
✅ Handles user interactions smoothly  
✅ Integrates with backend API  
✅ Provides clear user feedback  
✅ Handles errors gracefully  
✅ Responsive design  
✅ Clean, maintainable code

**Key Strengths:**

- Simple state management
- Clear function responsibilities
- Good error handling
- User-friendly UI/UX
- Responsive design

**Potential Enhancements:**

- Add pagination for large NFT lists
- Implement filtering/sorting
- Add loading skeletons
- Optimize re-renders
- Add unit tests
