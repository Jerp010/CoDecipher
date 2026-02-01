// src/components/Leaderboard.jsx
import { motion } from "framer-motion";
import { useState } from "react";

export default function Leaderboard({ onBack, currentPlayerScore = null }) {
  // Mock leaderboard data - replace with real data from backend
  const [leaderboardData] = useState([
    { name: "CodeNinja", score: 1250, accuracy: 98, time: "2:15", rank: 1 },
    { name: "ByteMaster", score: 1180, accuracy: 95, time: "2:30", rank: 2 },
    { name: "PixelWizard", score: 1050, accuracy: 92, time: "3:00", rank: 3 },
    { name: "AlgoKing", score: 980, accuracy: 90, time: "3:15", rank: 4 },
    { name: "DevQueen", score: 920, accuracy: 88, time: "3:45", rank: 5 },
    { name: "LogicLord", score: 850, accuracy: 85, time: "4:00", rank: 6 },
    { name: "SyntaxSage", score: 780, accuracy: 82, time: "4:20", rank: 7 },
    { name: "BugBuster", score: 720, accuracy: 80, time: "4:35", rank: 8 },
    { name: "LoopLegend", score: 650, accuracy: 78, time: "4:50", rank: 9 },
    { name: "ArrayAce", score: 580, accuracy: 75, time: "5:00", rank: 10 },
  ]);

  const [selectedTab, setSelectedTab] = useState("all-time"); // 'all-time', 'today', 'weekly'

  const getMedalEmoji = (rank) => {
    if (rank === 1) return "🥇";
    if (rank === 2) return "🥈";
    if (rank === 3) return "🥉";
    return `#${rank}`;
  };

  const getRowStyle = (rank) => {
    if (rank <= 3)
      return "bg-gradient-to-r from-yellow-500/20 to-yellow-600/20 border-yellow-400/30";
    return "bg-[#4a2269]/50 border-white/10";
  };

  return (
    <div className="min-h-screen w-screen bg-gradient-to-br from-[#3e1257] via-[#5c1069] to-[#3e1257] overflow-hidden relative">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(30)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-purple-300/20 rounded-full"
            initial={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [-20, -100],
              opacity: [0, 1, 0],
            }}
            transition={{
              duration: 5 + Math.random() * 10,
              repeat: Infinity,
              delay: Math.random() * 5,
            }}
          />
        ))}
      </div>

      {/* Back Button */}
      <motion.button
        onClick={onBack}
        whileHover={{ scale: 1.1, rotate: -5 }}
        whileTap={{ scale: 0.95 }}
        className="fixed top-8 left-8 z-50 w-16 h-16 rounded-full bg-[#f4e04d] hover:bg-[#f4e04d]/80 transition-all duration-300 flex items-center justify-center shadow-lg hover:shadow-[0_0_30px_rgba(244,228,77,0.5)]"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-8 w-8 text-purple-900"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={3}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M15 19l-7-7 7-7"
          />
        </svg>
      </motion.button>

      {/* Content */}
      <div className="min-h-screen flex flex-col items-center justify-start pt-24 pb-12 px-4">
        {/* Title */}
        <motion.div
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="text-center mb-8"
        >
          <h1
            className="text-6xl md:text-7xl font-bold text-[#f4e04d] mb-4"
            style={{
              fontFamily: "Courier New, monospace",
              textShadow: "4px 4px 0px rgba(0,0,0,0.3)",
            }}
          >
            🏆 LEADERBOARD
          </h1>
          <p className="text-purple-200 text-lg">
            Top performers across all challenges
          </p>
        </motion.div>

        {/* Tab Selector */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="flex gap-4 mb-8"
        >
          {["all-time", "today", "weekly"].map((tab) => (
            <button
              key={tab}
              onClick={() => setSelectedTab(tab)}
              className={`px-8 py-3 rounded-full font-bold transition-all ${
                selectedTab === tab
                  ? "bg-[#f4e04d] text-purple-900 shadow-lg scale-105"
                  : "bg-white/10 text-white hover:bg-white/20"
              }`}
              style={{ fontFamily: "Courier New, monospace" }}
            >
              {tab
                .split("-")
                .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                .join(" ")}
            </button>
          ))}
        </motion.div>

        {/* Leaderboard Container */}
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="w-full max-w-4xl"
        >
          <div className="bg-[#4a2269]/70 backdrop-blur-sm rounded-2xl p-6 md:p-8 border-2 border-white/10 shadow-2xl">
            {/* Table Header */}
            <div className="grid grid-cols-12 gap-4 mb-4 pb-4 border-b border-white/20 text-purple-200 text-sm font-bold">
              <div className="col-span-1 text-center">RANK</div>
              <div className="col-span-4">PLAYER</div>
              <div className="col-span-3 text-center">SCORE</div>
              <div className="col-span-2 text-center">ACC</div>
              <div className="col-span-2 text-center">TIME</div>
            </div>

            {/* Leaderboard Rows */}
            <div className="space-y-3">
              {leaderboardData.map((player, index) => (
                <motion.div
                  key={index}
                  initial={{ x: -50, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.4 + index * 0.1 }}
                  whileHover={{ scale: 1.02, x: 5 }}
                  className={`grid grid-cols-12 gap-4 p-4 rounded-xl border-2 transition-all ${getRowStyle(player.rank)}`}
                >
                  {/* Rank */}
                  <div className="col-span-1 flex items-center justify-center">
                    <span className="text-2xl font-bold">
                      {getMedalEmoji(player.rank)}
                    </span>
                  </div>

                  {/* Player Name */}
                  <div className="col-span-4 flex items-center">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center text-white font-bold">
                        {player.name.charAt(0)}
                      </div>
                      <span className="text-white font-bold text-lg">
                        {player.name}
                      </span>
                    </div>
                  </div>

                  {/* Score */}
                  <div className="col-span-3 flex items-center justify-center">
                    <span
                      className="text-[#f4e04d] font-bold text-2xl"
                      style={{ fontFamily: "Courier New, monospace" }}
                    >
                      {player.score}
                    </span>
                  </div>

                  {/* Accuracy */}
                  <div className="col-span-2 flex items-center justify-center">
                    <span className="text-green-400 font-bold">
                      {player.accuracy}%
                    </span>
                  </div>

                  {/* Time */}
                  <div className="col-span-2 flex items-center justify-center">
                    <span className="text-purple-200 font-mono text-sm">
                      {player.time}
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Current Player Position (if applicable) */}
            {currentPlayerScore && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 1.5 }}
                className="mt-6 p-4 bg-blue-500/20 border-2 border-blue-400 rounded-xl"
              >
                <p className="text-white text-center font-bold">
                  Your Current Rank:{" "}
                  <span className="text-[#f4e04d] text-xl">
                    #{currentPlayerScore.rank}
                  </span>{" "}
                  with{" "}
                  <span className="text-[#f4e04d] text-xl">
                    {currentPlayerScore.score}
                  </span>{" "}
                  points
                </p>
              </motion.div>
            )}
          </div>
        </motion.div>

        {/* Stats Cards */}
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-4xl mt-8"
        >
          <div className="bg-[#4a2269]/70 backdrop-blur-sm rounded-xl p-6 text-center border-2 border-white/10">
            <div className="text-4xl mb-2">🎯</div>
            <p className="text-purple-300 text-sm mb-2">Total Players</p>
            <p
              className="text-3xl font-bold text-white"
              style={{ fontFamily: "Courier New, monospace" }}
            >
              2,547
            </p>
          </div>
          <div className="bg-[#4a2269]/70 backdrop-blur-sm rounded-xl p-6 text-center border-2 border-white/10">
            <div className="text-4xl mb-2">⚡</div>
            <p className="text-purple-300 text-sm mb-2">Challenges Completed</p>
            <p
              className="text-3xl font-bold text-white"
              style={{ fontFamily: "Courier New, monospace" }}
            >
              15,892
            </p>
          </div>
          <div className="bg-[#4a2269]/70 backdrop-blur-sm rounded-xl p-6 text-center border-2 border-white/10">
            <div className="text-4xl mb-2">👥</div>
            <p className="text-purple-300 text-sm mb-2">Active Now</p>
            <p
              className="text-3xl font-bold text-white"
              style={{ fontFamily: "Courier New, monospace" }}
            >
              342
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
