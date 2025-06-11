# Base Storefront

This Next.js application implements Smart Wallet Profiles for the Base/Chipped collaboration. It creates a seamless checkout experience where users can share their shipping information and email through Coinbase Wallet's Profiles feature.

## Features

- Integration with Smart Wallet Profiles API
- Secure data collection through wallet_sendCalls
- Styled product showcase with size selection
- Seamless checkout experience with Coinbase Wallet

## Technology Stack

- Next.js for the frontend framework
- Wagmi for Web3 React hooks
- Coinbase Wallet SDK for wallet integration
- Base Sepolia testnet for blockchain interactions

## Getting Started

### Local Development

```bash
# Install dependencies
npm install

# Run the development server
npm run dev
```

### Production Deployment

```bash
# Build the application
npm run build

# Start the production server
npm start
```

## Project Structure

- `/src/app`: Main Next.js application files
- `/src/app/api`: API endpoints, including data validation
- `/src/app/page.tsx`: Main checkout page with Profiles integration
- `/public`: Static assets

## Smart Wallet Profiles Integration

This application demonstrates how to use the Smart Wallet Profiles API to collect user data during a checkout process. The implementation follows Base's documentation for integrating with wallet_sendCalls to request user data securely.

For more information, see the [Smart Wallet Profiles documentation](https://docs.base.org/identity/smart-wallet/guides/profiles).

## About the Collaboration

This storefront is a collaboration between Base and Chipped, showcasing innovative Web3 technologies for e-commerce applications.
