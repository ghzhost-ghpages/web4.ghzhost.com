// Web3 Wallet Connection Handler
(function() {
  function initWalletConnection() {
    const connectBtn = document.getElementById('wallet-connect');
    if (!connectBtn) return;

    let currentAccount = null;
    let provider = null;

    // Detect Web3 provider
    function detectProvider() {
      if (typeof window.ethereum !== 'undefined') {
        provider = window.ethereum;
        return true;
      } else if (typeof window.web3 !== 'undefined') {
        provider = window.web3.currentProvider;
        return true;
      }
      return false;
    }

    // Check if already connected
    async function checkConnection() {
      if (!detectProvider()) {
        connectBtn.textContent = 'Instalar Carteira';
        connectBtn.onclick = () => {
          window.open('https://metamask.io/download/', '_blank');
        };
        return;
      }

      try {
        const accounts = await provider.request({ method: 'eth_accounts' });
        if (accounts.length > 0) {
          currentAccount = accounts[0];
          updateButton(accounts[0]);
        }
      } catch (error) {
        console.error('Erro ao verificar conexão:', error);
      }
    }

    // Connect wallet
    async function connectWallet() {
      if (!detectProvider()) {
        alert('Por favor, instale MetaMask ou outra carteira Web3 para continuar.');
        window.open('https://metamask.io/download/', '_blank');
        return;
      }

      try {
        const accounts = await provider.request({ 
          method: 'eth_requestAccounts' 
        });
        
        if (accounts.length > 0) {
          currentAccount = accounts[0];
          updateButton(accounts[0]);
          
          // Show success message
          showNotification('Carteira conectada com sucesso!', 'success');
          
          // Listen for account changes
          provider.on('accountsChanged', handleAccountsChanged);
          provider.on('chainChanged', () => window.location.reload());
        }
      } catch (error) {
        if (error.code === 4001) {
          showNotification('Conexão rejeitada pelo usuário.', 'error');
        } else {
          showNotification('Erro ao conectar carteira: ' + error.message, 'error');
        }
      }
    }

    // Disconnect wallet
    function disconnectWallet() {
      currentAccount = null;
      connectBtn.textContent = 'Conectar';
      connectBtn.onclick = connectWallet;
      showNotification('Carteira desconectada.', 'info');
    }

    // Update button text
    function updateButton(address) {
      const shortAddress = `${address.slice(0, 6)}...${address.slice(-4)}`;
      connectBtn.textContent = shortAddress;
      connectBtn.onclick = disconnectWallet;
      connectBtn.title = `Conectado: ${address}`;
    }

    // Handle account changes
    function handleAccountsChanged(accounts) {
      if (accounts.length === 0) {
        disconnectWallet();
      } else if (accounts[0] !== currentAccount) {
        currentAccount = accounts[0];
        updateButton(accounts[0]);
        showNotification('Conta alterada.', 'info');
      }
    }

    // Show notification
    function showNotification(message, type = 'info') {
      const notification = document.createElement('div');
      notification.className = `wallet-notification wallet-notification-${type}`;
      notification.textContent = message;
      document.body.appendChild(notification);
      
      setTimeout(() => notification.classList.add('show'), 10);
      setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 300);
      }, 3000);
    }

    // Initialize
    connectBtn.onclick = (e) => {
      e.preventDefault();
      if (currentAccount) {
        disconnectWallet();
      } else {
        connectWallet();
      }
    };

    checkConnection();
  }

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initWalletConnection);
  } else {
    initWalletConnection();
  }
})();

