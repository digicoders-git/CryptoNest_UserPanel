// import React, { useState, useEffect } from 'react';
// import { FaInfoCircle, FaCoins, FaChartLine, FaRocket, FaPlay, FaLock, FaUnlock, FaFire, FaStore, FaClock, FaCheckCircle, FaDollarSign, FaGift } from 'react-icons/fa';
// import Swal from 'sweetalert2';
// import { nftAPI } from '../services/api';

// const NFTStatus = () => {
//   const [status, setStatus] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [initializing, setInitializing] = useState(false);

//   useEffect(() => {
//     fetchNFTStatus();
//     // Auto refresh every 30 seconds
//     const interval = setInterval(fetchNFTStatus, 30000);
//     return () => clearInterval(interval);
//   }, []);

//   const fetchNFTStatus = async () => {
//     try {
//       const response = await nftAPI.getNFTStatus();
//       setStatus(response.data);
//       console.log('📊 NFT Status:', response.data);
//     } catch (error) {
//       console.error('❌ Error fetching NFT status:', error);
//       // Demo status if API fails
//       setStatus({
//         currentPhase: 'pre-launch',
//         preLaunch: {
//           totalNFTs: 500,
//           soldNFTs: 0,
//           pricePerNFT: 10,
//           maxPerUser: 2,
//           isActive: true,
//           batchSize: 4,
//           availableNFTs: 500
//         },
//         trading: {
//           totalNFTs: 500000,
//           tradingPrice: 20,
//           buyOneGetOneFree: true,
//           isActive: false
//         },
//         blockchain: {
//           burnRatio: 40,
//           blockchainPrice: 0.25,
//           totalSupply: 40000000,
//           isLaunched: false
//         }
//       });
//     }
//     setLoading(false);
//   };

//   const initializeSystem = async () => {
//     const result = await Swal.fire({
//       title: 'Initialize NFT System',
//       html: `
//         <div class="text-left space-y-3">
//           <div class="bg-blue-50 p-3 rounded-lg">
//             <h4 class="font-bold text-blue-800 mb-2">🚀 System Initialization</h4>
//             <p class="text-sm text-blue-700">This will create 500 NFTs in 125 batches (4 NFTs each)</p>
//           </div>
//           <div class="bg-green-50 p-3 rounded-lg">
//             <h4 class="font-bold text-green-800 mb-2">📋 Pre-Launch Settings</h4>
//             <ul class="text-sm text-green-700 space-y-1">
//               <li>• Price: $10 per NFT</li>
//               <li>• Max per user: 2 NFTs</li>
//               <li>• First NFT: Hold status</li>
//               <li>• Second NFT: Sell status</li>
//             </ul>
//           </div>
//           <div class="bg-yellow-50 p-3 rounded-lg">
//             <h4 class="font-bold text-yellow-800 mb-2">⚠️ Important</h4>
//             <p class="text-sm text-yellow-700">User selling will be locked until all 500 admin NFTs are sold</p>
//           </div>
//         </div>
//       `,
//       icon: 'question',
//       showCancelButton: true,
//       confirmButtonColor: '#0f7a4a',
//       confirmButtonText: 'Initialize System',
//       cancelButtonText: 'Cancel',
//       width: '500px'
//     });

//     if (!result.isConfirmed) return;

//     setInitializing(true);
//     try {
//       const response = await nftAPI.initializeSystem();
      
//       Swal.fire({
//         icon: 'success',
//         title: 'NFT System Initialized!',
//         html: `
//           <div class="text-left space-y-2">
//             <p><strong>Total NFTs Created:</strong> ${response.data.totalNFTs}</p>
//             <p><strong>Total Batches:</strong> ${response.data.totalBatches}</p>
//             <p><strong>Batch Size:</strong> ${response.data.batchSize}</p>
//             <p><strong>Current Phase:</strong> ${response.data.system.currentPhase}</p>
//             <hr class="my-3">
//             <div class="bg-green-50 p-3 rounded">
//               <p class="text-green-800 font-medium">✅ System is now ready for users to buy NFTs!</p>
//             </div>
//           </div>
//         `,
//         confirmButtonColor: '#0f7a4a'
//       });
      
//       fetchNFTStatus();
//     } catch (error) {
//       Swal.fire({
//         icon: 'error',
//         title: 'Initialization Failed',
//         text: error.response?.data?.message || 'Something went wrong',
//         confirmButtonColor: '#dc2626'
//       });
//     }
//     setInitializing(false);
//   };

