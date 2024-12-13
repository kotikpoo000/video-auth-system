import React, { useState, useEffect } from 'react';
import { BrowserProvider, keccak256, verifyMessage } from 'ethers';
import ConfigModal from './components/ConfigModal';
import { deployContract } from './utils/blockchain';
import './App.css';

function App() {
  const [walletConnected, setWalletConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState('');
  const [videoFile, setVideoFile] = useState(null);
  const [videoPreview, setVideoPreview] = useState(null);
  const [signature, setSignature] = useState('');
  const [signer, setSigner] = useState(null);
  const [verificationResult, setVerificationResult] = useState(null);
  const [verificationVideo, setVerificationVideo] = useState(null);
  const [verificationSignature, setVerificationSignature] = useState('');
  const [showSignSection, setShowSignSection] = useState(false);
  const [showVerifySection, setShowVerifySection] = useState(false);
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [hasConfig, setHasConfig] = useState(false);
  const [isDeploying, setIsDeploying] = useState(false);

  // Check for existing configuration on component mount
  useEffect(() => {
    const savedConfig = localStorage.getItem('blockchainConfig');
    setHasConfig(!!savedConfig);
  }, []);

  const connectWallet = async () => {
    try {
      if (window.ethereum) {
        const provider = new BrowserProvider(window.ethereum);
        await window.ethereum.request({ method: 'eth_requestAccounts' });
        const walletSigner = await provider.getSigner();
        const address = await walletSigner.getAddress();
        
        setSigner(walletSigner);
        setWalletAddress(address);
        setWalletConnected(true);
      } else {
        alert('Please install MetaMask to use this app!');
      }
    } catch (error) {
      console.error('Error connecting wallet:', error);
    }
  };

  const handleVideoUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      setVideoFile(file);
      const videoURL = URL.createObjectURL(file);
      setVideoPreview(videoURL);
      setSignature('');
    }
  };

  const handleSubmit = async () => {
    if (!videoFile || !signer) {
      alert('Please select a video and connect wallet first!');
      return;
    }

    try {
      const reader = new FileReader();
      
      reader.onload = async (e) => {
        const arrayBuffer = e.target.result;
        const videoData = new Uint8Array(arrayBuffer);
        const videoHash = keccak256(videoData);
        
        const sig = await signer.signMessage(videoHash);
        setSignature(sig);
        
        console.log('Video hash:', videoHash);
        console.log('Signature:', sig);
      };

      reader.readAsArrayBuffer(videoFile);
    } catch (error) {
      console.error('Error signing video:', error);
      alert('Error signing video. Check console for details.');
    }
  };

  const handleVerificationVideoUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      setVerificationVideo(file);
      setVerificationResult(null);
    }
  };

  const verifyVideo = async () => {
    if (!verificationVideo || !verificationSignature) {
      alert('Please provide both video and signature');
      return;
    }

    try {
      const reader = new FileReader();
      
      reader.onload = async (e) => {
        const arrayBuffer = e.target.result;
        const videoData = new Uint8Array(arrayBuffer);
        const videoHash = keccak256(videoData);
        
        try {
          const recoveredAddress = await verifyMessage(videoHash, verificationSignature);
          
          setVerificationResult({
            isValid: true,
            signerAddress: recoveredAddress
          });
        } catch (error) {
          setVerificationResult({
            isValid: false,
            error: 'Invalid signature'
          });
        }
      };

      reader.readAsArrayBuffer(verificationVideo);
    } catch (error) {
      console.error('Error verifying video:', error);
      setVerificationResult({
        isValid: false,
        error: error.message
      });
    }
  };

  const handleDeploy = async () => {
    try {
      setIsDeploying(true);
      await deployContract();
      alert('Contract deployed successfully!');
    } catch (error) {
      alert('Error deploying contract: ' + error.message);
    } finally {
      setIsDeploying(false);
    }
  };

  return (
    <div className="App">
      <h1>Video Authentication System</h1>
      
      <button 
        className="config-button"
        onClick={() => setShowConfigModal(true)}
      >
        {hasConfig ? '⚙️ Update Configuration' : '⚙️ Set Configuration'}
      </button>

      {hasConfig && (
        <button 
          className="deploy-button"
          onClick={handleDeploy}
          disabled={isDeploying}
        >
          {isDeploying ? 'Deploying...' : 'Deploy Contract'}
        </button>
      )}

      <ConfigModal 
        isOpen={showConfigModal}
        onClose={() => setShowConfigModal(false)}
      />
      
      <div className="dropdown-section">
        <button 
          className="dropdown-button"
          onClick={() => setShowSignSection(!showSignSection)}
        >
          {showSignSection ? '▼ Sign Video' : '▶ Sign Video'}
        </button>
        
        {showSignSection && (
          <div className="dropdown-content">
            {!walletConnected ? (
              <button onClick={connectWallet}>
                Connect Wallet
              </button>
            ) : (
              <div>
                <p>Connected Wallet: <span className="wallet-address">{walletAddress}</span></p>
                
                <div className="upload-section">
                  <h2>Upload Video</h2>
                  <input 
                    type="file"
                    accept="video/*"
                    onChange={handleVideoUpload}
                  />
                  
                  {videoPreview && (
                    <div className="video-preview">
                      <h3>Preview:</h3>
                      <video 
                        width="400" 
                        controls
                        src={videoPreview}
                      >
                        Your browser does not support the video tag.
                      </video>
                      <button onClick={handleSubmit}>
                        Sign Video
                      </button>
                      
                      {signature && (
                        <div className="signature-section">
                          <h3>Video Signature:</h3>
                          <p className="signature">{signature}</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="dropdown-section">
        <button 
          className="dropdown-button"
          onClick={() => setShowVerifySection(!showVerifySection)}
        >
          {showVerifySection ? '▼ Verify Video' : '▶ Verify Video'}
        </button>
        
        {showVerifySection && (
          <div className="dropdown-content">
            <div className="verify-section">
              <h2>Verify Video</h2>
              <div>
                <h3>Upload Video to Verify</h3>
                <input 
                  type="file"
                  accept="video/*"
                  onChange={handleVerificationVideoUpload}
                />
              </div>
              <div>
                <h3>Enter Signature</h3>
                <textarea
                  value={verificationSignature}
                  onChange={(e) => setVerificationSignature(e.target.value)}
                  placeholder="Paste the video signature here"
                  rows={4}
                />
              </div>
              <button onClick={verifyVideo}>Verify Video</button>
              
              {verificationResult && (
                <div className={`verification-result ${verificationResult.isValid ? 'valid' : 'invalid'}`}>
                  {verificationResult.isValid ? (
                    <>
                      <h3>✅ Signature Valid!</h3>
                      <p>Video was signed by: {verificationResult.signerAddress}</p>
                    </>
                  ) : (
                    <>
                      <h3>❌ Invalid Signature</h3>
                      <p>{verificationResult.error}</p>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;