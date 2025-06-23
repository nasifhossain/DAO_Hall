import { useState } from "react";
import { getContract } from "../utils/getContract";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "../components/Navbar";

const CreateProposal = () => {
  const [title, setTitle] = useState("");
  const [duration, setDuration] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState({ type: "", message: "" });

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title.trim() || !duration || Number(duration) <= 0) {
      setStatus({ type: "error", message: "⚠️ Please provide valid title and duration." });
      return;
    }

    try {
      setLoading(true);
      setStatus({ type: "", message: "" });

      const contract = await getContract();
      const tx = await contract.createProposal(title.trim(), Number(duration));
      await tx.wait();

      setStatus({ type: "success", message: "✅ Proposal created successfully!" });
      setTitle("");
      setDuration("");
    } catch (err) {
      console.error(err);
      setStatus({
        type: "error",
        message: "❌ Failed to create proposal. Are you the contract owner?",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-950 via-black to-gray-900 text-white">
      <Navbar />
      <div className="relative px-4 py-12">
        {/* Watermark */}
        <div className="absolute text-[12rem] opacity-5 text-purple-700 -top-10 left-0 select-none pointer-events-none">
          🗳️
        </div>

        <div className="max-w-6xl mx-auto z-10 relative">
          <div className="mb-12 text-center">
            <h1 className="text-4xl md:text-5xl font-extrabold text-purple-400 mb-4">Create a New Proposal</h1>
            <p className="text-gray-300 max-w-3xl mx-auto">
              Suggest initiatives that matter to your hall community. Once submitted, your proposal will be visible to all users for voting based on the duration you set.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-10 items-start">
            {/* Form */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gray-800 rounded-2xl p-8 shadow-xl border border-purple-700"
            >
              <h2 className="text-2xl font-bold mb-6 text-center text-purple-300">📝 Proposal Form</h2>

              <AnimatePresence>
                {status.message && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className={`text-center text-sm px-4 py-2 rounded-md mb-4 ${
                      status.type === "success"
                        ? "bg-green-500/10 text-green-400 border border-green-600"
                        : "bg-red-500/10 text-red-400 border border-red-600"
                    }`}
                  >
                    {status.message}
                  </motion.div>
                )}
              </AnimatePresence>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block mb-1 text-sm text-purple-200">Proposal Title</label>
                  <input
                    type="text"
                    className="w-full px-4 py-2 rounded-md bg-gray-700 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Add water cooler on 3rd floor"
                    required
                  />
                </div>

                <div>
                  <label className="block mb-1 text-sm text-purple-200">Voting Duration (minutes)</label>
                  <input
                    type="number"
                    min="1"
                    className="w-full px-4 py-2 rounded-md bg-gray-700 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    placeholder="e.g. 45"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className={`w-full py-2 rounded-lg font-semibold transition ${
                    loading ? "bg-gray-600" : "bg-purple-600 hover:bg-purple-700"
                  }`}
                >
                  {loading ? "⏳ Submitting..." : "➕ Submit Proposal"}
                </button>
              </form>
            </motion.div>

            {/* Info Section */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-gray-800 rounded-2xl p-8 border border-purple-700 shadow-xl"
            >
              <h3 className="text-xl font-bold text-purple-300 mb-4">💡 What Makes a Good Proposal?</h3>
              <ul className="list-disc pl-6 space-y-2 text-gray-300 text-sm">
                <li>Be clear and concise in your title.</li>
                <li>Target a real need or improvement for your hall.</li>
                <li>Set a reasonable voting window (typically 15–60 minutes).</li>
                <li>Avoid duplicates — check existing proposals first.</li>
              </ul>

              <div className="mt-8">
                <h4 className="text-lg font-semibold text-purple-400 mb-2">🛡️ Powered by DAOmocracy</h4>
                <p className="text-gray-400 text-sm">
                  Your proposal will be recorded on-chain to ensure transparency and integrity of the voting process.
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateProposal;
