import React, { useState, useEffect } from "react";
import axios from "axios";

const SimpleNFTTest = () => {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    testNFTAPI();
  }, []);

  const testNFTAPI = async () => {
    try {
      const token = localStorage.getItem("token");
      console.log("Token:", token);

      const response = await axios.get(
        "https://api.gtnworld.live/api/nft/marketplace",
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      console.log("Raw response:", response);
      console.log("Response data:", response.data);
      setData(response.data);
    } catch (err) {
      console.error("Error:", err);
      setError(err.response?.data || err.message);
    }
  };
//  hello vivek
  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-4">Simple NFT Test</h2>

      <button
        onClick={testNFTAPI}
        className="bg-blue-500 text-white px-4 py-2 rounded mb-4"
      >
        Test NFT API 
      </button>

      {data && (
        <div className="bg-green-50 p-4 rounded mb-4">
          <h3 className="font-bold">Success Response:</h3>
          <pre>{JSON.stringify(data, null, 2)}</pre>
        </div>
      )}

      {error && (
        <div className="bg-red-50 p-4 rounded">
          <h3 className="font-bold">Error:</h3>
          <pre>{JSON.stringify(error, null, 2)}</pre>
        </div>
      )}

      {data && Array.isArray(data) && data.length > 0 && (
        <div className="mt-4">
          <h3 className="font-bold mb-2">NFTs Found:</h3>
          {data.map((nft, index) => (
            <div key={index} className="border p-3 mb-2 rounded">
              <p>
                <strong>ID:</strong> {nft.nftId}
              </p>
              <p>
                <strong>Price:</strong> ${nft.buyPrice}
              </p>
              <p>
                <strong>Status:</strong> {nft.status}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SimpleNFTTest;