//   const getPhaseIcon = (phase) => {
//     switch (phase) {
//       case 'pre-launch': return <FaRocket className="text-blue-600" />;
//       case 'trading': return <FaStore className="text-green-600" />;
//       case 'blockchain': return <FaFire className="text-purple-600" />;
//       default: return <FaClock className="text-gray-600" />;
//     }
//   };

//   const getPhaseColor = (phase) => {
//     switch (phase) {
//       case 'pre-launch': return 'bg-blue-100 text-blue-800 border-blue-200';
//       case 'trading': return 'bg-green-100 text-green-800 border-green-200';
//       case 'blockchain': return 'bg-purple-100 text-purple-800 border-purple-200';
//       default: return 'bg-gray-100 text-gray-800 border-gray-200';
//     }
//   };

//   if (loading) {
//     return (
//       <div className="flex justify-center items-center h-64">
//         <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0f7a4a]"></div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-gray-50 space-y-4 sm:space-y-6 p-2 sm:p-4">
//       {/* Header */}
//       <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-sm">
//         <div className="flex items-center justify-between">
//           <div>
//             <h2 className="text-xl sm:text-2xl font-bold text-gray-800 flex items-center gap-2 sm:gap-3">
//               <div className="bg-[#0f7a4a] p-1.5 sm:p-2 rounded-lg sm:rounded-xl">
//                 <FaInfoCircle className="text-white" size={16} />
//               </div>
//               NFT System Status
//             </h2>
//             <p className="text-gray-600 mt-1 text-sm">Monitor NFT system phases and statistics</p>
//           </div>
//           <button
//             onClick={fetchNFTStatus}
//             className="bg-gray-100 hover:bg-gray-200 p-2 rounded-lg transition-colors"
//             title="Refresh Status"
//           >
//             <FaInfoCircle className="text-gray-600" size={16} />
//           </button>
//         </div>
//       </div>

//       {status && (
//         <>
//           {/* Current Phase Card */}
//           <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-sm">
//             <div className="flex items-center gap-3 mb-4">
//               {getPhaseIcon(status.currentPhase)}
//               <div>
//                 <h3 className="font-bold text-lg text-gray-800">Current Phase</h3>
//                 <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium border ${getPhaseColor(status.currentPhase)}`}>
//                   {status.currentPhase.toUpperCase()}
//                 </div>
//               </div>
//             </div>

//             {/* Phase Progress */}
//             <div className="grid grid-cols-3 gap-2 sm:gap-4 mb-4">
//               <div className={`p-3 rounded-lg border text-center ${
//                 status.currentPhase === 'pre-launch' ? 'bg-blue-50 border-blue-200' : 'bg-gray-50 border-gray-200'
//               }`}>
//                 <FaRocket className={`mx-auto mb-1 ${
//                   status.currentPhase === 'pre-launch' ? 'text-blue-600' : 'text-gray-400'
//                 }`} size={16} />
//                 <p className="text-xs font-medium">Pre-Launch</p>
//               </div>
//               <div className={`p-3 rounded-lg border text-center ${
//                 status.currentPhase === 'trading' ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'
//               }`}>
//                 <FaStore className={`mx-auto mb-1 ${
//                   status.currentPhase === 'trading' ? 'text-green-600' : 'text-gray-400'
//                 }`} size={16} />
//                 <p className="text-xs font-medium">Trading</p>
//               </div>
//               <div className={`p-3 rounded-lg border text-center ${
//                 status.currentPhase === 'blockchain' ? 'bg-purple-50 border-purple-200' : 'bg-gray-50 border-gray-200'
//               }`}>
//                 <FaFire className={`mx-auto mb-1 ${
//                   status.currentPhase === 'blockchain' ? 'text-purple-600' : 'text-gray-400'
//                 }`} size={16} />
//                 <p className="text-xs font-medium">Blockchain</p>
//               </div>
//             </div>
//           </div>

//           {/* Pre-Launch Phase Details */}
//           {status.preLaunch && (
//             <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-sm">
//               <div className="flex items-center gap-3 mb-4">
//                 <div className="bg-blue-100 p-2 rounded-lg">
//                   <FaRocket className="text-blue-600" size={16} />
//                 </div>
//                 <div>
//                   <h3 className="font-bold text-lg text-gray-800">Pre-Launch Phase</h3>
//                   <p className="text-sm text-gray-600">Admin NFT sales phase</p>
//                 </div>
//               </div>

