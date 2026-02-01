// src/components/Hero.jsx
import { motion } from 'framer-motion';
import { useState } from 'react';

export default function Hero({ onStart }) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div className="min-h-screen w-screen bg-gradient-to-br from-[#3e1257] via-[#5c1069] to-[#3e1257]
  overflow-x-hidden overflow-y-visible relative flex items-start justify-center pt-24">
      
      {/* Animated Particle Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(60)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-purple-300/30 rounded-full"
            initial={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [-20, -100],
              x: [0, Math.random() * 50 - 25],
              opacity: [0, 1, 0],
            }}
            transition={{
              duration: 5 + Math.random() * 15,
              repeat: Infinity,
              delay: Math.random() * 5,
            }}
          />
        ))}
      </div>

      {/* Masked Code Snippets Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20">
        {['for(;;)', 'if(___)', 'while(__)', 'int __', 'void __', 'return _'].map((masked, i) => (
          <motion.div
            key={i}
            className="absolute text-[#f4e04d] font-mono text-3xl font-bold"
            initial={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              opacity: 0.3,
            }}
            animate={{
              y: [0, -50, 0],
              opacity: [0.2, 0.5, 0.2],
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

      {/* Main Content */}
      <div className="relative z-10 text-center px-4 max-w-6xl">
        
        {/* Logo with Mask Reveal Animation */}
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", duration: 1, bounce: 0.5 }}
          className="mb-8 flex justify-center overflow-visible"
        >
          <div className="relative">
            {/* Main Logo - Puzzle Mask */}
            <motion.div
              animate={{
                boxShadow: [
                  '0 0 20px rgba(244,228,77,0.3)',
                  '0 0 60px rgba(244,228,77,0.6)',
                  '0 0 20px rgba(244,228,77,0.3)',
                ],
              }}
              transition={{ duration: 2, repeat: Infinity }}
              className="w-40 h-40 bg-gradient-to-br from-[#f4e04d] to-[#e6d435] rounded-3xl flex items-center justify-center transform rotate-12 relative overflow-hidden"
            >
              {/* Mask Cutout Pattern */}
              <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 gap-1 p-3">
                {[...Array(9)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="bg-purple-900/40 rounded"
                    initial={{ scale: 0 }}
                    animate={{ scale: [0, 1, 0] }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      delay: i * 0.15,
                    }}
                  />
                ))}
              </div>
              
              {/* Center Icon */}
              <div className="relative z-10">
                <motion.div
                  animate={{ rotate: [0, 5, -5, 0] }}
                  transition={{ duration: 4, repeat: Infinity }}
                  className="text-6xl"
                >
                  <svg viewBox="0 0 100 100" className="w-20 h-20">
                    <path
                      d="M20,30 L10,50 L20,70"
                      stroke="#3e1257"
                      strokeWidth="6"
                      fill="none"
                      strokeLinecap="round"
                    />
                    <path
                      d="M80,30 L90,50 L80,70"
                      stroke="#3e1257"
                      strokeWidth="6"
                      fill="none"
                      strokeLinecap="round"
                    />
                    <motion.circle
                      cx="50"
                      cy="50"
                      r="15"
                      fill="#3e1257"
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    />
                    <text
                      x="50"
                      y="58"
                      textAnchor="middle"
                      fill="#f4e04d"
                      fontSize="24"
                      fontWeight="bold"
                      fontFamily="Courier New"
                    >
                      ?
                    </text>
                  </svg>
                </motion.div>
              </div>
            </motion.div>
            
            {/* Orbiting Masked Code Blocks */}
            {[
              { code: '__', angle: 0, color: 'bg-purple-400' },
              { code: '??', angle: 120, color: 'bg-pink-400' },
              { code: '▓▓', angle: 240, color: 'bg-blue-400' }
            ].map((item, i) => (
              <motion.div
                key={i}
                className="absolute top-1/2 left-1/2"
                animate={{
                  rotate: item.angle + 360,
                }}
                transition={{
                  duration: 6,
                  repeat: Infinity,
                  ease: "linear",
                }}
                style={{
                  transformOrigin: '0 0',
                  x: '-50%',
                  y: '-50%',
                }}
              >
                <div 
                  className={`${item.color} rounded-lg shadow-lg flex items-center justify-center text-white font-bold font-mono text-sm`}
                  style={{ 
                    transform: 'translate(100px, 0)',
                    width: '40px',
                    height: '40px'
                  }}
                >
                  {item.code}
                </div>
              </motion.div>
            ))}

            {/* Pulsing Rings */}
            {[1, 2, 3].map((ring) => (
              <motion.div
                key={ring}
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 border-2 border-[#f4e04d]/30 rounded-full"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ 
                  scale: 1.5 + ring * 0.3, 
                  opacity: [0, 0.5, 0]
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  delay: ring * 0.4,
                }}
                style={{ width: '160px', height: '160px' }}
              />
            ))}
          </div>
        </motion.div>

        {/* Title */}
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3, type: "spring" }}
          className="mb-6"
        >
          <h1
            className="text-7xl md:text-8xl lg:text-9xl font-bold text-[#f4e04d] relative inline-block"
            style={{ 
              fontFamily: 'Courier New, monospace',
              textShadow: '5px 5px 0px rgba(0,0,0,0.4)'
            }}
          >
            <motion.span className="relative inline-block">
              Co
              <motion.span
                className="inline-block relative"
                animate={{
                  opacity: [0.3, 1, 0.3],
                }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                De
                <span className="absolute inset-0 flex items-center justify-center overflow-hidden">
                  <motion.div
                    className="absolute h-full w-1 bg-purple-900"
                    animate={{ x: [-20, 20] }}
                    transition={{ duration: 1, repeat: Infinity, repeatType: "reverse" }}
                  />
                  <motion.div
                    className="absolute h-full w-1 bg-purple-900"
                    animate={{ x: [20, -20] }}
                    transition={{ duration: 1, repeat: Infinity, repeatType: "reverse" }}
                  />
                </span>
              </motion.span>
              cipher
            </motion.span>
          </h1>

          {/* Animated Mask Letters */}
          <motion.div 
            className="mt-4 flex justify-center gap-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
          >
            {['C', 'o', 'D', 'e', 'c', 'i', 'p', 'h', 'e', 'r'].map((letter, i) => (
              <motion.div
                key={i}
                className="w-8 h-8 bg-purple-600/30 backdrop-blur-sm rounded flex items-center justify-center text-purple-300 text-sm font-mono font-bold border border-purple-400/30"
                animate={{
                  backgroundColor: i % 2 === 0 ? 'rgba(139, 92, 246, 0.3)' : 'rgba(139, 92, 246, 0.1)',
                  borderColor: i % 2 === 0 ? 'rgba(139, 92, 246, 0.5)' : 'rgba(139, 92, 246, 0.2)',
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  repeatType: "reverse",
                  delay: i * 0.1,
                }}
              >
                {i % 3 === 0 ? '_' : letter}
              </motion.div>
            ))}
          </motion.div>
        </motion.div>

        {/* Tagline */}
        <motion.p
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-2xl md:text-3xl text-purple-200 mb-4 font-semibold"
          style={{ fontFamily: 'Courier New, monospace' }}
        >
          <span className="text-[#f4e04d]">Unmask</span> the Code, <span className="text-[#f4e04d]">Reveal</span> Your Skills
        </motion.p>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="text-lg text-purple-300 mb-12 max-w-2xl mx-auto"
        >
          Fill in the <span className="text-[#f4e04d] font-bold">masked blanks</span>, decipher the patterns,
          and master programming through interactive challenges
        </motion.p>

        {/* Start Button */}
        <motion.button
          onClick={onStart}
          onHoverStart={() => setIsHovered(true)}
          onHoverEnd={() => setIsHovered(false)}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.9, type: "spring", stiffness: 200 }}
          whileHover={{ scale: 1.1, rotate: 2 }}
          whileTap={{ scale: 0.95 }}
          className="group relative px-16 py-6 bg-[#f4e04d] text-purple-900 text-3xl font-bold rounded-full shadow-2xl hover:shadow-[0_0_60px_rgba(244,228,77,0.8)] transition-all duration-300 overflow-hidden"
          style={{ fontFamily: 'Courier New, monospace' }}
        >
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-yellow-300 via-yellow-500 to-yellow-300"
            initial={{ x: '-100%' }}
            animate={{ x: isHovered ? '100%' : '-100%' }}
            transition={{ duration: 0.6 }}
          />
          
          <div className="absolute inset-0 flex flex-col justify-around opacity-20">
            {[...Array(5)].map((_, i) => (
              <motion.div
                key={i}
                className="h-0.5 bg-purple-900"
                animate={{ scaleX: [1, 0.5, 1] }}
                transition={{ duration: 2, repeat: Infinity, delay: i * 0.2 }}
              />
            ))}
          </div>
          
          <span className="relative z-10 flex items-center gap-3">
            <motion.span
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >

            </motion.span>
            UNMASK & START
            <motion.span
              animate={{ x: isHovered ? 5 : 0 }}
              transition={{ duration: 0.2 }}
            >
              →
            </motion.span>
          </span>
        </motion.button>

        {/* Feature Highlights */}
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 1.1 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16"
        >
          {[
            { 
              icon: '🎯', 
              title: 'Fill the Blanks', 
              desc: 'Unmask hidden code segments',
              mask: '__ __ __'
            },
            { 
              icon: '🤝', 
              title: 'Co-op Decipher', 
              desc: 'Team up to reveal the code',
              mask: 'P1__ P2__'
            },
            { 
              icon: '🏆', 
              title: 'Unmask Glory', 
              desc: 'Compete on leaderboards',
              mask: '#1 ___'
            },
          ].map((feature, i) => (
            <motion.div
              key={i}
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 1.3 + i * 0.1, type: "spring" }}
              whileHover={{ scale: 1.05, y: -5 }}
              className="bg-[#4a2269]/70 backdrop-blur-sm border-2 border-white/10 rounded-2xl p-6 hover:border-[#f4e04d]/50 transition-all relative overflow-hidden"
            >
              <div className="absolute inset-0 opacity-5">
                <div className="grid grid-cols-4 grid-rows-4 gap-2 p-4 h-full">
                  {[...Array(16)].map((_, j) => (
                    <motion.div
                      key={j}
                      className="bg-white rounded"
                      animate={{ opacity: [0.5, 0, 0.5] }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        delay: j * 0.1,
                      }}
                    />
                  ))}
                </div>
              </div>

              <div className="relative z-10">
                <div className="text-5xl mb-3">{feature.icon}</div>
                <h3 className="text-xl font-bold text-white mb-2" style={{ fontFamily: 'Courier New, monospace' }}>
                  {feature.title}
                </h3>
                <p className="text-purple-300 text-sm mb-3">{feature.desc}</p>
                
                <div className="mt-4 px-3 py-2 bg-purple-900/50 rounded-lg font-mono text-xs text-purple-200 text-center">
                  {feature.mask}
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Keyboard Hint */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.6 }}
          transition={{ delay: 2 }}
          className="text-purple-400 text-sm mt-8"
        >
          Press <kbd className="px-3 py-1 bg-purple-800/50 rounded font-mono">Enter</kbd> to unmask the challenges
        </motion.p>
      </div>

      {/* Version Badge */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.5 }}
        transition={{ delay: 2.5 }}
        className="absolute bottom-8 left-8 text-purple-400 text-sm font-mono"
      >
        v1.0.0 <span className="text-[#f4e04d]">masked</span>
      </motion.div>
    </div>
  );
}