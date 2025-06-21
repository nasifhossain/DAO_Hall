import { useEffect, useState } from "react";
import axios from "axios";
import { getContract } from "../utils/getContract";
import Navbar from "../components/Navbar";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";

const Request = () => {
  const [requests, setRequests] = useState([]);
  const [status, setStatus] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [address, setAddress] = useState("");

  const token = localStorage.getItem("token");

  const checkIfAdmin = async (addr) => {
    try {
      const contract = await getContract();
      const owner = await contract.owner();
      setIsAdmin(owner.toLowerCase() === addr.toLowerCase());
    } catch (err) {
      console.error("Admin check failed:", err);
    }
  };

  const fetchRequests = async () => {
    try {
      const res = await axios.get(`${BACKEND_URL}/user/requests`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setRequests(res.data);
    } catch (err) {
      console.error(err);
      setStatus({ type: "error", message: "Failed to fetch requests." });
    }
  };

  const handleApprove = async (id) => {
    try {
      const res = await axios.put(
        `${BACKEND_URL}/user/approve/${id}`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setStatus({ type: "success", message: res.data.message });
      setRequests((prev) => prev.filter((u) => u._id !== id));
    } catch (err) {
      console.error(err);
      setStatus({
        type: "error",
        message: err.response?.data?.error || "Approval failed.",
      });
    }
  };

  useEffect(() => {
    const init = async () => {
      if (!window.ethereum) return alert("Install Metamask");
      const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
      const acc = accounts[0];
      setAddress(acc);
      await checkIfAdmin(acc);
    };

    init();
  }, []);

  useEffect(() => {
    if (isAdmin) fetchRequests();
  }, [isAdmin]);

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gray-900 text-white">
        <Navbar />
        <div className="flex items-center justify-center h-[80vh] px-4">
          <p className="text-red-400 text-lg text-center">
            ⛔ Only the contract owner can approve registration requests.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <Navbar />
      <div className="max-w-5xl mx-auto px-6 py-12">
        <div className="bg-gray-800 rounded-xl shadow-xl border border-purple-700 p-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-2 text-center">📝 Pending Registration Approvals</h1>
          <p className="text-sm text-gray-400 mb-6 text-center">
            These users have registered and are awaiting admin approval to join the system.
          </p>

          {status && (
            <div
              className={`mb-6 text-center font-medium ${
                status.type === "success" ? "text-green-400" : "text-red-400"
              }`}
            >
              {status.message}
            </div>
          )}

          {requests.length === 0 ? (
            <div className="text-center text-gray-400">
              <p className="text-lg">🎉 All registration requests have been reviewed.</p>
              <p className="text-sm mt-1">No pending users at the moment.</p>
            </div>
          ) : (
            <ul className="space-y-4">
              {requests.map((user) => (
                <li
                  key={user._id}
                  className="bg-gray-700 p-5 rounded-lg flex flex-col md:flex-row justify-between items-start md:items-center"
                >
                  <div>
                    <h2 className="text-lg font-semibold text-white">{user.name}</h2>
                    <p className="text-sm text-gray-300">📧 {user.email}</p>
                  </div>
                  <button
                    onClick={() => handleApprove(user._id)}
                    className="mt-3 md:mt-0 bg-green-600 hover:bg-green-700 px-4 py-2 rounded-md text-white font-semibold"
                  >
                    ✅ Approve
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default Request;
