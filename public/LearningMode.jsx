// src/components/LearningMode.jsx
import { motion } from 'framer-motion';

export default function LearningMode({ onSelectMode, onSelectMultiplayer, onViewLeaderboard }) {
  const modes = [
    {
      title: "SOLO",
      description: "Test your knowledge and skills on 3 different categories!",
      icon: "🎯",
      mask: "__ SOLO __",
      color: "from-purple-500 to-purple-700",
      isMultiplayer: false
    },
    {
      title: "CO-OP",
      description: "Code with a friend and combine your frontends and backends",
      icon: "🤝",
      mask: "P1__ + P2__",
      color: "from-blue-500 to-blue-700",
      isMultiplayer: true,
      mode: "coop"
    },
    {
      title: "BATTLE",
      description: "Challenge a foe to sharpen your thinking!",
      icon: "⚔️",
      mask: "__ VS __",
      color: "from-red-500 to-red-700",
      isMultiplayer: true,
      mode: "battle"
    }
  ];

  const handleModeClick = (mode) => {
    if (mode.isMultiplayer) {
      onSelectMultiplayer(mode.mode || mode.title.toLowerCase());
    } else {
      onSelectMode(mode.title.toLowerCase());
    }
  };

  return (
    <div className="min-h-screen w-screen bg-gradient-to-br from-[#3e1257] via-[#5c1069] to-[#3e1257] overflow-hidden relative">
      
      {/* Animated Particle Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(40)].map((_, i) => (
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

      {/* Masked Code Snippets Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-10">
        {['for(__)', 'if(__)', 'while(__)', 'int __', 'void __'].map((masked, i) => (
          <motion.div
            key={i}
            className="absolute text-[#f4e04d] font-mono text-2xl font-bold"
            initial={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              opacity: 0.2,
            }}
            animate={{
              y: [0, -30, 0],
              opacity: [0.1, 0.3, 0.1],
            }}
            transition={{
              duration: 8 + Math.random() * 4,
              repeat: Infinity,
              delay: i * 0.5,
            }}
          >
            {masked}
          </motion.div>
        ))}
      </div>

      <div className="flex items-center justify-center min-h-screen px-4 md:px-8 py-20">
        
        <div className="flex flex-col text-white max-w-4xl w-full">
          
          {/* Title */}
          <motion.div
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, type: "spring" }}
            className="mb-12 text-center"
          >
            <h1 
              className="text-4xl md:text-5xl lg:text-6xl font-bold text-[#f4e04d] mb-4"
              style={{ 
                fontFamily: 'Courier New, monospace',
                textShadow: '3px 3px 0px rgba(0,0,0,0.3)'
              }}
            >
              Select Learning Mode
            </h1>
            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="h-1 w-32 bg-[#f4e04d] mx-auto rounded-full"
            />
          </motion.div>

          {/* Mode Cards */}
          <div className="flex flex-col gap-6">
            
            {modes.map((mode, index) => (
              <motion.button 
                key={index}
                onClick={() => handleModeClick(mode)}
                initial={{ x: index % 2 === 0 ? -100 : 100, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ 
                  delay: 0.2 + index * 0.1,
                  type: "spring",
                  stiffness: 100
                }}
                whileHover={{ 
                  scale: 1.03,
                  x: 10,
                  transition: { duration: 0.2 }
                }}
                whileTap={{ scale: 0.98 }}
                className="group relative flex items-center gap-6 px-8 py-6 bg-[#4a2269]/70 backdrop-blur-sm border-2 border-white/20 rounded-2xl hover:border-[#f4e04d]/60 transition-all duration-300 text-left overflow-hidden"
              >
                {/* Gradient Background on Hover */}
                <motion.div
                  className={`absolute inset-0 bg-gradient-to-r ${mode.color} opacity-0 group-hover:opacity-20 transition-opacity duration-300`}
                />

                {/* Mask Pattern Background */}
                <div className="absolute inset-0 opacity-5 pointer-events-none">
                  <div className="grid grid-cols-8 grid-rows-4 gap-2 p-4 h-full">
                    {[...Array(32)].map((_, j) => (
                      <motion.div
                        key={j}
                        className="bg-white rounded"
                        animate={{ opacity: [0.3, 0, 0.3] }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          delay: j * 0.05,
                        }}
                      />
                    ))}
                  </div>
                </div>

                {/* Icon */}
                <motion.div 
                  className="text-6xl md:text-7xl flex-shrink-0 relative z-10"
                  whileHover={{ rotate: [0, -10, 10, -10, 0] }}
                  transition={{ duration: 0.5 }}
                >
                  {mode.icon}
                </motion.div>

                {/* Content */}
                <div className="flex-1 relative z-10">
                  <div className="flex items-center gap-4 mb-2">
                    <h2 
                      className="text-4xl md:text-5xl font-bold text-white"
                      style={{ fontFamily: 'Courier New, monospace' }}
                    >
                      {mode.title}
                    </h2>
                    
                    <motion.span 
                      className="px-3 py-1 bg-purple-900/50 rounded-lg text-xs font-mono text-purple-200 border border-purple-400/30"
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.5 + index * 0.1 }}
                    >
                      {mode.mask}
                    </motion.span>
                  </div>
                  
                  <p className="text-base md:text-lg text-purple-200 leading-relaxed">
                    {mode.description}
                  </p>
                </div>

                {/* Arrow */}
                <motion.div
                  className="text-[#f4e04d] text-3xl flex-shrink-0 relative z-10"
                  animate={{ x: [0, 5, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  →
                </motion.div>

                {/* Scan Line */}
                <motion.div
                  className="absolute inset-0 h-0.5 bg-gradient-to-r from-transparent via-[#f4e04d]/50 to-transparent"
                  initial={{ y: 0, opacity: 0 }}
                  animate={{ 
                    y: ['0%', '100%', '0%'],
                    opacity: [0, 1, 0]
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    delay: index * 0.5
                  }}
                />
              </motion.button>
            ))}

          </div>

          {/* Leaderboard Button */}
          <motion.button
            onClick={onViewLeaderboard}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="mt-8 px-8 py-3 bg-white/10 backdrop-blur-sm border-2 border-white/20 rounded-full text-white font-bold hover:bg-white/20 transition-all mx-auto"
            style={{ fontFamily: 'Courier New, monospace' }}
          >
            🏆 VIEW LEADERBOARD
          </motion.button>

          {/* Bottom Hint */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.6 }}
            transition={{ delay: 1 }}
            className="text-purple-400 text-sm text-center mt-8"
          >
            Click a mode to <span className="text-[#f4e04d] font-bold">unmask</span> challenges
          </motion.p>
        </div>
      </div>
    </div>
  );
}