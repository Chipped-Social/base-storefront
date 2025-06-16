"use client";

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useAccount, useConnect } from 'wagmi';

export default function SuccessPage() {
  const searchParams = useSearchParams();
  const [callsId, setCallsId] = useState<string | null>(null);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [selectedSize, setSelectedSize] = useState<string>('M'); // Default size
  const [receiptData, setReceiptData] = useState<any>(null);
  const [receiptError, setReceiptError] = useState<string | null>(null);
  const [provider, setProvider] = useState<any>(null);
  const { connectors, connect } = useConnect();
  const account = useAccount();
  
  // Get the callsId, orderId, and size from URL query parameters
  useEffect(() => {
    const id = searchParams.get('callsId');
    const order = searchParams.get('orderId');
    const size = searchParams.get('size');
    
    if (id) {
      setCallsId(id);
    }
    
    if (order) {
      setOrderId(order);
    }
    
    if (size) {
      setSelectedSize(size);
    }
  }, [searchParams]);
  
  // Get the provider for making RPC calls
  useEffect(() => {
    async function setupProvider() {
      try {
        const coinbaseConnector = connectors.find(c => c.name === 'Coinbase Wallet');

        if (!coinbaseConnector) {
          console.warn("Coinbase Wallet connector not found");
          return;
        }

        // Always use SDK-based provider — this ensures popup launches if extension is not installed
        console.log("Triggering Coinbase Smart Wallet provider via connector");
        const smartWalletProvider = await coinbaseConnector.getProvider();
        setProvider(smartWalletProvider);
      } catch (error) {
        console.error("Failed to setup Coinbase Smart Wallet provider:", error);
      }
    }

    setupProvider();
  }, [connectors]);

  // For debugging, show component render
  useEffect(() => {
    console.log("Success page rendered/updated with state:", {
      callsId,
      orderId,
      selectedSize,
      receiptStatus: receiptData?.status || 'none'
    });
  });

  useEffect(() => {
    if (!callsId || !provider) return;
    
    let mounted = true;
    let intervalId: NodeJS.Timeout | null = null;
    
    async function checkReceipt() {
      try {
        // Call wallet_getCallsStatus to get the current status
        const receipt = await provider.request({
          method: "wallet_getCallsStatus",
          params: [callsId]
        });
        
        if (mounted) {
          console.log("Receipt data:", receipt);
          setReceiptData(receipt);
          
          // If status is no longer pending, stop polling
          // Force a state update with a new reference to ensure React re-renders
          if (receipt) {
            setReceiptData({...receipt});
          }
          
          if (receipt && receipt.status && receipt.status !== 'PENDING') {
            console.log('Transaction no longer pending, stopping polling');
            if (intervalId) {
              clearInterval(intervalId);
              intervalId = null;
            }
          }
        }
      } catch (error: any) {
        console.error("Error fetching receipt:", error);
        
        // Store the error message for display
        if (error?.message) {
          setReceiptError(error.message);
        } else {
          setReceiptError("Could not retrieve transaction status");
        }
        
        // Stop polling on error to avoid repeated error messages
        if (intervalId) {
          clearInterval(intervalId);
          intervalId = null;
        }
      }
    }
    
    // Initial check
    checkReceipt();
    
    // Start polling every 5 seconds
    intervalId = setInterval(checkReceipt, 5000);
    
    // Cleanup function to clear interval when component unmounts
    return () => {
      mounted = false;
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [callsId, provider]);

  return (
    <div className="container success-container">
      {/* Header */}
      <header className="header">
        <div className="header-left">
          <Link href="/">
            <img 
              src="/assets/chipped_logo.svg" 
              alt="Chipped Logo"
              className="chipped-logo"
            />
          </Link>
        </div>
        <div className="header-center">
          <img 
            src="/assets/base_logo.svg" 
            alt="Base Logo"
            className="base-logo"
          />
        </div>
        <div className="header-right">
          {/* Empty for symmetry */}
        </div>
      </header>

      {/* Success Content */}
      <main className="success-main">
        <h1 className="success-title">Thank you for your order!</h1>
        
        <p className="success-message">
          {receiptData && (receiptData.status === 'confirmed' || receiptData.status === 'CONFIRMED' || 
           receiptData.status === 'success' || receiptData.status === 'SUCCESS') ? (
            "Your payment has been processed successfully. Nails will ship in July, if you have any questions please reach out to us on X."
          ) : (
            "Your order is being processed. Please wait while we confirm your payment."
          )}
        </p>
        
        <a 
          href="https://x.com/chippedsocial" 
          target="_blank" 
          rel="noopener noreferrer"
          className="x-link"
        >
          <img 
            src="/assets/x_icon.svg" 
            alt="X Logo" 
            className="x-logo" 
            width="40" 
            height="40"
          />
        </a>

        <div className="transaction-info">
          <div className="receipt-data">
            {callsId ? (
              receiptData ? (
                <>
                  <p>Status: {receiptData.status} {(receiptData.status === 'confirmed' || receiptData.status === 'CONFIRMED' || 
                                                   receiptData.status === 'success' || receiptData.status === 'SUCCESS') ? '✅' : '⏱️'}</p>
                  {receiptData.receipts && receiptData.receipts.length > 0 && (
                    <div>
                      <p>Transaction Hash: </p>
                      <a 
                        href={`https://basescan.org/tx/${receiptData.receipts[0].transactionHash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="transaction-link"
                      >
                        {receiptData.receipts[0].transactionHash.substring(0, 8)}...
                        {receiptData.receipts[0].transactionHash.substring(receiptData.receipts[0].transactionHash.length - 8)}
                      </a>
                    </div>
                  )}
                </>
              ) : (
                <p>Loading transaction data...</p>
              )
            ) : (
              <p>Transaction complete</p>
            )}
          </div>
        </div>
        
        <div className="return-home-container">
          <Link href="/" className="return-home-button">
            Return to Home
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="footer success-footer">
        <a href="https://chippedsocial.com/policies/privacy-policy" target="_blank" rel="noopener noreferrer">Privacy Policy</a>
        <a href="https://chippedsocial.com/policies/refund-policy" target="_blank" rel="noopener noreferrer">Refund Policy</a>
        <a href="https://chippedsocial.com/pages/faqs" target="_blank" rel="noopener noreferrer">FAQs</a>
      </footer>
    </div>
  )};
