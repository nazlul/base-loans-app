import { ConnectButton, useAddRecentTransaction } from '@rainbow-me/rainbowkit';
import type { NextPage } from 'next';
import { useAccount } from 'wagmi';
import Head from 'next/head';
import styles from '../styles/Home.module.css';
import Image from 'next/image';
import { ethers, formatEther } from 'ethers';
import { useEffect, useState } from 'react';
import { contractABI, contractAddress } from "../utils/constants";

const Home: NextPage = () => {
  const { isConnected, address } = useAccount();
  const [balance, setBalance] = useState<number | null>(null);
  const [amount, setAmount] = useState<string>('');
  const [outputAmount, setOutputAmount] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);
  const [errorDismissed, setErrorDismissed] = useState<boolean>(false);
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null);
  const [contract, setContract] = useState<ethers.Contract | null>(null);
  const [ownerAddress, setOwnerAddress] = useState<string | null>(null);
  const addRecentTransaction = useAddRecentTransaction();

  const handleErrorClose = () => {
    setError(null);
    setErrorDismissed(true); 
  };

  const setErrorWithCheck = (message: string) => {
    if (!errorDismissed) {
      setError(message);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value; 
    if (inputValue === '') {
        setAmount('');
        setOutputAmount(0);
        setError(null); 
        return;
    }
    const parsedValue = parseFloat(inputValue); 
    const minimumInput = 0.0001;

    if (isNaN(parsedValue)) {
        setError('Invalid input. Please enter a valid number.');
        setAmount(inputValue); 
        setOutputAmount(0);
        return;
    }
    if (parsedValue < minimumInput) {
        setError(`Minimum input is ${minimumInput} ETH.`);
        setAmount(inputValue); 
        setOutputAmount(0);
    } else if (parsedValue > (balance || 0)) {
        setError(`Input exceeds wallet balance of ${balance} ETH.`);
        setAmount(inputValue);
        setOutputAmount(0);
    } else {
        setError(null); 
        setAmount(inputValue); 
        setOutputAmount(parsedValue * 2.5); 
    }
};



  useEffect(() => {
    if (isConnected) {
      const initialize = async () => {
        if (typeof window.ethereum !== 'undefined') {
          const providerInstance = new ethers.BrowserProvider(window.ethereum);
          const network = await providerInstance.getNetwork();
          console.log("Connected to network: ", network);
          setProvider(providerInstance);
          await getContractInstance(providerInstance);
        } else {
          console.error('Ethereum object not found. Please install MetaMask.');
          setError('Ethereum object not found. Please install MetaMask.');
        }
      };

      initialize();
    } else {
      setBalance(null);
      setContract(null);
      setError(null);
    }
  }, [isConnected, provider]);

  const getContractInstance = async (providerInstance: ethers.BrowserProvider | null) => {
    if (!providerInstance) {
      console.error('Provider is not initialized yet. Cannot create contract instance.');
      setError('Provider is not initialized yet.');
      return;
    }
  
    try {
      const signer = await providerInstance.getSigner();
      if (!signer) {
        console.error('Failed to obtain signer. Please ensure wallet is connected.');
        setError('Failed to obtain signer. Please ensure wallet is connected.');
        return;
      }
      
      console.log("Signer obtained:", signer);
      
      const transactionsContract = new ethers.Contract(contractAddress, contractABI, signer);
      
      if (!transactionsContract) {
        console.error('Contract instance could not be initialized.');
        setError('Contract instance could not be initialized.');
        return;
      }
      
      console.log("Contract initialized:", transactionsContract);
      setContract(transactionsContract);
  
      const contractOwner = await transactionsContract.owner();
      if (!contractOwner) {
        console.error('Failed to fetch contract owner.');
        setError('Failed to fetch contract owner.');
        return;
      }
  
      console.log("Contract owner:", contractOwner);
      setOwnerAddress(contractOwner);
  
    } catch (err) {
      if (err instanceof Error) {
        console.error('Error getting contract instance:', err.message);
      } else {
        console.error('Unknown error:', err);
        setError('Failed to initialize contract due to an unknown error.');
      }
    }
  };  

  const fetchTokenBalance = async () => {
    if (!address) return;

    const url = `https://base-sepolia.g.alchemy.com/v2/${process.env.NEXT_PUBLIC_API}`;
    const headers = {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    };

    const body = JSON.stringify({
      id: 1,
      jsonrpc: "2.0",
      method: "eth_getBalance",
      params: [
        address,
        "latest",
      ],
    });

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: headers,
        body: body,
      });
      const data = await response.json();

      if (data && data.result) {
        const balanceInWei = data.result;
        const balanceInEth = parseFloat(formatEther(balanceInWei));
        if (!isNaN(balanceInEth) && balanceInEth > 0) {
          const truncatedBalance = balanceInEth.toString().match(/^-?\d+(?:\.\d{0,3})?/);
      
          if (truncatedBalance && truncatedBalance[0]) {
            setBalance(parseFloat(truncatedBalance[0]));  
          }
        } else {
          setBalance(0); 
        }
      } else {
        setError('Failed to fetch balance');
      }
    } catch (err) {
      console.error('Error fetching balance:', err);
      setError('Error fetching balance');
    }
  };

  const handleDeposit = async () => {
    if (!contract) {
      setError('Contract not initialized. Please connect your wallet.');
      return;
    }

    if (!amount || parseFloat(amount) <= 0) {
      setError('Please specify a valid amount greater than 0.');
      return;
    }

    const amountInWei = ethers.parseEther(amount);

    try {
      const tx = await contract.deposit({ value: amountInWei });
      await tx.wait();
      setError(null);
      alert('Deposit successful!');
      addRecentTransaction({
        hash: tx.hash,
        description: `Deposit of ${amount} ETH`,
      });
      fetchTokenBalance();
    } catch (err) {
      console.error('Error during deposit:', err);
      setError('Deposit failed');
    }
  };

  const handleWithdraw = async () => {
    if (!contract) {
      setError('Contract not initialized. Please connect your wallet.');
      return;
    }

    if (address !== ownerAddress) {
      setError('Connected wallet is not the contract owner.');
      return;
    }

    try {
      const tx = await contract.withdraw();
      await tx.wait();
      setError(null);
      alert('Withdrawal successful!');
      fetchTokenBalance();
    } catch (err) {
      if (err instanceof Error) {
        console.error('Error during withdrawal:', err);
        if (err.message.includes("missing revert data")) {
          setErrorWithCheck('Failed to initialize contract: Contract call reverted without data.');
        } else {
          setErrorWithCheck(`Withdrawal failed: ${err.message}`);
        }
      } else {
        console.error('Unknown error during withdrawal:', err);
        setErrorWithCheck('Withdrawal failed due to an unknown error.');
      }
    }
  };

  useEffect(() => {
    if (isConnected && address) {
      fetchTokenBalance();

      const intervalId = setInterval(() => {
        fetchTokenBalance();
      }, 10000);

      return () => clearInterval(intervalId);
    }
  }, [isConnected, address]);

  return (
    <div className={styles.container}>
      <Head>
        <title>Presale Launchpad</title>
        <meta content="Base Presale App" name="description" />
        <link href="/favicon.ico" rel="icon" />
      </Head>

      <header className={styles.header}>
        <ConnectButton label="Connect" showBalance={true} />
      </header>

      <main className={styles.main}>
        <div className={styles.version}> 
          Beta 1.4.2
        </div>
        <div className={styles.card}>
          <Image
            src="/assets/base.png"
            alt="Logo"
            width={50}
            height={50}
            className={styles.logo}
          />
          <h1>Deposit</h1>
          <div className={styles.transaction}>
            <div className={styles.input}>
              <label htmlFor="amount">ETH</label>
              <input
                id="amount"
                type="number"
                step="0.01"
                value={amount}
                onChange={handleInputChange}
              />
              <span>Balance: {balance} ETH</span>
            </div>
            <div className={styles.output}>
              <label  htmlFor="output-amount">ETH</label>
              <input
              id="output-amount"
              type="text"
              value={outputAmount.toFixed(3)}
              readOnly
            />
            </div>
            <div className={styles.details}>
                <div>
                  <label>Transfer time</label>
                  <span>~15 sec</span>
                </div>
                <div>
                  <label>Network fees</label>
                  <span>~ 0 ETH</span>
                </div>
            </div>
            <div className={styles.connectWalletWrapper}>
              {isConnected ? (
                <button onClick={handleDeposit}>Deposit</button>
              ) : (
                <ConnectButton />
              )}
            </div>
            {error && (
              <div className={styles.errorBox}>
                <span className={styles.closeButton} onClick={handleErrorClose}>&times;</span>
                {error}
              </div>
            )}
          </div>
        </div>
        {isConnected && address === ownerAddress && (
          <div className={styles.card}>
            <h1>Withdraw</h1>
            <div className={styles.connectWalletWrapper}>
              <button onClick={handleWithdraw}>Withdraw All</button>
            </div>
          </div>
        )}
      </main>
      <div className={styles.footer}>
        Audited by
        <Image
            src="/assets/certik.png"
            alt="Certik Logo"
            width={100}
            height={40}
          />
        </div>
    </div>
  );
};

export default Home;