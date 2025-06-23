import { useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "https://dao-hall.onrender.com";

const Register = () => {
  const [form, setForm] = useState({ name: "", email: "", password: "", confirmPassword: "" });
  const [status, setStatus] = useState(null);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { name, email, password, confirmPassword } = form;

    if (!name || !email || !password || !confirmPassword) {
      setStatus({ type: "error", message: "⚠️ Please fill in all fields." });
      return;
    }

    if (password !== confirmPassword) {
      setStatus({ type: "error", message: "❌ Passwords do not match." });
      return;
    }

    if (password.length < 6) {
      setStatus({ type: "error", message: "🔒 Password must be at least 6 characters." });
      return;
    }

    try {
      const res = await axios.post(`${BACKEND_URL}/user/register`, {
        name,
        email,
        password,
      });

      setStatus({ type: "success", message: `✅ ${res.data.message}` });
      setForm({ name: "", email: "", password: "", confirmPassword: "" });
    } catch (err) {
      const msg = err.response?.data?.error || "Registration failed.";
      setStatus({ type: "error", message: `❌ ${msg}` });
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <Navbar />
      <div className="flex flex-col md:flex-row items-center justify-center px-4 py-12">
        {/* Info Side */}
        <div className="md:w-1/2 hidden md:block pr-12">
          <h1 className="text-4xl font-extrabold text-purple-400 mb-4 animate-pulse">
            🗳️ Join DAOmocracy
          </h1>
          <p className="text-gray-300 text-lg">
            Be part of transparent and secure voting in your hall. Once registered, your account will be reviewed and added to upcoming proposals!
          </p>
          <p className="mt-4 text-sm text-gray-500">
            Already have an account?{" "}
            <Link to="/login" className="text-purple-400 hover:underline">
              Login here
            </Link>
          </p>
        </div>

        {/* Form Side */}
        <div className="w-full md:w-1/2 max-w-md bg-gray-800 rounded-xl p-8 shadow-lg border border-purple-700">
          <h2 className="text-2xl font-bold mb-6 text-center">📝 Register to Vote</h2>

          {status && (
            <div
              className={`mb-4 text-center text-sm ${
                status.type === "success" ? "text-green-400" : "text-red-400"
              }`}
            >
              {status.message}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block mb-1 text-sm">Full Name</label>
              <input
                name="name"
                type="text"
                className="w-full px-4 py-2 rounded-md bg-gray-700 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500"
                value={form.name}
                onChange={handleChange}
                placeholder="John Doe"
              />
            </div>

            <div>
              <label className="block mb-1 text-sm">Email Address</label>
              <input
                name="email"
                type="email"
                className="w-full px-4 py-2 rounded-md bg-gray-700 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500"
                value={form.email}
                onChange={handleChange}
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label className="block mb-1 text-sm">Password</label>
              <input
                name="password"
                type="password"
                className="w-full px-4 py-2 rounded-md bg-gray-700 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500"
                value={form.password}
                onChange={handleChange}
                placeholder="Minimum 6 characters"
              />
            </div>

            <div>
              <label className="block mb-1 text-sm">Confirm Password</label>
              <input
                name="confirmPassword"
                type="password"
                className="w-full px-4 py-2 rounded-md bg-gray-700 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500"
                value={form.confirmPassword}
                onChange={handleChange}
                placeholder="Re-enter password"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-purple-600 hover:bg-purple-700 text-white py-2 rounded-lg font-semibold transition"
            >
              ➕ Create Account
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Register;
