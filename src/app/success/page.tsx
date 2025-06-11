"use client";

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useAccount, useConnect } from 'wagmi';

export default function SuccessPage() {
  const searchParams = useSearchParams();
  const [callsId, setCallsId] = useState<string | null>(null);
  const [receiptData, setReceiptData] = useState<any>(null);
  const [receiptError, setReceiptError] = useState<string | null>(null);
  const [provider, setProvider] = useState<any>(null);
  const { connectors, connect } = useConnect();
  const account = useAccount();
  
  // Get the callsId from URL query parameters
  useEffect(() => {
    const id = searchParams.get('callsId');
    if (id) {
      setCallsId(id);
    }
  }, [searchParams]);
  
  // Get the provider for making RPC calls (but don't attempt to use it for wallet_getCallsReceipt)
  useEffect(() => {
    async function setupProvider() {
      try {
        // First try to use the provider from an active connection
        if (account.status === 'connected' && account.connector) {
          console.log('Using connected account provider');
          const connectedProvider = await account.connector.getProvider();
          setProvider(connectedProvider);
          return;
        }
        
        // Next try to use window.ethereum if available
        if (typeof window !== 'undefined' && window.ethereum) {
          console.log('Using window.ethereum provider');
          setProvider(window.ethereum);
          return;
        }
        
        // Finally, try to get a provider through Coinbase Wallet connector
        const coinbaseConnector = connectors.find(c => c.name === 'Coinbase Wallet');
        if (coinbaseConnector) {
          try {
            console.log('Attempting to get provider from Coinbase Wallet connector');
            const coinbaseProvider = await coinbaseConnector.getProvider();
            setProvider(coinbaseProvider);
            return;
          } catch (error) {
            console.error('Failed to get provider from Coinbase Wallet connector:', error);
          }
        }
        
        console.warn('No provider available for transaction status checks');
      } catch (error) {
        console.error("Failed to setup provider:", error);
      }
    }
    
    setupProvider();
  }, [account, connectors]);
  
  // For development/testing purposes only: The wallet_getCallsReceipt method is not supported
  // We're keeping this code to show the approach, but we'll handle the error gracefully
  useEffect(() => {
    if (!callsId || !provider) return;
    
    let mounted = true;
    
    async function checkReceipt() {
      try {
        // Call wallet_getCallsReceipt to get the current status
        // Note: This method is not currently supported in most providers
        // and will likely fail with error code -32603
        const receipt = await provider.request({
          method: "wallet_getCallsStatus",
          params: [callsId]
        });
        
        if (mounted) {
          console.log("Receipt data:", receipt);
          setReceiptData(receipt);
        }
      } catch (error: any) {
        console.error("Error fetching receipt:", error);
        
        // Store the error message for display
        if (error?.message) {
          setReceiptError(error.message);
        } else {
          setReceiptError("Could not retrieve transaction status");
        }
      }
    }
    
    // Only try once to avoid repeated error messages
    checkReceipt();
    
    return () => {
      mounted = false;
    };
  }, [callsId, provider]);

  return (
    <div className="container success-container">
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
            style={{ height: '103px', width: 'auto' }}
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
          Your payment has been processed successfully. Nails will ship in July, if you have any questions please reach out to us on X.
        </p>
        
        <a 
          href="https://x.com/chippedsocial" 
          target="_blank" 
          rel="noopener noreferrer"
          className="x-link"
        >
          <div className="x-logo"></div>
        </a>

        {callsId && (
          <div className="transaction-info">
            <p>Transaction Reference ID:</p>
            <div className="transaction-id">
              {callsId.substring(0, 8)}...{callsId.substring(callsId.length - 8)}
            </div>
            
            {receiptData && (
              <div className="receipt-data">
                <p>Status: {receiptData.status}</p>
                {receiptData.receipts && receiptData.receipts.length > 0 && (
                  <div>
                    <p>Transaction Hash: </p>
                    <a 
                      href={`https://sepolia.basescan.org/tx/${receiptData.receipts[0].transactionHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="transaction-link"
                    >
                      {receiptData.receipts[0].transactionHash.substring(0, 8)}...
                      {receiptData.receipts[0].transactionHash.substring(receiptData.receipts[0].transactionHash.length - 8)}
                    </a>
                  </div>
                )}
              </div>
            )}
            
            {receiptError && (
              <div className="receipt-info">
                <p>Your transaction has been submitted to the blockchain.</p>
                <p>Order confirmation number: {callsId.substring(0, 16)}</p>
              </div>
            )}
          </div>
        )}
        
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