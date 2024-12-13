import React, { useState, useEffect } from 'react';

function ConfigModal({ isOpen, onClose }) {
  const [config, setConfig] = useState({
    privateKey: '',
    rpcUrl: '',
    etherscanKey: ''
  });

  // Load saved config on component mount
  useEffect(() => {
    const savedConfig = localStorage.getItem('blockchainConfig');
    if (savedConfig) {
      setConfig(JSON.parse(savedConfig));
    }
  }, []);

  const handleSave = () => {
    // Save to localStorage
    localStorage.setItem('blockchainConfig', JSON.stringify(config));
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="config-modal">
      <div className="config-content">
        <h2>Blockchain Configuration</h2>
        
        <div className="config-input">
          <label>Private Key:</label>
          <input
            type="password"
            value={config.privateKey}
            onChange={(e) => setConfig({...config, privateKey: e.target.value})}
            placeholder="Enter your private key"
          />
        </div>

        <div className="config-input">
          <label>Sepolia RPC URL:</label>
          <input
            type="text"
            value={config.rpcUrl}
            onChange={(e) => setConfig({...config, rpcUrl: e.target.value})}
            placeholder="Enter your Alchemy RPC URL"
          />
        </div>

        <div className="config-input">
          <label>Etherscan API Key:</label>
          <input
            type="password"
            value={config.etherscanKey}
            onChange={(e) => setConfig({...config, etherscanKey: e.target.value})}
            placeholder="Enter your Etherscan API key"
          />
        </div>

        <div className="config-buttons">
          <button onClick={handleSave}>Save Configuration</button>
          <button onClick={onClose} className="cancel-button">Cancel</button>
        </div>
      </div>
    </div>
  );
}

export default ConfigModal;