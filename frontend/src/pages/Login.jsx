import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { ethers } from "ethers";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "https://dao-hall.onrender.com";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState(null);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      setStatus({ type: "error", message: "Please fill in all fields." });
      return;
    }

    try {
      const res = await axios.post(`${BACKEND_URL}/user/login`, { email, password });
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));
      setStatus({ type: "success", message: "Login successful!" });
      setTimeout(() => navigate("/"), 1000);
    } catch (err) {
      const msg = err.response?.data?.error || "Login failed.";
      setStatus({ type: "error", message: msg });
    }
  };
  
  const connectAndLogin = async () => {
    if (!window.ethereum) return alert("Please install MetaMask.");

    try {
      const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
      const wallet = ethers.getAddress(accounts[0]); 
      if (!wallet) return;

      const res = await axios.get(`${BACKEND_URL}/user/by-wallet/${wallet}`);
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));
      setStatus({ type: "success", message: "Wallet login successful!" });

      setTimeout(() => navigate("/"), 1000);
    } catch (err) {
      console.error("Wallet login error:", err);
      const msg = err.response?.data?.error || "Wallet login failed.";
      setStatus({ type: "error", message: msg });
    }
  };

  useEffect(() => {
    const autoLogin = async () => {
      if (!window.ethereum) return;

      try {
        const accounts = await window.ethereum.request({ method: "eth_accounts" });
        const wallet = accounts[0];
        if (!wallet) return;

        const res = await axios.get(`${BACKEND_URL}/user/by-wallet/${wallet}`);
        localStorage.setItem("token", res.data.token);
        localStorage.setItem("user", JSON.stringify(res.data.user));
        setStatus({ type: "success", message: "Auto-login successful!" });

        setTimeout(() => navigate("/"), 1000);
      } catch (err) {
        console.log("Auto-login skipped:", err.response?.data?.error);
      }
    };

    autoLogin();
  }, []);

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-900 text-white flex flex-col md:flex-row items-center justify-center px-4 py-12">
        {/* Left panel with welcome text */}
        <div className="md:w-1/2 mb-10 md:mb-0 md:pr-10 text-center md:text-left">
          <h1 className="text-4xl font-bold text-purple-400 mb-4">Welcome to HallChain 🏛️</h1>
          <p className="text-gray-300 text-lg">
            A secure and transparent blockchain-based voting platform built for your IIT Hall.
            Cast your votes confidently, track proposals, and help shape the future of your community.
          </p>
          <p className="text-sm text-gray-500 mt-4">
            Note: Only approved users can log in and participate in elections.
          </p>
        </div>

        {/* Right panel with login form */}
        <div className="w-full md:w-1/2 max-w-md bg-gray-800 rounded-xl p-8 shadow-lg border border-purple-700">
          <h2 className="text-2xl font-bold mb-6 text-center">🔐 Login to HallChain</h2>

          {status && (
            <div
              className={`mb-4 text-center text-sm ${
                status.type === "success" ? "text-green-400" : "text-red-400"
              }`}
            >
              {status.message}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block mb-1 text-sm">Email</label>
              <input
                type="email"
                className="w-full px-4 py-2 rounded-md bg-gray-700 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
              />
            </div>

            <div>
              <label className="block mb-1 text-sm">Password</label>
              <input
                type="password"
                className="w-full px-4 py-2 rounded-md bg-gray-700 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-purple-600 hover:bg-purple-700 text-white py-2 rounded-lg font-semibold transition"
            >
              🔑 Login
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-400 mb-2">or</p>
            <button
              onClick={connectAndLogin}
              className="w-full bg-yellow-500 hover:bg-yellow-600 text-black font-semibold py-2 rounded-md"
            >
              🦊 Connect MetaMask Wallet
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default Login;
