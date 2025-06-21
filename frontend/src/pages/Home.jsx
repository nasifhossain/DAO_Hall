import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import { getContract } from "../utils/getContract";

const Home = () => {
  const [address, setAddress] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);

  const connectWallet = async () => {
    if (!window.ethereum) return alert("Install Metamask");
    try {
      const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
      const acc = accounts[0];
      setAddress(acc);
      checkIfAdmin(acc);
    } catch (err) {
      console.error("Wallet connection failed:", err);
    }
  };

  const checkIfAdmin = async (addr) => {
    try {
      const contract = await getContract();
      const owner = await contract.owner();
      setIsAdmin(owner.toLowerCase() === addr.toLowerCase());
    } catch (err) {
      console.error("Admin check failed:", err);
    }
  };

  useEffect(() => {
    if (window.ethereum) {
      window.ethereum.request({ method: "eth_accounts" }).then((accounts) => {
        if (accounts.length > 0) {
          setAddress(accounts[0]);
          checkIfAdmin(accounts[0]);
        }
      });
    }
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-gray-900 via-purple-900 to-gray-800 text-white">
      <Navbar isAdmin={isAdmin} isLoggedIn={!!address} />

      {/* Hero Section */}
      <div className="flex-grow flex items-center justify-center px-6">
        <div className="max-w-4xl w-full text-center">
          <h1 className="text-5xl md:text-6xl font-extrabold mb-6 leading-tight">
            🏛️ HallChain
          </h1>
          <p className="text-lg md:text-xl mb-8 text-gray-300">
            A decentralized voting & budget system for your IIT Hall. Propose ideas, vote securely, and ensure transparency — all powered by blockchain.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-6">
            <button
              onClick={connectWallet}
              className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-xl shadow-lg transition-all"
            >
              {address ? "🟢 Wallet Connected" : "🔗 Connect Wallet"}
            </button>

            <a
              href="/proposals"
              className="px-6 py-3 bg-white text-gray-900 font-semibold rounded-xl shadow-lg hover:bg-gray-200 transition"
            >
              🗳️ View Proposals
            </a>
          </div>

          {address && (
            <p className="text-sm text-green-400 font-mono">
              Connected as: {address} <br />
              Role: {isAdmin ? "👑 Admin" : "🧑‍🎓 Voter"}
            </p>
          )}
        </div>
      </div>

      {/* Features Section */}
      <div className="py-12 border-t border-purple-700 bg-gray-900">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl font-bold mb-6">📋 Key Features</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 px-4 text-left text-sm text-gray-300">
            <div className="flex items-start gap-3">
              <span className="text-green-400 text-lg">✅</span>
              <p><strong>Live Proposals:</strong> Submit and vote on ideas in real time.</p>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-blue-400 text-lg">🔐</span>
              <p><strong>Blockchain Security:</strong> Tamper-proof voting powered by smart contracts.</p>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-yellow-300 text-lg">🎓</span>
              <p><strong>Verified Voters:</strong> Only approved IIT students can participate.</p>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-purple-300 text-lg">⚙️</span>
              <p><strong>Tech Stack:</strong> Solidity + Sepolia Ethereum Testnet + MERN Stack.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
