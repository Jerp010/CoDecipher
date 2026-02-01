// src/components/AchievementPopup.jsx
import { motion, AnimatePresence } from "framer-motion";

export default function AchievementPopup({ achievement, onClose }) {
  if (!achievement) return null;

  const achievementData = {
    "speed-demon": {
      icon: "⚡",
      title: "Speed Demon",
      description: "Completed in under 2 minutes!",
      color: "from-yellow-400 to-orange-500",
    },
    "perfect-code": {
      icon: "🎯",
      title: "Perfect Code",
      description: "No mistakes!",
      color: "from-green-400 to-emerald-500",
    },
    "first-steps": {
      icon: "🌟",
      title: "First Steps",
      description: "Completed your first challenge!",
      color: "from-blue-400 to-indigo-500",
    },
    "team-player": {
      icon: "🤝",
      title: "Team Player",
      description: "Completed a co-op challenge!",
      color: "from-purple-400 to-pink-500",
    },
    "on-fire": {
      icon: "🔥",
      title: "On Fire",
      description: "5 challenges in a row!",
      color: "from-red-400 to-orange-500",
    },
    "code-master": {
      icon: "👑",
      title: "Code Master",
      description: "Scored over 1000 points!",
      color: "from-yellow-500 to-amber-600",
    },
  };

  const data = achievementData[achievement] || achievementData["first-steps"];

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[999] flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0, rotate: -180, opacity: 0 }}
          animate={{ scale: 1, rotate: 0, opacity: 1 }}
          exit={{ scale: 0, rotate: 180, opacity: 0 }}
          transition={{ type: "spring", duration: 0.7, bounce: 0.5 }}
          className="relative"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Glow effect */}
          <div
            className={`absolute inset-0 bg-gradient-to-r ${data.color} blur-3xl opacity-50 animate-pulse`}
          />

          {/* Main card */}
          <div
            className={`relative bg-gradient-to-r ${data.color} p-1 rounded-3xl shadow-2xl`}
          >
            <div className="bg-[#1a0a2e] rounded-3xl p-8 md:p-12">
              {/* Top badge */}
              <motion.div
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="text-center mb-6"
              >
                <div className="inline-block px-6 py-2 bg-white/10 rounded-full backdrop-blur-sm">
                  <p className="text-white font-bold text-sm tracking-wider">
                    🏆 ACHIEVEMENT UNLOCKED
                  </p>
                </div>
              </motion.div>

              {/* Icon */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.4, type: "spring", bounce: 0.6 }}
                className="text-center mb-6"
              >
                <div className="inline-flex items-center justify-center w-32 h-32 bg-white/10 rounded-full backdrop-blur-sm">
                  <span className="text-8xl">{data.icon}</span>
                </div>
              </motion.div>

              {/* Title */}
              <motion.h2
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="text-5xl md:text-6xl font-bold text-white text-center mb-4"
                style={{ fontFamily: "Courier New, monospace" }}
              >
                {data.title}
              </motion.h2>

              {/* Description */}
              <motion.p
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="text-xl text-purple-200 text-center mb-8"
              >
                {data.description}
              </motion.p>

              {/* Sparkles */}
              <div className="absolute inset-0 pointer-events-none">
                {[...Array(20)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute w-2 h-2 bg-yellow-300 rounded-full"
                    initial={{
                      left: "50%",
                      top: "50%",
                      scale: 0,
                    }}
                    animate={{
                      left: `${Math.random() * 100}%`,
                      top: `${Math.random() * 100}%`,
                      scale: [0, 1, 0],
                      opacity: [0, 1, 0],
                    }}
                    transition={{
                      duration: 1 + Math.random(),
                      delay: 0.7 + Math.random() * 0.5,
                    }}
                  />
                ))}
              </div>

              {/* Continue button */}
              <motion.button
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.7, type: "spring" }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onClose}
                className={`w-full py-4 bg-gradient-to-r ${data.color} text-white text-xl font-bold rounded-full shadow-xl hover:shadow-2xl transition-all`}
                style={{ fontFamily: "Courier New, monospace" }}
              >
                AWESOME! 🎉
              </motion.button>

              {/* Click outside hint */}
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.6 }}
                transition={{ delay: 1 }}
                className="text-purple-400 text-sm text-center mt-4"
              >
                Click anywhere to continue
              </motion.p>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

// Example usage:
/*
import { useState } from 'react';
import AchievementPopup from './components/AchievementPopup';

function MyComponent() {
  const [achievement, setAchievement] = useState(null);
  
  // Trigger achievement
  const unlockAchievement = () => {
    setAchievement('speed-demon');
  };
  
  return (
    <>
      <button onClick={unlockAchievement}>Unlock Achievement</button>
      {achievement && (
        <AchievementPopup 
          achievement={achievement}
          onClose={() => setAchievement(null)}
        />
      )}
    </>
  );
}
*/
