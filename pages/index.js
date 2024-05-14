import { useState, useEffect } from "react";
import { ethers } from "ethers";
import atm_abi from "../artifacts/contracts/Assessment.sol/Assessment.json";

export default function HomePage() {
  const [ethWallet, setEthWallet] = useState(undefined);
  const [account, setAccount] = useState(undefined);
  const [atm, setATM] = useState(undefined);
  const [balance, setBalance] = useState(undefined);
  const [password, setPassword] = useState("");
  const [isPasswordCorrect, setIsPasswordCorrect] = useState(false);
  const [loanAmount, setLoanAmount] = useState("");
  const [interestRate, setInterestRate] = useState("");
  const [monthlyEMI, setMonthlyEMI] = useState("");
  const [numberOfEMIs, setNumberOfEMIs] = useState("");
  const [emiInterest, setEMIInterest] = useState("");

  const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
  const atmABI = atm_abi.abi;

  const getWallet = async () => {
    if (window.ethereum) {
      setEthWallet(window.ethereum);
    }

    if (ethWallet) {
      const account = await ethWallet.request({ method: "eth_accounts" });
      handleAccount(account);
    }
  }

  const handleAccount = (account) => {
    if (account) {
      console.log("Account connected: ", account);
      setAccount(account);
    }
    else {
      console.log("No account found");
    }
  }

  const connectAccount = async () => {
    if (!ethWallet) {
      alert('MetaMask wallet is required to connect');
      return;
    }

    const accounts = await ethWallet.request({ method: 'eth_requestAccounts' });
    handleAccount(accounts);

    // once wallet is set we can get a reference to our deployed contract
    getATMContract();
  };

  const getATMContract = () => {
    const provider = new ethers.providers.Web3Provider(ethWallet);
    const signer = provider.getSigner();
    const atmContract = new ethers.Contract(contractAddress, atmABI, signer);

    setATM(atmContract);
  }

  const getBalance = async () => {
    if (atm) {
      setBalance((await atm.getBalance()).toNumber());
    }
  }

  const deposit = async () => {
    if (isPasswordCorrect && atm) {
      let tx = await atm.deposit(1);
      await tx.wait();
      getBalance();
    } else {
      alert("Incorrect password");
    }
  }

  const withdraw = async () => {
    if (isPasswordCorrect && atm) {
      let tx = await atm.withdraw(1);
      await tx.wait();
      getBalance();
    } else {
      alert("Incorrect password");
    }
  }

  const handlePasswordChange = (event) => {
    setPassword(event.target.value);
  }

  const handlePasswordSubmit = () => {
    if (password === "robert") {
      setIsPasswordCorrect(true);
    } else {
      alert("Incorrect password");
    }
  }

  const calculateEMI = () => {
    if (!isNaN(loanAmount) && !isNaN(interestRate) && !isNaN(monthlyEMI) && !isNaN(numberOfEMIs)) {
      const principal = parseFloat(loanAmount);
      const rate = parseFloat(interestRate) / 100 / 12; // Monthly interest rate
      const emi = (principal * rate * Math.pow(1 + rate, numberOfEMIs)) / (Math.pow(1 + rate, numberOfEMIs) - 1);
      const interest = (emi * numberOfEMIs) - principal;
      setEMIInterest(interest);
    } else {
      alert("Please enter valid numbers for loan amount, interest rate, monthly EMI, and number of EMIs.");
    }
  }

  const initUser = () => {
    // Check to see if user has Metamask
    if (!ethWallet) {
      return <p>Please install Metamask in order to use this ATM.</p>
    }

    // Check to see if user is connected. If not, connect to their account
    if (!account) {
      return <button onClick={connectAccount}>Please connect your Metamask wallet</button>
    }

    if (balance == undefined) {
      getBalance();
    }

    return (
      <div>
        <p>Your Account: {account}</p>
        <p>Your Balance: {balance}</p>
        <input type="password" placeholder="Enter password" value={password} onChange={handlePasswordChange} />
        <button onClick={handlePasswordSubmit}>Submit</button>
        <br />
        <p>Loan Amount:</p>
        <input type="number" value={loanAmount} onChange={(e) => setLoanAmount(e.target.value)} />
        <br />
        <p>Interest Rate (in %):</p>
        <input type="number" value={interestRate} onChange={(e) => setInterestRate(e.target.value)} />
        <br />
        <p>Monthly EMI:</p>
        <input type="number" value={monthlyEMI} onChange={(e) => setMonthlyEMI(e.target.value)} />
        <br />
        <p>Number of EMIs:</p>
        <input type="number" value={numberOfEMIs} onChange={(e) => setNumberOfEMIs(e.target.value)} />
        <br />
        <button onClick={calculateEMI}>Calculate EMI Interest</button>
        {emiInterest !== "" && (
          <p>EMI Interest: {emiInterest}</p>
        )}
        <br />
        <button onClick={deposit}>Deposit 1 ETH</button>
        <button onClick={withdraw}>Withdraw 1 ETH</button>
      </div>
    )
  }

  useEffect(() => { getWallet(); }, []);

  return (
    <main className="container">
      <header><h1>Welcome to the Metacrafters ATM!</h1></header>
      {initUser()}
      <style jsx>{`
        .container {
          text-align: center
        }
      `}
      </style>
    </main>
  )
}
