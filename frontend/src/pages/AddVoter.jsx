import { useEffect, useState } from "react";
import { getContract } from "../utils/getContract";
import { ethers } from "ethers";
import axios from "axios";
import Navbar from "../components/Navbar";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";

const AddVoter = () => {
  const [users, setUsers] = useState([]);
  const [proposals, setProposals] = useState([]);
  const [selectedProposal, setSelectedProposal] = useState(null);
  const [allowedVoters, setAllowedVoters] = useState([]);
  const [status, setStatus] = useState("");
  const [address, setAddress] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);

  const checkIfAdmin = async (addr) => {
    try {
      const contract = await getContract();
      const owner = await contract.owner();
      setIsAdmin(owner.toLowerCase() === addr.toLowerCase());
    } catch (err) {
      console.error("Admin check failed:", err);
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await axios.get(`${BACKEND_URL}/user/all`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      const filtered = res.data.filter((u) => u.isApproved && u.walletAddress);
      setUsers(filtered);
    } catch (err) {
      console.error("Failed to fetch users", err);
    }
  };

  const fetchProposals = async () => {
    try {
      const contract = await getContract();
      const list = await contract.getAllProposals();

      const now = Math.floor(Date.now() / 1000);
      const active = list.filter((p) => Number(p.deadline) > now);

      setProposals(active);
      if (active.length > 0) {
        setSelectedProposal(active[0].id.toString());
      } else {
        setSelectedProposal(null);
      }
    } catch (err) {
      console.error("Failed to fetch proposals:", err);
    }
  };

  const fetchAllowedVoters = async (proposalId) => {
    try {
      const contract = await getContract();
      const voters = await contract.getAllowedVoters(proposalId);
      setAllowedVoters(voters.map((v) => v.toLowerCase()));
    } catch (err) {
      console.error("Failed to fetch allowed voters:", err);
    }
  };

  useEffect(() => {
    const init = async () => {
      if (!window.ethereum) return alert("Install MetaMask");

      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });

      const acc = accounts[0];
      setAddress(acc);
      await checkIfAdmin(acc);
      await fetchUsers();
      await fetchProposals();
    };

    init();
  }, []);

  useEffect(() => {
    if (selectedProposal) fetchAllowedVoters(selectedProposal);
  }, [selectedProposal]);

  const handleAdd = async (wallet) => {
    if (!selectedProposal) return;

    try {
      const validWallet = ethers.getAddress(wallet);
      const contract = await getContract();
      const tx = await contract.allowVoterForProposal(selectedProposal, validWallet);
      setStatus("⏳ Confirming transaction...");
      await tx.wait();
      setStatus(`✅ ${validWallet} added to Proposal #${selectedProposal}`);
      await fetchAllowedVoters(selectedProposal);
    } catch (err) {
      console.error("Error adding voter:", err);
      setStatus("❌ Failed to approve voter (maybe already added)");
    }
  };

  const handleRemove = async (wallet) => {
    try {
      const validWallet = ethers.getAddress(wallet);
      const contract = await getContract();
      const tx = await contract.removeVoterFromProposal(selectedProposal, validWallet);
      setStatus("⏳ Removing voter...");
      await tx.wait();
      setStatus(`❌ ${validWallet} removed from Proposal #${selectedProposal}`);
      await fetchAllowedVoters(selectedProposal);
    } catch (err) {
      console.error("Error removing voter:", err);
      setStatus("❌ Failed to remove voter");
    }
  };

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center px-4">
        <p className="text-red-400 text-lg">⛔ Only the contract owner can add voters.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <Navbar />
      <h1 className="text-3xl font-bold text-center mt-6">🗳️ Manage Voters for a Proposal</h1>

      {status && <p className="text-center mb-4 text-sm text-yellow-400">{status}</p>}

      {proposals.length === 0 ? (
        <p className="text-center text-gray-400 mt-4">No active proposals available for voting.</p>
      ) : (
        <div className="max-w-2xl mx-auto mb-6">
          <label className="block text-sm mb-1 text-purple-300">Select Proposal</label>
          <select
            value={selectedProposal}
            onChange={(e) => setSelectedProposal(e.target.value)}
            className="w-full p-2 rounded-md bg-gray-800 border border-purple-700 text-white"
          >
            {proposals.map((p) => (
              <option key={p.id.toString()} value={p.id.toString()}>
                #{p.id.toString()} — {p.title}
              </option>
            ))}
          </select>
        </div>
      )}

      {selectedProposal && users.length > 0 && (
        <div className="max-w-3xl mx-auto space-y-4">
          {users.map((user) => {
            const isAdded = allowedVoters.includes(user.walletAddress.toLowerCase());
            return (
              <div
                key={user._id}
                className="bg-gray-800 p-4 rounded-xl shadow-md border border-purple-700 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2"
              >
                <div>
                  <h2 className="text-lg font-semibold">{user.name}</h2>
                  <p className="text-sm text-gray-300">📧 {user.email}</p>
                  <p className="text-sm text-gray-300">🔗 {user.walletAddress}</p>
                </div>

                {isAdded ? (
                  <div className="flex items-center gap-2">
                    <span className="text-green-400 text-sm font-semibold">✅ Added</span>
                    <button
                      onClick={() => handleRemove(user.walletAddress)}
                      className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg"
                    >
                      ❌ Remove
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => handleAdd(user.walletAddress)}
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg"
                  >
                    ➕ Add to Vote
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}

      {selectedProposal && users.length === 0 && (
        <p className="text-center text-gray-400 mt-4">No eligible users with wallet addresses.</p>
      )}
    </div>
  );
};

export default AddVoter;
