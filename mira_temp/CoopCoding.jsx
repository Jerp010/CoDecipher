// src/components/CoopCoding.jsx - Simplified for co-op only
import { useState, useEffect } from "react";
import { motion } from "framer-motion";

export default function CoopCoding({
  onBack,
  selectedCategory,
  playerId = 1,
  onSubmit
}) {
  const [timeLeft, setTimeLeft] = useState(300);

  // Player 1 fills different blanks than Player 2
  const [player1Code, setPlayer1Code] = useState({
    blank1: "", // i < 10
    blank3: "", // printf statement
  });

  const [player2Code, setPlayer2Code] = useState({
    blank2: "", // if
    blank4: "", // i % 2 == 0
  });

  const [currentPlayer, setCurrentPlayer] = useState(playerId);
  const [player1Progress, setPlayer1Progress] = useState(0);
  const [player2Progress, setPlayer2Progress] = useState(0);

  const expectedAnswers = {
    blank1: "i < 10",
    blank2: "if",
    blank3: 'printf("%d\\n", i);',
    blank4: "i % 2 == 0",
  };

  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      handleSubmit();
    }
  }, [timeLeft]);

  useEffect(() => {
    const p1Progress =
      (Object.keys(player1Code).filter((key) => player1Code[key]).length /
        Object.keys(player1Code).length) *
      100;
    const p2Progress =
      (Object.keys(player2Code).filter((key) => player2Code[key]).length /
        Object.keys(player2Code).length) *
      100;
    setPlayer1Progress(p1Progress);
    setPlayer2Progress(p2Progress);
  }, [player1Code, player2Code]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handlePlayer1Change = (field, value) => {
    setPlayer1Code({ ...player1Code, [field]: value });
  };

  const handlePlayer2Change = (field, value) => {
    setPlayer2Code({ ...player2Code, [field]: value });
  };

  const handleSubmit = () => {
    const mergedCode = {
      ...player1Code,
      ...player2Code,
    };
    
    const allCorrect = Object.keys(expectedAnswers).every(
      key => mergedCode[key] === expectedAnswers[key]
    );
    
    const totalProgress = player1Progress + player2Progress;
    const timeBonus = timeLeft * 10;
    const score = Math.round((totalProgress / 200) * 1000) + timeBonus;
    
    onSubmit(allCorrect, score, timeLeft, 0);
  };

  return (
    <div className="min-h-screen w-screen bg-gradient-to-br from-[#3e1257] via-[#5c1069] to-[#3e1257] overflow-hidden relative">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(40)].map((_, i) => (
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
              duration: 4 + Math.random() * 8,
              repeat: Infinity,
              delay: Math.random() * 4,
            }}
          />
        ))}
      </div>

      {/* Dotted Pattern */}
      <div className="absolute top-0 right-0 w-64 h-64 pointer-events-none opacity-20">
        <div className="grid grid-cols-8 gap-3 p-6">
          {[...Array(64)].map((_, i) => (
            <div key={i} className="w-2 h-2 rounded-full bg-purple-300"></div>
          ))}
        </div>
      </div>

      {/* Back Button */}
      <motion.button
        onClick={onBack}
        whileHover={{ scale: 1.1, rotate: -5 }}
        whileTap={{ scale: 0.95 }}
        className="fixed top-8 left-8 z-50 w-14 h-14 rounded-full bg-[#f4e04d] hover:bg-[#f4e04d]/80 transition-all duration-300 flex items-center justify-center shadow-lg hover:shadow-[0_0_30px_rgba(244,228,77,0.5)]"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-7 w-7 text-purple-900"
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

      {/* Timer */}
      <div className="fixed top-8 right-8 z-50">
        <motion.div
          className="px-8 py-3 bg-[#f4e04d] rounded-full shadow-lg"
          animate={{
            boxShadow:
              timeLeft < 60
                ? [
                    "0 0 20px rgba(244,228,77,0.5)",
                    "0 0 40px rgba(244,228,77,0.8)",
                    "0 0 20px rgba(244,228,77,0.5)",
                  ]
                : "0 0 20px rgba(244,228,77,0.3)",
          }}
          transition={{ duration: 1, repeat: Infinity }}
        >
          <div
            className={`text-3xl font-bold ${timeLeft < 60 ? "text-red-600" : "text-purple-900"}`}
            style={{ fontFamily: "Courier New, monospace" }}
          >
            {formatTime(timeLeft)}
          </div>
        </motion.div>
      </div>

      {/* Content */}
      <div className="flex flex-col items-center justify-start min-h-screen pt-28 pb-12 px-4">
        {/* Co-op Title */}
        <motion.h1
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="text-2xl md:text-3xl lg:text-4xl font-bold mb-6 text-[#f4e04d] text-center max-w-5xl px-4"
          style={{
            fontFamily: "Courier New, monospace",
            textShadow: "2px 2px 0px rgba(0,0,0,0.3)",
          }}
        >
          <motion.span
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="inline-block mr-2"
          >
            🤝
          </motion.span>
          Co-op Challenge: Work together to complete the code!
        </motion.h1>

        {/* Progress Bars */}
        <motion.div
          className="w-full max-w-4xl mb-8"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
        >
          <div className="mb-3">
            <div className="flex items-center gap-2 mb-1">
              <motion.div
                className="w-3 h-3 bg-green-400 rounded-full"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              />
              <span className="text-white font-bold text-sm">Player 1</span>
              <span className="text-green-400 text-sm ml-auto">
                {Math.round(player1Progress)}%
              </span>
            </div>
            <div className="h-2 bg-purple-900/50 rounded-full overflow-hidden backdrop-blur-sm">
              <motion.div
                className="h-full bg-gradient-to-r from-green-400 to-green-500"
                initial={{ width: 0 }}
                animate={{ width: `${player1Progress}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2 mb-1">
              <motion.div
                className="w-3 h-3 bg-blue-400 rounded-full"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              />
              <span className="text-white font-bold text-sm">Player 2</span>
              <span className="text-blue-400 text-sm ml-auto">
                {Math.round(player2Progress)}%
              </span>
            </div>
            <div className="h-2 bg-purple-900/50 rounded-full overflow-hidden backdrop-blur-sm">
              <motion.div
                className="h-full bg-gradient-to-r from-blue-400 to-blue-500"
                initial={{ width: 0 }}
                animate={{ width: `${player2Progress}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
          </div>
        </motion.div>

        {/* Side by Side Code Editors */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full max-w-7xl mb-8">
          {/* Player 1 Section */}
          <motion.div
            initial={{ x: -50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className={`bg-[#4a2269]/70 backdrop-blur-sm rounded-2xl p-6 shadow-2xl border-2 transition-all duration-300 ${
              currentPlayer === 1
                ? "border-green-400/50 shadow-[0_0_30px_rgba(74,222,128,0.3)]"
                : "border-white/10 blur-sm pointer-events-none select-none"
            }`}
          >
            <h2
              className="text-2xl font-bold text-white mb-4 flex items-center gap-3"
              style={{ fontFamily: "Courier New, monospace" }}
            >
              <div className="w-4 h-4 bg-green-400 rounded-full animate-pulse"></div>
              PLAYER 1
            </h2>
            <div className="bg-[#1a0a2e] rounded-xl p-5 font-mono text-sm md:text-base text-white overflow-x-auto">
              <pre className="whitespace-pre leading-relaxed">
                <code>
                  {`#include <stdio.h>
int main() {
  for (int i = 0; `}
                  <input
                    type="text"
                    value={player1Code.blank1}
                    onChange={(e) =>
                      handlePlayer1Change("blank1", e.target.value)
                    }
                    disabled={currentPlayer !== 1}
                    className="bg-white text-purple-900 px-3 py-1 w-20 rounded font-bold outline-none focus:ring-2 focus:ring-yellow-400 inline-block text-center"
                    placeholder="____"
                    maxLength={6}
                  />
                  {` i++) {
    if (i == 5) {
      break;
    }
    if (i % 2 == 0) {
      continue;
    }
    `}
                  <input
                    type="text"
                    value={player1Code.blank3}
                    onChange={(e) =>
                      handlePlayer1Change("blank3", e.target.value)
                    }
                    disabled={currentPlayer !== 1}
                    className="bg-white text-purple-900 px-3 py-1 w-32 rounded font-bold outline-none focus:ring-2 focus:ring-yellow-400 inline-block text-center"
                    placeholder="______"
                    maxLength={20}
                  />
                  {`
  }
  return 0;
}`}
                </code>
              </pre>
            </div>
          </motion.div>

          {/* Player 2 Section */}
          <motion.div
            initial={{ x: 50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className={`bg-[#4a2269]/70 backdrop-blur-sm rounded-2xl p-6 shadow-2xl border-2 transition-all duration-300 ${
              currentPlayer === 2
                ? "border-blue-400/50 shadow-[0_0_30px_rgba(96,165,250,0.3)]"
                : "border-white/10 blur-sm pointer-events-none select-none"
            }`}
          >
            <h2
              className="text-2xl font-bold text-white mb-4 flex items-center gap-3"
              style={{ fontFamily: "Courier New, monospace" }}
            >
              <div className="w-4 h-4 bg-blue-400 rounded-full animate-pulse"></div>
              PLAYER 2
            </h2>
            <div className="bg-[#1a0a2e] rounded-xl p-5 font-mono text-sm md:text-base text-white overflow-x-auto">
              <pre className="whitespace-pre leading-relaxed">
                <code>
                  {`#include <stdio.h>
int main() {
  for (int i = 0; i < 10; i++) {
    `}
                  <input
                    type="text"
                    value={player2Code.blank2}
                    onChange={(e) =>
                      handlePlayer2Change("blank2", e.target.value)
                    }
                    disabled={currentPlayer !== 2}
                    className="bg-white text-purple-900 px-3 py-1 w-16 rounded font-bold outline-none focus:ring-2 focus:ring-yellow-400 inline-block text-center"
                    placeholder="__"
                    maxLength={8}
                  />
                  {` (i == 5) {
      break;
    }
    if (`}
                  <input
                    type="text"
                    value={player2Code.blank4}
                    onChange={(e) =>
                      handlePlayer2Change("blank4", e.target.value)
                    }
                    disabled={currentPlayer !== 2}
                    className="bg-white text-purple-900 px-3 py-1 w-24 rounded font-bold outline-none focus:ring-2 focus:ring-yellow-400 inline-block text-center"
                    placeholder="____"
                    maxLength={12}
                  />
                  {`) {
      continue;
    }
    printf("%d\\n", i);
  }
  return 0;
}`}
                </code>
              </pre>
            </div>
          </motion.div>
        </div>

        {/* Testing Toggle */}
        <button
          onClick={() => setCurrentPlayer(currentPlayer === 1 ? 2 : 1)}
          className="mb-6 px-6 py-2 bg-yellow-500 text-purple-900 rounded-full font-bold text-sm hover:bg-yellow-400 transition-colors hover:shadow-lg"
        >
          Switch to {currentPlayer === 1 ? "Player 2" : "Player 1"} (Testing Only)
        </button>

        {/* Submit Button */}
        <motion.button
          onClick={handleSubmit}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="px-20 py-4 bg-white/20 backdrop-blur-sm text-white text-xl md:text-2xl font-bold rounded-full hover:bg-white/30 transition-all duration-300 shadow-xl border-2 border-white/30 uppercase tracking-wider hover:shadow-[0_0_30px_rgba(255,255,255,0.3)]"
          style={{ fontFamily: "Courier New, monospace" }}
        >
          🤝 SUBMIT TOGETHER
        </motion.button>
      </div>
    </div>
  );
}