// Test wallet connection
console.log('Testing wallet connection...');
console.log('Window ethereum:', !!window.ethereum);
console.log('Location protocol:', window.location.protocol);
console.log('Is HTTPS:', window.location.protocol === 'https:');

if (window.ethereum) {
  window.ethereum.request({ method: 'eth_accounts' })
    .then(accounts => console.log('Accounts:', accounts))
    .catch(err => console.error('Error:', err));
}