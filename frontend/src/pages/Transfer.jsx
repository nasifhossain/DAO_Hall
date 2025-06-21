import { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import { getContract } from "../utils/getContract";
import { ethers } from "ethers";
import axios from "axios";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";

const TransferAdmin = () => {
  const [email, setEmail] = useState("");
  const [wallet, setWallet] = useState("");
  const [status, setStatus] = useState("");
  const [address, setAddress] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1); // 1: enter email, 2: confirm & transfer

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
    const init = async () => {
      if (!window.ethereum) return alert("Install MetaMask");
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });
      setAddress(accounts[0]);
      await checkIfAdmin(accounts[0]);
    };
    init();
  }, []);

  const verifyEmail = async (e) => {
    e.preventDefault();
    setStatus("");
    if (!email) {
      setStatus("❌ Please enter an email.");
      return;
    }

    try {
      const res = await axios.post(
        `${BACKEND_URL}/user/checktransfer`,
        { email }, // ✅ body goes here
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      setWallet(res.data.newAdmin.walletAddress);
      setStep(2);
      setStatus("✅ Email verified. Wallet loaded.");
    } catch (err) {
      const msg = err.response?.data?.error || "Failed to verify email.";
      setStatus(`❌ ${msg}`);
    }
  };

  const finalizeTransfer = async (e) => {
    e.preventDefault();
    try {
      const validWallet = ethers.getAddress(wallet);
      const contract = await getContract();

      setLoading(true);
      setStatus("⏳ Transferring ownership on blockchain...");
      const tx = await contract.transferOwnership(validWallet);
      await tx.wait();

      await axios.post(
        `${BACKEND_URL}/user/transfer`,
        { email, wallet, by: address },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      setStatus(`✅ Admin rights transferred to ${email}`);
      setEmail("");
      setWallet("");
      setStep(1);
    } catch (err) {
      console.error(err);
      setStatus("❌ Transfer failed. Check permissions and wallet address.");
    } finally {
      setLoading(false);
    }
  };

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gray-900 text-white">
        <Navbar />
        <div className="flex flex-col items-center justify-center h-[80vh] px-4">
          <p className="text-red-400 text-lg text-center">
            ⛔ Only the current admin can transfer ownership.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <Navbar />
      <div className="max-w-md mx-auto mt-10 bg-gray-800 p-6 rounded-xl shadow-xl border border-purple-700">
        <h2 className="text-2xl font-bold text-center mb-6">
          🔄 Transfer Admin Rights
        </h2>

        {status && (
          <p className="text-sm mb-4 text-center text-yellow-400 whitespace-pre-wrap">
            {status}
          </p>
        )}

        {step === 1 && (
          <form onSubmit={verifyEmail} className="space-y-4">
            <div>
              <label className="block mb-1 text-sm text-purple-300">
                New Admin's Email
              </label>
              <input
                type="email"
                className="w-full p-2 bg-gray-700 text-white border border-gray-600 rounded-md"
                placeholder="admin@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <button
              type="submit"
              className="w-full py-2 rounded-lg font-semibold bg-purple-600 hover:bg-purple-700 transition"
            >
              ✅ Verify Email
            </button>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={finalizeTransfer} className="space-y-4">
            <div>
              <label className="block mb-1 text-sm text-purple-300">
                Email
              </label>
              <input
                type="text"
                value={email}
                readOnly
                className="w-full p-2 bg-gray-700 text-white border border-gray-600 rounded-md opacity-70"
              />
            </div>

            <div>
              <label className="block mb-1 text-sm text-purple-300">
                Wallet Address
              </label>
              <input
                type="text"
                value={wallet}
                readOnly
                className="w-full p-2 bg-gray-700 text-white border border-gray-600 rounded-md opacity-70"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-2 rounded-lg font-semibold transition ${
                loading ? "bg-gray-600" : "bg-green-600 hover:bg-green-700"
              }`}
            >
              {loading ? "Transferring..." : "🔁 Confirm Transfer"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default TransferAdmin;
