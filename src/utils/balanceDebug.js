// Balance Debug Utility
// Console me ye commands run kar sakte ho

// 1. Check current balance
console.log('Current Balance:', localStorage.getItem('userBalance'));

// 2. Check all transactions
console.log('Transactions:', JSON.parse(localStorage.getItem('localTransactions') || '[]'));

// 3. Manually set balance (for testing)
// localStorage.setItem('userBalance', '100');
// localStorage.setItem('demoBalance', '100');

// 4. Clear all data (reset)
// localStorage.removeItem('userBalance');
// localStorage.removeItem('demoBalance');
// localStorage.removeItem('localTransactions');

// 5. Add test transaction
function addTestTransaction(amount) {
  const transactions = JSON.parse(localStorage.getItem('localTransactions') || '[]');
  transactions.unshift({
    id: Date.now(),
    type: 'credit',
    amount: amount,
    description: 'Test transaction',
    txHash: '0xtest' + Date.now(),
    createdAt: new Date().toISOString(),
    status: 'completed'
  });
  localStorage.setItem('localTransactions', JSON.stringify(transactions));
  console.log('✅ Test transaction added');
}

// 6. Check if backend API is working
async function testBackendAPI() {
  try {
    const token = localStorage.getItem('token');
    const response = await fetch('https://api.gtnworld.live/api/wallet/balance', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    const data = await response.json();
    console.log('Backend API Response:', data);
  } catch (error) {
    console.error('Backend API Error:', error);
  }
}

// Usage:
// addTestTransaction(50);
// testBackendAPI();

export { addTestTransaction, testBackendAPI };
