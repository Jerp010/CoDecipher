// src/components/SoloCoding.jsx
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function SoloCoding({ onBack, selectedCategory, onSubmit }) {
  const [timeLeft, setTimeLeft] = useState(300);
  const [code, setCode] = useState({
    blank1: "",
    blank2: "",
  });
  const [hintsLeft, setHintsLeft] = useState(3);
  const [showHint, setShowHint] = useState(false);
  const [mistakes, setMistakes] = useState(0);

  // Expected answers for validation
  const expectedAnswers = {
    blank1: "i < 10",
    blank2: "if",
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
    const handleKeyPress = (e) => {
      if (e.ctrlKey && e.key === "Enter") {
        handleSubmit();
      }
      if (e.key === "Escape") {
        onBack();
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [code]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const validateInput = (field, value) => {
    if (!value) return "neutral";
    if (value === expectedAnswers[field]) return "correct";
    if (expectedAnswers[field].startsWith(value)) return "partial";
    return "incorrect";
  };

  const handleCodeChange = (field, value) => {
    const oldValue = code[field];
    setCode({ ...code, [field]: value });

    const validation = validateInput(field, value);
    if (validation === "incorrect" && value.length > oldValue.length) {
      setMistakes((m) => m + 1);
    }
  };

  const handleUseHint = () => {
    if (hintsLeft > 0) {
      setShowHint(true);
      setHintsLeft((h) => h - 1);
      setTimeout(() => setShowHint(false), 8000);
    }
  };

  const handleSubmit = () => {
    const allCorrect = Object.keys(expectedAnswers).every(
      (key) => code[key] === expectedAnswers[key],
    );

    const score = calculateScore(timeLeft, mistakes);

    // Call the onSubmit prop to navigate to results
    onSubmit(allCorrect, score, timeLeft, mistakes);
  };

  const calculateScore = (timeLeft, mistakes) => {
    const timeBonus = timeLeft * 10;
    const accuracyBonus = Math.max(0, 300 - mistakes * 50);
    return timeBonus + accuracyBonus;
  };

  const blank1Status = validateInput("blank1", code.blank1);
  const blank2Status = validateInput("blank2", code.blank2);

  return (
    <div className="min-h-screen w-screen bg-gradient-to-br from-[#3e1257] via-[#5c1069] to-[#3e1257] overflow-hidden relative">
      {/* Animated Particle Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(30)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-purple-300/30 rounded-full"
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

      {/* Dotted Pattern Overlay */}
      <div className="absolute top-0 right-0 w-96 h-96 pointer-events-none opacity-10">
        <div className="grid grid-cols-10 gap-4 p-6">
          {[...Array(100)].map((_, i) => (
            <motion.div
              key={i}
              className="w-2 h-2 rounded-full bg-purple-300"
              initial={{ scale: 0 }}
              animate={{ scale: [0, 1, 0] }}
              transition={{
                duration: 3,
                repeat: Infinity,
                delay: i * 0.02,
              }}
            />
          ))}
        </div>
      </div>

      {/* Back Button */}
      <motion.button
        onClick={onBack}
        whileHover={{ scale: 1.1, rotate: -5 }}
        whileTap={{ scale: 0.95 }}
        className="fixed top-6 left-6 z-50 w-16 h-16 rounded-full bg-[#f4e04d] hover:bg-[#f4e04d]/90 transition-all duration-300 flex items-center justify-center shadow-[0_0_30px_rgba(244,228,77,0.3)] hover:shadow-[0_0_40px_rgba(244,228,77,0.6)]"
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

      {/* Timer with Pulse Animation */}
      <div className="fixed top-6 right-6 z-50">
        <motion.div
          className="px-8 py-3 bg-[#f4e04d] rounded-full shadow-lg relative overflow-hidden"
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
            className={`text-3xl font-bold ${timeLeft < 60 ? "text-red-600" : "text-purple-900"} transition-colors`}
            style={{ fontFamily: "Courier New, monospace" }}
          >
            {formatTime(timeLeft)}
          </div>
        </motion.div>
      </div>

      {/* Progress Indicator */}
      <motion.div
        className="fixed top-24 right-6 z-40 flex flex-col gap-2"
        initial={{ x: 100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        <div className="bg-purple-900/50 backdrop-blur-sm rounded-lg px-4 py-2">
          <p className="text-white text-sm font-bold">Hints: {hintsLeft}/3</p>
        </div>
        <div className="bg-purple-900/50 backdrop-blur-sm rounded-lg px-4 py-2">
          <p className="text-white text-sm font-bold">Mistakes: {mistakes}</p>
        </div>
      </motion.div>

      {/* Hint Popup */}
      <AnimatePresence>
        {showHint && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.9 }}
            className="fixed top-40 left-1/2 -translate-x-1/2 z-50 max-w-md"
          >
            <div className="bg-gradient-to-r from-yellow-400 to-yellow-600 p-6 rounded-2xl shadow-2xl border-2 border-yellow-300">
              <div className="flex items-start gap-3">
                <div className="text-4xl">💡</div>
                <div>
                  <p className="font-bold text-purple-900 text-lg mb-2">
                    Hint:
                  </p>
                  <p className="text-purple-800 text-sm leading-relaxed">
                    For the loop condition, think about when the loop should
                    stop. You want to go from 0 to 10, so use a comparison
                    operator!
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Scrollable Content */}
      <div className="h-screen overflow-y-auto pt-28 pb-12 px-8">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 max-w-7xl mx-auto">
          {/* Left Column - Prompt */}
          <motion.div
            className="lg:col-span-2 flex items-start lg:items-center"
            initial={{ x: -50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <h1
              className="text-3xl md:text-4xl lg:text-5xl font-bold text-[#f4e04d] leading-tight relative"
              style={{
                fontFamily: "Courier New, monospace",
                textShadow:
                  "3px 3px 0px rgba(0,0,0,0.4), 0 0 30px rgba(244,228,77,0.3)",
              }}
            >
              <motion.span
                animate={{ opacity: [1, 0.5, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="inline-block"
              >
                ⚡
              </motion.span>{" "}
              Fill in the missing parts to print odd numbers from 0 to 10
            </h1>
          </motion.div>

          {/* Right Column - Code */}
          <motion.div
            className="lg:col-span-3"
            initial={{ x: 50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div className="bg-[#4a2269]/70 backdrop-blur-sm rounded-2xl p-6 shadow-2xl border-2 border-white/10 hover:border-white/20 transition-all duration-300">
              <div className="bg-[#1a0a2e] rounded-xl p-5 font-mono text-sm md:text-base text-white overflow-x-auto mb-6 max-h-[600px] overflow-y-auto">
                <pre className="whitespace-pre leading-relaxed">
                  <code>
                    {`#include <stdio.h>
int main() {
  for (int i = 0; `}
                    <motion.input
                      type="text"
                      value={code.blank1}
                      onChange={(e) =>
                        handleCodeChange("blank1", e.target.value)
                      }
                      animate={{
                        backgroundColor:
                          blank1Status === "correct"
                            ? "#d1fae5"
                            : blank1Status === "incorrect"
                              ? "#fee2e2"
                              : blank1Status === "partial"
                                ? "#fef3c7"
                                : "#e5e7eb",
                        scale: blank1Status === "correct" ? [1, 1.05, 1] : 1,
                      }}
                      transition={{ duration: 0.2 }}
                      className={`text-purple-900 px-3 py-1 w-24 rounded font-bold outline-none focus:ring-2 inline-block text-center
    ${blank1Status === "correct" && "ring-2 ring-green-400"}
    ${blank1Status === "incorrect" && "ring-2 ring-red-400"}
    ${blank1Status === "partial" && "ring-2 ring-yellow-400"}
    ${!code.blank1 && "ring-2 ring-purple-300"}
  `}
                      placeholder="____"
                      maxLength={6}
                    />
                    {` i++) {
    if (i == 5) {
      break;
    }
    `}
                    <motion.input
                      type="text"
                      value={code.blank2}
                      onChange={(e) =>
                        handleCodeChange("blank2", e.target.value)
                      }
                      animate={{
                        backgroundColor:
                          blank2Status === "correct"
                            ? "#d1fae5"
                            : blank2Status === "incorrect"
                              ? "#fee2e2"
                              : blank2Status === "partial"
                                ? "#fef3c7"
                                : "#e5e7eb",
                        scale: blank2Status === "correct" ? [1, 1.05, 1] : 1,
                      }}
                      transition={{ duration: 0.2 }}
                      className={`text-purple-900 px-3 py-1 w-24 rounded font-bold outline-none focus:ring-2 inline-block text-center
    ${blank2Status === "correct" && "ring-2 ring-green-400"}
    ${blank2Status === "incorrect" && "ring-2 ring-red-400"}
    ${blank2Status === "partial" && "ring-2 ring-yellow-400"}
    ${!code.blank2 && "ring-2 ring-purple-300"}
  `}
                      placeholder="____"
                      maxLength={8}
                    />
                    {` (i % 2 == 0) {
      continue;
    }
    printf("%d\\n", i);
  }
  return 0;
}`}
                  </code>
                </pre>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-between items-center">
                {/* Hint Button */}
                <motion.button
                  onClick={handleUseHint}
                  disabled={hintsLeft === 0}
                  whileHover={{ scale: hintsLeft > 0 ? 1.05 : 1 }}
                  whileTap={{ scale: hintsLeft > 0 ? 0.95 : 1 }}
                  className={`px-6 py-3 rounded-full font-bold shadow-lg transition-all ${
                    hintsLeft > 0
                      ? "bg-yellow-500 text-purple-900 hover:bg-yellow-400 hover:shadow-[0_0_20px_rgba(234,179,8,0.5)] cursor-pointer"
                      : "bg-gray-500 text-gray-300 cursor-not-allowed opacity-50"
                  }`}
                >
                  💡 Hint ({hintsLeft})
                </motion.button>

                {/* Submit Button */}
                <motion.button
                  onClick={handleSubmit}
                  whileHover={{ scale: 1.05, rotate: 1 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-12 py-3 bg-white/20 backdrop-blur-sm text-white text-xl font-bold rounded-full hover:bg-white/30 transition-all duration-300 shadow-lg border-2 border-white/30 uppercase tracking-wider hover:shadow-[0_0_30px_rgba(255,255,255,0.3)]"
                  style={{ fontFamily: "Courier New, monospace" }}
                >
                  SUBMIT
                </motion.button>
              </div>

              {/* Keyboard Shortcut Hint */}
              <motion.p
                className="text-purple-200 text-xs text-center mt-4 opacity-60"
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.6 }}
                transition={{ delay: 1 }}
              >
                Press{" "}
                <kbd className="px-2 py-1 bg-purple-800 rounded">
                  Ctrl + Enter
                </kbd>{" "}
                to submit
              </motion.p>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
