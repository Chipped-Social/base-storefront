"use client";

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function SuccessPage() {
  const searchParams = useSearchParams();
  const [orderNumber, setOrderNumber] = useState<string | null>(null);
  
  // useEffect(() => {
  //   // Get a reference ID from URL parameters if available
  //   const id = searchParams.get('callsId');
  //   if (id) {
  //     // Just use the first part of the ID as an order number for display
  //     setOrderNumber(id.substring(0, 16));
  //   }
  // }, [searchParams]);

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
          Nails will ship in July, if you have any questions please reach out to us on X.
        </p>
        
        {/* {orderNumber && (
          <p className="order-number">
            Order confirmation: {orderNumber}
          </p>
        )} */}
        
        <a 
          href="https://x.com/chippedsocial" 
          target="_blank" 
          rel="noopener noreferrer"
          className="x-link"
        >
          <div className="x-logo"></div>
        </a>
      </main>

      {/* Footer */}
      <footer className="footer success-footer">
        <a href="https://chippedsocial.com/policies/privacy-policy" target="_blank" rel="noopener noreferrer">Privacy Policy</a>
        <a href="https://chippedsocial.com/policies/refund-policy" target="_blank" rel="noopener noreferrer">Refund Policy</a>
        <a href="https://chippedsocial.com/pages/faqs" target="_blank" rel="noopener noreferrer">FAQs</a>
      </footer>
    </div>
  );
}
