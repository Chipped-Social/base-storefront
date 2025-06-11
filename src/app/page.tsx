"use client";

import Image from 'next/image';
import { useState, useEffect } from "react";
import SizeGuideModal from "../components/SizeGuideModal";
import { encodeFunctionData, erc20Abi, numberToHex, parseUnits } from "viem";
import { baseSepolia } from "wagmi/chains";
import { useAccount, useConnect, useDisconnect } from "wagmi";
import { ProviderInterface } from "@coinbase/wallet-sdk";

// Define types for our state
interface DataRequest {
  email: boolean;
  address: boolean;
}

interface ResultData {
  success: boolean;
  error?: string;
  email?: string;
  address?: string;
}

export default function Home() {
  // State variables
  const [provider, setProvider] = useState<any>(undefined);
  const [dataToRequest, setDataToRequest] = useState<DataRequest>({
    email: true,
    address: true
  });
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<ResultData | null>(null);

  // New state for the redesign
  const [selectedSize, setSelectedSize] = useState('M');
  const [isSizeGuideOpen, setSizeGuideOpen] = useState(false);
  
  // Get the Wagmi connection hooks
  const { connectors, connect, status, error: connectError } = useConnect();
  const account = useAccount();
  const { disconnect } = useDisconnect();
  
  // Initialize provider when account connected
  useEffect(() => {
    async function getProvider() {
      if (account.status === 'connected' && account.connector) {
        const provider = await account.connector.getProvider();
        setProvider(provider);
      }
    }
    getProvider();
  }, [account]);

  // Function to get callback URL from environment variables
  function getCallbackURL() {
    // Use environment variables for all environments
    if (process.env.NEXT_PUBLIC_API_URL) {
      return `${process.env.NEXT_PUBLIC_API_URL}/api/data-validation`;
    }
    // Fallback for local development if env var not set
    return "https://lovely-singular-heron.ngrok-free.app/api/data-validation";
  }

  // Handle form submission
  async function handleSubmit() {
    try {
      setIsLoading(true);
      setResult(null);

      // Build requests array based on checkboxes
      const requests = [];
      if (dataToRequest.email) requests.push({ type: "email", optional: false });
      if (dataToRequest.address) requests.push({ type: "physicalAddress", optional: false });

      if (requests.length === 0) {
        setResult({ success: false, error: "Select at least one data type" } as ResultData);
        setIsLoading(false);
        return;
      }
      
      let coinbaseProvider;
      
      // Try to use an existing provider if available
      if (provider) {
        coinbaseProvider = provider;
      }
      // Otherwise, try to get one through the connector
      else {
        const coinbaseConnector = connectors.find(c => c.name === 'Coinbase Wallet');
        if (!coinbaseConnector) {
          setResult({ 
            success: false, 
            error: "Coinbase Wallet not available. Please install the Coinbase Wallet extension." 
          });
          setIsLoading(false);
          return;
        }
        
        try {
          // Direct wallet_sendCalls without explicit connection
          // This will trigger the Coinbase Wallet popup directly
          coinbaseProvider = await coinbaseConnector.getProvider();
        } catch (error: any) {
          setResult({ 
            success: false, 
            error: `Coinbase Wallet not available: ${error.message || "Unknown error"}. Please install Coinbase Wallet.` 
          });
          setIsLoading(false);
          return;
        }
      }
      
      // Make the direct wallet_sendCalls request
      const response = await coinbaseProvider.request({
        method: "wallet_sendCalls",
        params: [{
          version: "1.0",
          chainId: numberToHex(84532), // Base Sepolia
          calls: [
              {
                to: "0x036CbD53842c5426634e7929541eC2318f3dCF7e", // USDC contract address on Base Sepolia
                data: encodeFunctionData({
                  abi: erc20Abi,
                  functionName: "transfer",
                  args: [
                    "0xd8da6bf26964af9d7eed9e03e53415d37aa96045",
                    parseUnits("1.00", 6),
                  ],
                }),
              },
            ],
          capabilities: {
            dataCallback: {
              requests: requests,
              callbackURL: getCallbackURL(),
            },
          },
        }],
      });

      // Process response
      if (response?.capabilities?.dataCallback) {
        const data = response.capabilities.dataCallback;
        const resultData: ResultData = { success: true };

        // Extract email if provided
        if (data.email) resultData.email = data.email;

        // Extract address if provided
        if (data.physicalAddress) {
          const addr = data.physicalAddress.physicalAddress;
          resultData.address = [
            addr.address1,
            addr.address2,
            addr.city,
            addr.state,
            addr.postalCode,
            addr.countryCode
          ].filter(Boolean).join(", ");
        }
        
        // After successful transaction submission, navigate to the success page
        // with the callsId, which is a unique identifier for this batch of calls
        if (response.callsId) {
          console.log(response)
          window.location.href = `/success?callsId=${response.callsId}`;
          return;
        }
        
        // If no callsId, stay on current page and show success message
        setResult(resultData);
      } else {
        setResult({ success: false, error: "Invalid response" } as ResultData);
      }
    } catch (error: any) {
      setResult({ success: false, error: error.message || "Transaction failed" } as ResultData);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="container">
      {/* Header */}
      <header className="header">
        <div className="header-left">
          <img 
            src="/assets/chipped_logo.svg" 
            alt="Chipped Logo"
            className="chipped-logo"
          />
        </div>
        <div className="header-center">
          <img 
            src="/assets/base_logo.svg" 
            alt="Base Logo"
            className="base-logo"
          />
        </div>
        <div className="header-right">
          {/* Connection status indicator - hidden but useful for debugging */}
          <div style={{ display: 'none' }}>
            <p>Status: {account.status}</p>
            {account.status === 'connected' && (
              <button onClick={() => disconnect()}>Disconnect</button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="main">
        <section className="product-section">
          <div className="product-image-container">
            <img 
              src="/assets/product_image.png"
              alt="Product"
              className="product-image"
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
            <div className="price-tag">$45</div>
          </div>

          <div className="shipping-date">For pre-order: Shipping July 2025</div>

          <div className="size-guide" onClick={() => setSizeGuideOpen(true)}>Size Guide</div>
          
          <div className="size-options">
            <button 
              className={`size-button ${selectedSize === 'S' ? 'active' : ''}`}
              onClick={() => setSelectedSize('S')}
            >
              S
            </button>
            <button 
              className={`size-button ${selectedSize === 'M' ? 'active' : ''}`}
              onClick={() => setSelectedSize('M')}
            >
              M
            </button>
            <button 
              className={`size-button ${selectedSize === 'L' ? 'active' : ''}`}
              onClick={() => setSelectedSize('L')}
            >
              L
            </button>
          </div>

          <button 
            className="pay-button" 
            onClick={handleSubmit}
            disabled={isLoading}
          >
            {isLoading ? "Processing..." : "Pay with Coinbase Wallet"}
          </button>
          
          {result && (
            <div style={{
              marginTop: "20px",
              padding: "15px",
              backgroundColor: result.success ? "#d4edda" : "#f8d7da",
              borderRadius: "5px",
              color: "#000"
            }}>
              {result.success ? (
                <>
                  <h3>Data Received</h3>
                  {result.email && <p><strong>Email:</strong> {result.email}</p>}
                  {result.address && <p><strong>Address:</strong> {result.address}</p>}
                </>
              ) : (
                <>
                  <h3>Error</h3>
                  <p>{result.error}</p>
                </>
              )}
            </div>
          )}
        </section>

        <section className="about-section">
          <h2 className="about-title">About Chipped</h2>
          <p className="about-content">
            Chipped is the Microchip Manicure — the press-ons that share your socials with a single tap. 
            Just tap your nail to a new friend’s phone, and you’re instantly connected. 
            Every tap earns you in-app points, 
            unlocking rewards and perks that make networking feel like play. 
            It’s your hot girl business card.

            <br></br><br></br>
            
            We’ve collaborated with Base for this special moment and this gorgeous 
            Base-blue cat eye set will be shipping mid July.
          </p>
        </section>
      </main>

      {/* Footer */}
      <footer className="footer">
        <a href="https://chippedsocial.com/policies/privacy-policy" target="_blank" rel="noopener noreferrer">Privacy Policy</a>
        <a href="https://chippedsocial.com/policies/refund-policy" target="_blank" rel="noopener noreferrer">Refund Policy</a>
        <a href="https://chippedsocial.com/pages/faqs" target="_blank" rel="noopener noreferrer">FAQs</a>
      </footer>
      
      {/* Size Guide Modal */}
      <SizeGuideModal isOpen={isSizeGuideOpen} onClose={() => setSizeGuideOpen(false)} />
    </div>
  );
}