//               {/* Progress Bar */}
//               <div className="mb-4">
//                 <div className="flex justify-between text-sm mb-2">
//                   <span className="text-gray-600">NFTs Sold</span>
//                   <span className="font-medium">{status.preLaunch.soldNFTs} / {status.preLaunch.totalNFTs}</span>
//                 </div>
//                 <div className="w-full bg-gray-200 rounded-full h-2">
//                   <div 
//                     className="bg-blue-600 h-2 rounded-full transition-all duration-300"
//                     style={{ width: `${(status.preLaunch.soldNFTs / status.preLaunch.totalNFTs) * 100}%` }}
//                   ></div>
//                 </div>
//                 <p className="text-xs text-gray-500 mt-1">
//                   {((status.preLaunch.soldNFTs / status.preLaunch.totalNFTs) * 100).toFixed(1)}% Complete
//                 </p>
//               </div>

//               {/* Stats Grid */}
//               <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
//                 <div className="bg-blue-50 p-3 rounded-lg text-center">
//                   <FaCoins className="mx-auto text-blue-600 mb-1" size={16} />
//                   <p className="text-xs text-gray-600">Price</p>
//                   <p className="font-bold text-blue-600">${status.preLaunch.pricePerNFT}</p>
//                 </div>
//                 <div className="bg-green-50 p-3 rounded-lg text-center">
//                   <FaCheckCircle className="mx-auto text-green-600 mb-1" size={16} />
//                   <p className="text-xs text-gray-600">Available</p>
//                   <p className="font-bold text-green-600">{status.preLaunch.availableNFTs || (status.preLaunch.totalNFTs - status.preLaunch.soldNFTs)}</p>
//                 </div>
//                 <div className="bg-yellow-50 p-3 rounded-lg text-center">
//                   <FaLock className="mx-auto text-yellow-600 mb-1" size={16} />
//                   <p className="text-xs text-gray-600">Max/User</p>
//                   <p className="font-bold text-yellow-600">{status.preLaunch.maxPerUser}</p>
//                 </div>
//                 <div className="bg-purple-50 p-3 rounded-lg text-center">
//                   <FaChartLine className="mx-auto text-purple-600 mb-1" size={16} />
//                   <p className="text-xs text-gray-600">Batch Size</p>
//                   <p className="font-bold text-purple-600">{status.preLaunch.batchSize}</p>
//                 </div>
//               </div>

//               {/* Rules */}
//               <div className="mt-4 bg-blue-50 p-3 rounded-lg border border-blue-200">
//                 <h4 className="font-medium text-blue-800 mb-2">📋 Pre-Launch Rules</h4>
//                 <ul className="text-sm text-blue-700 space-y-1">
//                   <li>• Users can buy maximum {status.preLaunch.maxPerUser} NFTs at ${status.preLaunch.pricePerNFT} each</li>
//                   <li>• First NFT gets "Hold" status (cannot sell immediately)</li>
//                   <li>• Second NFT gets "Sell" status (can sell after admin sellout)</li>
//                   <li>• User selling is locked until all {status.preLaunch.totalNFTs} admin NFTs are sold</li>
//                 </ul>
//               </div>
//             </div>
//           )}

//           {/* Trading Phase Details */}
//           {status.trading && (
//             <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-sm">
//               <div className="flex items-center gap-3 mb-4">
//                 <div className="bg-green-100 p-2 rounded-lg">
//                   <FaStore className="text-green-600" size={16} />
//                 </div>
//                 <div>
//                   <h3 className="font-bold text-lg text-gray-800">Trading Phase</h3>
//                   <p className="text-sm text-gray-600">User-to-user NFT trading</p>
//                 </div>
//                 <div className={`ml-auto px-3 py-1 rounded-full text-xs font-medium ${
//                   status.trading.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
//                 }`}>
//                   {status.trading.isActive ? 'ACTIVE' : 'INACTIVE'}
//                 </div>
//               </div>

//               {/* Stats Grid */}
//               <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4 mb-4">
//                 <div className="bg-green-50 p-3 rounded-lg text-center">
//                   <FaDollarSign className="mx-auto text-green-600 mb-1" size={16} />
//                   <p className="text-xs text-gray-600">Trading Price</p>
//                   <p className="font-bold text-green-600">${status.trading.tradingPrice}</p>
//                 </div>
//                 <div className="bg-blue-50 p-3 rounded-lg text-center">
//                   <FaGift className="mx-auto text-blue-600 mb-1" size={16} />
//                   <p className="text-xs text-gray-600">Buy 1 Get 1</p>
//                   <p className="font-bold text-blue-600">{status.trading.buyOneGetOneFree ? 'YES' : 'NO'}</p>
//                 </div>
//                 <div className="bg-purple-50 p-3 rounded-lg text-center">
//                   <FaCoins className="mx-auto text-purple-600 mb-1" size={16} />
//                   <p className="text-xs text-gray-600">Max Supply</p>
//                   <p className="font-bold text-purple-600">{status.trading.totalNFTs?.toLocaleString()}</p>
//                 </div>
//               </div>

