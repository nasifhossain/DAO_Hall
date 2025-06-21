import { useEffect, useState } from "react";
import { getContract } from "../utils/getContract";

const Proposals = () => {
  const [proposals, setProposals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [txStatus, setTxStatus] = useState("");
  const [showPast, setShowPast] = useState(false);

  const now = Math.floor(Date.now() / 1000);

  useEffect(() => {
    const fetchProposals = async () => {
      try {
        const contract = await getContract();
        const data = await contract.getAllProposals();
        setProposals(data);
      } catch (err) {
        console.error(err);
        setError("⚠️ Failed to load proposals. Check connection or wallet.");
      } finally {
        setLoading(false);
      }
    };

    fetchProposals();
  }, []);

  const vote = async (id, support) => {
    try {
      setTxStatus("📝 Sending vote...");
      const contract = await getContract();
      const tx = await contract.vote(id, support);
      await tx.wait();
      setTxStatus("✅ Vote submitted!");
    } catch (err) {
      console.error(err);
      setTxStatus("❌ Vote failed. Are you allowed to vote?");
    }

    setTimeout(() => window.location.reload(), 2000);
  };

  const filteredProposals = proposals.filter((p) => {
    const deadline = Number(p.deadline);
    return showPast ? deadline <= now : deadline > now;
  });

  return (
    <div className="min-h-screen bg-gray-900 text-white py-12 px-6">
      <h1 className="text-3xl font-bold mb-6 text-center">
        🗳️ {showPast ? "Past Proposals" : "Active Proposals"}
      </h1>

      <div className="flex justify-center mb-6">
        <button
          onClick={() => setShowPast(!showPast)}
          className="bg-purple-700 hover:bg-purple-800 text-white px-4 py-2 rounded-lg"
        >
          {showPast ? "🔄 View Active Proposals" : "📜 View Past Proposals"}
        </button>
      </div>

      {error && <p className="text-center text-red-400 mb-4">{error}</p>}
      {txStatus && <p className="text-center text-yellow-400 mb-4">{txStatus}</p>}

      {loading ? (
        <p className="text-center text-gray-400">Loading proposals...</p>
      ) : filteredProposals.length === 0 ? (
        <p className="text-center text-gray-400">
          {showPast ? "No past proposals." : "No active proposals."}
        </p>
      ) : (
        <div className="grid gap-6 max-w-4xl mx-auto">
          {filteredProposals.map((p) => {
            const deadline = Number(p.deadline);
            const yesVotes = Number(p.yesVotes);
            const noVotes = Number(p.noVotes);

            return (
              <div
                key={Number(p.id)}
                className="bg-gray-800 p-6 rounded-xl shadow-lg border border-purple-700"
              >
                <h2 className="text-xl font-semibold mb-2">{p.title}</h2>
                <p className="text-sm text-gray-400 mb-4">
                  ⏱️{" "}
                  {deadline > now
                    ? `Voting ends in ${Math.floor((deadline - now) / 60)} min`
                    : "Voting closed"}
                </p>

                <div className="flex justify-between text-sm mb-4">
                  <span className="text-green-400">👍 Yes: {yesVotes}</span>
                  <span className="text-red-400">👎 No: {noVotes}</span>
                </div>

                {deadline > now ? (
                  <div className="flex gap-4">
                    <button
                      onClick={() => vote(Number(p.id), true)}
                      className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg"
                    >
                      Vote Yes
                    </button>
                    <button
                      onClick={() => vote(Number(p.id), false)}
                      className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg"
                    >
                      Vote No
                    </button>
                  </div>
                ) : (
                  <p className="text-sm text-yellow-400">🛑 Voting ended</p>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Proposals;
