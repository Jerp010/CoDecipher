// src/components/ResultsScreen.jsx
import { motion } from "framer-motion";
import { useEffect, useState } from "react";

export default function ResultsScreen({
  correct = true,
  score = 850,
  timeLeft = 180,
  mistakes = 2,
  onNextChallenge,
  onRetry,
  onBackToMenu,
}) {
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    if (correct) {
      setShowConfetti(true);
      // Confetti particles
      const timer = setTimeout(() => setShowConfetti(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [correct]);

  const achievements = [];
  if (timeLeft > 240)
    achievements.push({
      icon: "⚡",
      text: "Speed Demon",
      desc: "Completed in under 60 seconds!",
    });
  if (mistakes === 0)
    achievements.push({
      icon: "🎯",
      text: "Perfect Code",
      desc: "No mistakes!",
    });
  if (score > 1000)
    achievements.push({
      icon: "🏆",
      text: "Code Master",
      desc: "Scored over 1000 points!",
    });

  return (
    <div className="min-h-screen w-screen bg-gradient-to-br from-[#3e1257] via-[#5c1069] to-[#3e1257] overflow-hidden relative flex items-center justify-center p-8">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(50)].map((_, i) => (
          <motion.div
            key={i}
            className={`absolute w-2 h-2 rounded-full ${correct ? "bg-yellow-400" : "bg-purple-400"}`}
            initial={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              opacity: 0,
            }}
            animate={{
              y: showConfetti ? [0, -window.innerHeight] : 0,
              opacity: showConfetti ? [0, 1, 1, 0] : 0,
              rotate: showConfetti ? [0, 360] : 0,
            }}
            transition={{
              duration: 2 + Math.random() * 2,
              delay: Math.random() * 0.5,
            }}
          />
        ))}
      </div>

      <div className="max-w-5xl w-full">
        {/* Score Display */}
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", duration: 0.8 }}
          className="text-center mb-12"
        >
          <motion.h1
            className={`text-7xl md:text-8xl font-bold mb-6 ${correct ? "text-[#f4e04d]" : "text-red-400"}`}
            style={{
              fontFamily: "Courier New, monospace",
              textShadow: "4px 4px 0px rgba(0,0,0,0.3)",
            }}
            animate={{
              scale: [1, 1.1, 1],
            }}
            transition={{
              duration: 1,
              repeat: 3,
            }}
          >
            {correct ? "🎉 SUCCESS!" : "❌ TRY AGAIN"}
          </motion.h1>

          {correct && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.3, type: "spring" }}
              className="inline-block"
            >
              <div className="bg-gradient-to-r from-yellow-400 to-yellow-600 text-purple-900 px-12 py-6 rounded-3xl shadow-2xl">
                <p className="text-2xl font-bold mb-2">SCORE</p>
                <motion.p
                  className="text-6xl font-bold"
                  style={{ fontFamily: "Courier New, monospace" }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                >
                  {score}
                </motion.p>
              </div>
            </motion.div>
          )}
        </motion.div>

        {/* Stats */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8"
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <div className="bg-[#4a2269]/70 backdrop-blur-sm rounded-xl p-6 text-center border-2 border-white/10">
            <p className="text-purple-300 text-sm mb-2">Time Remaining</p>
            <p
              className="text-3xl font-bold text-white"
              style={{ fontFamily: "Courier New, monospace" }}
            >
              {Math.floor(timeLeft / 60)}:
              {(timeLeft % 60).toString().padStart(2, "0")}
            </p>
          </div>
          <div className="bg-[#4a2269]/70 backdrop-blur-sm rounded-xl p-6 text-center border-2 border-white/10">
            <p className="text-purple-300 text-sm mb-2">Mistakes</p>
            <p
              className="text-3xl font-bold text-white"
              style={{ fontFamily: "Courier New, monospace" }}
            >
              {mistakes}
            </p>
          </div>
          <div className="bg-[#4a2269]/70 backdrop-blur-sm rounded-xl p-6 text-center border-2 border-white/10">
            <p className="text-purple-300 text-sm mb-2">Accuracy</p>
            <p
              className="text-3xl font-bold text-white"
              style={{ fontFamily: "Courier New, monospace" }}
            >
              {Math.max(0, 100 - mistakes * 10)}%
            </p>
          </div>
        </motion.div>

        {/* Achievements */}
        {achievements.length > 0 && (
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="mb-8"
          >
            <h3 className="text-2xl font-bold text-white mb-4 text-center">
              🏆 Achievements Unlocked!
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {achievements.map((achievement, index) => (
                <motion.div
                  key={index}
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ delay: 0.8 + index * 0.2, type: "spring" }}
                  className="bg-gradient-to-r from-yellow-400 to-yellow-600 p-4 rounded-xl text-center"
                >
                  <div className="text-4xl mb-2">{achievement.icon}</div>
                  <p className="font-bold text-purple-900 text-lg">
                    {achievement.text}
                  </p>
                  <p className="text-purple-800 text-sm">{achievement.desc}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Code Explanation */}
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="bg-[#4a2269]/70 backdrop-blur-sm rounded-2xl p-8 border-2 border-white/10 mb-8"
        >
          <h2 className="text-3xl font-bold text-[#f4e04d] mb-6 flex items-center gap-3">
            <span>📚</span>
            <span style={{ fontFamily: "Courier New, monospace" }}>
              What This Code Does:
            </span>
          </h2>
          <div className="bg-[#1a0a2e] rounded-xl p-6 text-white font-mono text-sm md:text-base overflow-x-auto">
            <pre className="leading-loose">
              {`for (int i = 0; i < 10; i++)  // Loop from 0 to 9
  if (i == 5)                  // When i reaches 5
    break;                     // Exit the loop early
  if (i % 2 == 0)             // If i is even (divisible by 2)
    continue;                  // Skip to next iteration
  printf("%d\\n", i);          // Print odd numbers: 1, 3`}
            </pre>
          </div>
          <div className="mt-6 text-purple-200 leading-relaxed">
            <p className="mb-3">
              <strong className="text-[#f4e04d]">Key Concepts:</strong>
            </p>
            <ul className="list-disc list-inside space-y-2 pl-4">
              <li>
                <strong>break</strong> - Exits the loop completely when i equals
                5
              </li>
              <li>
                <strong>continue</strong> - Skips the current iteration for even
                numbers
              </li>
              <li>
                <strong>Modulo operator (%)</strong> - Checks if a number is
                even or odd
              </li>
            </ul>
          </div>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 1 }}
          className="flex flex-col md:flex-row gap-4 justify-center"
        >
          {!correct && (
            <motion.button
              onClick={onRetry}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-12 py-4 bg-blue-500 text-white text-xl font-bold rounded-full hover:bg-blue-600 transition-all shadow-xl"
              style={{ fontFamily: "Courier New, monospace" }}
            >
              🔄 TRY AGAIN
            </motion.button>
          )}

          <motion.button
            onClick={onNextChallenge}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-12 py-4 bg-[#f4e04d] text-purple-900 text-xl font-bold rounded-full hover:bg-yellow-400 transition-all shadow-xl"
            style={{ fontFamily: "Courier New, monospace" }}
          >
            {correct ? "NEXT CHALLENGE →" : "SKIP →"}
          </motion.button>

          <motion.button
            onClick={onBackToMenu}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-12 py-4 bg-white/20 backdrop-blur-sm text-white text-xl font-bold rounded-full hover:bg-white/30 transition-all border-2 border-white/30"
            style={{ fontFamily: "Courier New, monospace" }}
          >
            ← MAIN MENU
          </motion.button>
        </motion.div>

        {/* Share Button */}
        {correct && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2 }}
            className="text-center mt-6"
          >
            <button
              onClick={() => {
                if (navigator.share) {
                  navigator.share({
                    title: "CoDecipher",
                    text: `I just scored ${score} on CoDecipher! Can you beat my score? 🚀`,
                    url: window.location.href,
                  });
                }
              }}
              className="text-purple-300 hover:text-white transition-colors text-sm underline"
            >
              📤 Share Your Score
            </button>
          </motion.div>
        )}
      </div>
    </div>
  );
}
