import { useEffect, useState } from "react";
import axios from "axios";
import Navbar from "../components/Navbar";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";

const MyAccount = () => {
  const [user, setUser] = useState(null);
  const [wallet, setWallet] = useState("");
  const [status, setStatus] = useState(null);

  const token = localStorage.getItem("token");
  const userObj = localStorage.getItem("user");
  const email = userObj ? JSON.parse(userObj).email : null;

  const fetchProfile = async () => {
    try {
      const res = await axios.get(`${BACKEND_URL}/user/profile`, {
        params: { email },
        headers: { Authorization: `Bearer ${token}` },
      });
      setUser(res.data);
      setWallet(res.data.walletAddress || "");
    } catch (err) {
      console.error(err);
      setStatus({ type: "error", message: "Failed to fetch profile." });
    }
  };

  const handleWalletUpdate = async () => {
    if (!wallet) {
      setStatus({ type: "error", message: "⚠️ Wallet address cannot be empty." });
      return;
    }

    try {
      const res = await axios.put(
        `${BACKEND_URL}/user/wallet`,
        { email, walletAddress: wallet },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setStatus({ type: "success", message: res.data.message });
    } catch (err) {
      console.error(err);
      setStatus({
        type: "error",
        message: err.response?.data?.error || "Update failed.",
      });
    }
  };

  useEffect(() => {
    if (email) fetchProfile();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-950 to-black text-white">
      <Navbar />
      <div className="max-w-3xl mx-auto px-6 py-12">
        <div className="bg-gray-800 rounded-2xl shadow-2xl p-8 border border-purple-700">
          <h1 className="text-3xl font-bold text-center mb-6 text-purple-400">👤 My Account</h1>

          {status && (
            <div
              className={`text-center mb-6 px-4 py-2 rounded-lg font-medium ${
                status.type === "success"
                  ? "bg-green-500/10 text-green-400 border border-green-600"
                  : "bg-red-500/10 text-red-400 border border-red-600"
              }`}
            >
              {status.message}
            </div>
          )}

          {user ? (
            <div className="space-y-6">
              <div className="bg-gray-700 p-4 rounded-lg shadow">
                <p className="text-lg">
                  <span className="font-semibold text-purple-300">🙍 Name:</span> {user.name}
                </p>
                <p className="text-lg">
                  <span className="font-semibold text-purple-300">📧 Email:</span> {user.email}
                </p>
                <p className="text-lg">
                  <span className="font-semibold text-purple-300">✅ Approved:</span>{" "}
                  {user.isApproved ? "Yes" : "No"}
                </p>
              </div>

              <div>
                <label className="block mb-1 font-semibold text-purple-300">
                  🔗 Wallet Address
                </label>
                <input
                  type="text"
                  value={wallet}
                  onChange={(e) => setWallet(e.target.value)}
                  placeholder="0x..."
                  className="w-full px-4 py-2 rounded-md bg-gray-700 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <button
                onClick={handleWalletUpdate}
                className="w-full bg-purple-600 hover:bg-purple-700 transition py-2 rounded-md font-semibold"
              >
                💾 Update Wallet Address
              </button>
            </div>
          ) : (
            <p className="text-center text-gray-400">⏳ Loading profile...</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default MyAccount;