//               {/* Trading Rules */}
//               <div className="bg-green-50 p-3 rounded-lg border border-green-200">
//                 <h4 className="font-medium text-green-800 mb-2">💰 Trading Rules</h4>
//                 <ul className="text-sm text-green-700 space-y-1">
//                   <li>• Auto-activated when all 500 admin NFTs are sold</li>
//                   <li>• Users can sell "Sell" status NFTs at ${status.trading.tradingPrice}</li>
//                   <li>• Payment distribution: 70% seller, 20% company, 10% parents</li>
//                   <li>• ${status.trading.tradingPrice} purchase = 2 NFTs (1 Hold + 1 Sell)</li>
//                 </ul>
//               </div>
//             </div>
//           )}

//           {/* Blockchain Phase Details */}
//           {status.blockchain && (
//             <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-sm">
//               <div className="flex items-center gap-3 mb-4">
//                 <div className="bg-purple-100 p-2 rounded-lg">
//                   <FaFire className="text-purple-600" size={16} />
//                 </div>
//                 <div>
//                   <h3 className="font-bold text-lg text-gray-800">Blockchain Phase</h3>
//                   <p className="text-sm text-gray-600">Advanced NFT features</p>
//                 </div>
//                 <div className={`ml-auto px-3 py-1 rounded-full text-xs font-medium ${
//                   status.blockchain.isLaunched ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-800'
//                 }`}>
//                   {status.blockchain.isLaunched ? 'LAUNCHED' : 'PENDING'}
//                 </div>
//               </div>

//               {/* Stats Grid */}
//               <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4 mb-4">
//                 <div className="bg-purple-50 p-3 rounded-lg text-center">
//                   <FaFire className="mx-auto text-purple-600 mb-1" size={16} />
//                   <p className="text-xs text-gray-600">Burn Ratio</p>
//                   <p className="font-bold text-purple-600">{status.blockchain.burnRatio}%</p>
//                 </div>
//                 <div className="bg-blue-50 p-3 rounded-lg text-center">
//                   <FaDollarSign className="mx-auto text-blue-600 mb-1" size={16} />
//                   <p className="text-xs text-gray-600">Token Price</p>
//                   <p className="font-bold text-blue-600">${status.blockchain.blockchainPrice}</p>
//                 </div>
//                 <div className="bg-green-50 p-3 rounded-lg text-center">
//                   <FaCoins className="mx-auto text-green-600 mb-1" size={16} />
//                   <p className="text-xs text-gray-600">Total Supply</p>
//                   <p className="font-bold text-green-600">{status.blockchain.totalSupply?.toLocaleString()}</p>
//                 </div>
//               </div>

//               {/* Blockchain Features */}
//               <div className="bg-purple-50 p-3 rounded-lg border border-purple-200">
//                 <h4 className="font-medium text-purple-800 mb-2">🔥 Blockchain Features</h4>
//                 <ul className="text-sm text-purple-700 space-y-1">
//                   <li>• NFT staking for rewards</li>
//                   <li>• NFT burning mechanism ({status.blockchain.burnRatio}% ratio)</li>
//                   <li>• Blockchain token generation at ${status.blockchain.blockchainPrice}</li>
//                   <li>• Total supply: {status.blockchain.totalSupply?.toLocaleString()} tokens</li>
//                 </ul>
//               </div>
//             </div>
//           )}

//           {/* Initialize System Button */}
//           {status.currentPhase === 'pre-launch' && status.preLaunch?.soldNFTs === 0 && (
//             <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-sm">
//               <div className="text-center">
//                 <div className="bg-blue-100 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
//                   <FaPlay className="text-blue-600" size={24} />
//                 </div>
//                 <h3 className="font-bold text-lg text-gray-800 mb-2">Initialize NFT System</h3>
//                 <p className="text-gray-600 mb-4 text-sm">
//                   Create 500 NFTs in 125 batches to start the pre-launch phase
//                 </p>
//                 <button
//                   onClick={initializeSystem}
//                   disabled={initializing}
//                   className="bg-gradient-to-r from-[#0f7a4a] to-green-600 text-white px-6 py-3 rounded-lg font-bold hover:from-green-700 hover:to-green-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 flex items-center justify-center gap-2 mx-auto shadow-lg"
//                 >
//                   {initializing ? (
//                     <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
//                   ) : (
//                     <>
//                       <FaRocket size={16} />
//                       <span>Initialize System</span>
//                     </>
//                   )}
//                 </button>
//               </div>
//             </div>
//           )}
//         </>
//       )}
//     </div>
//   );
// };

// export default NFTStatus;