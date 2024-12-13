// src/utils/blockchain.js

export const getConfig = () => {
    const savedConfig = localStorage.getItem('blockchainConfig');
    if (!savedConfig) {
      throw new Error('Please configure your blockchain settings first');
    }
    return JSON.parse(savedConfig);
  };
  
  export const deployContract = async () => {
    try {
      const config = getConfig();
      // We'll add deployment logic here when connecting to the smart contract
      console.log('Using configuration:', {
        rpcUrl: config.rpcUrl,
        etherscanKey: config.etherscanKey,
        // Don't log the private key for security!
      });
    } catch (error) {
      console.error('Deployment error:', error);
      throw error;
    }
  };