// src/components/MultiplayerSession.jsx
import { useState } from 'react';
import { motion } from 'framer-motion';

export default function MultiplayerSession({ onBack, selectedMode, onHost, onJoin }) {
  const [joinCode, setJoinCode] = useState('');

  const handleHost = () => {
    const code = 'CD' + Math.floor(100 + Math.random() * 900);
    onHost(code);
  };

  const handleJoin = () => {
    if (joinCode.trim().length >= 3) {
      onJoin(joinCode);
    }
  };

  // Mode-specific emojis and titles
  const modeConfig = {
    'CO-OP': { emoji: '🤝', title: 'Co-op Session' },
    'BATTLE': { emoji: '⚔️', title: 'Battle Session' }
  };

  const config = modeConfig[selectedMode] || { emoji: '🎮', title: 'Multiplayer Session' };

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

      {/* Floating Masked Code Snippets */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-10">
        {['____', '▓▓▓', '???', '___', '██'].map((masked, i) => (
          <motion.div
            key={i}
            className="absolute text-[#f4e04d] font-mono text-4xl font-bold"
            initial={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              opacity: 0.2,
            }}
            animate={{
              y: [0, -40, 0],
              opacity: [0.1, 0.3, 0.1],
              rotate: [0, 5, -5, 0],
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

      {/* Background Card - Mask Puzzle Pieces Theme */}
      <div 
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[85%] max-w-[1000px] h-[550px] rounded-[80px] shadow-2xl overflow-hidden"
        style={{ backgroundColor: '#390b53' }}
      >
        {/* Puzzle Piece Mask Pattern - Creates jigsaw effect */}
        <div className="absolute inset-0 opacity-8">
          <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            <defs>
              {/* Puzzle piece pattern */}
              <pattern id="puzzleMask" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
                {/* Top piece */}
                <path
                  d="M0,0 L20,0 L20,8 Q15,8 15,12 Q15,16 20,16 L20,20 L0,20 L0,16 Q5,16 5,12 Q5,8 0,8 Z"
                  fill="rgba(244, 228, 77, 0.05)"
                  stroke="rgba(244, 228, 77, 0.1)"
                  strokeWidth="0.3"
                />
              </pattern>
              
              {/* Mask cutout shapes */}
              <mask id="maskCutouts">
                <rect width="100" height="100" fill="white"/>
                {/* Random cutout rectangles for mask effect */}
                {[...Array(12)].map((_, i) => (
                  <rect
                    key={i}
                    x={Math.random() * 80}
                    y={Math.random() * 80}
                    width="8"
                    height="3"
                    fill="black"
                    opacity="0.7"
                  />
                ))}
              </mask>
            </defs>
            
            <rect width="100" height="100" fill="url(#puzzleMask)" mask="url(#maskCutouts)"/>
          </svg>
        </div>

        {/* Animated Mask Grid - Revealing blocks */}
        <div className="absolute inset-0 opacity-5">
          <div className="grid grid-cols-10 grid-rows-6 gap-3 p-6 h-full">
            {[...Array(60)].map((_, i) => (
              <motion.div
                key={i}
                className="rounded"
                style={{
                  background: i % 3 === 0 ? '#f4e04d' : i % 2 === 0 ? '#ad54e0' : 'rgba(255,255,255,0.3)'
                }}
                animate={{ 
                  opacity: [0, 0.6, 0],
                  scale: [0.8, 1, 0.8],
                  rotate: [0, 2, -2, 0]
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  delay: i * 0.04,
                }}
              />
            ))}
          </div>
        </div>

        {/* Horizontal mask bars scanning effect */}
        <motion.div
          className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#f4e04d]/40 to-transparent"
          animate={{ y: ['0%', '100%', '0%'] }}
          transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
        />

        {/* Vertical mask bars */}
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute top-0 bottom-0 w-0.5 bg-white/5"
            style={{ left: `${(i + 1) * 12}%` }}
            animate={{ opacity: [0.1, 0.3, 0.1] }}
            transition={{
              duration: 2,
              repeat: Infinity,
              delay: i * 0.2
            }}
          />
        ))}

        {/* Pulsing mask outline */}
        <motion.div
          className="absolute inset-8 rounded-[60px] border-2 border-[#f4e04d]/20"
          animate={{
            opacity: [0.2, 0.5, 0.2],
            scale: [0.98, 1, 0.98]
          }}
          transition={{ duration: 3, repeat: Infinity }}
        />
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
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
      </motion.button>

      {/* Content */}
      <div className="relative flex flex-col items-center justify-center min-h-screen text-white px-8 py-12 z-10">
        
        {/* Title with Mode-Specific Text */}
        <motion.div
          className="mb-12"
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
        >
          <h1 
            className="text-4xl md:text-5xl font-bold text-[#f4e04d] text-center mb-2"
            style={{ 
              fontFamily: 'Courier New, monospace',
              textShadow: '3px 3px 0px rgba(0,0,0,0.3)'
            }}
          >
            <motion.span
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="inline-block mr-3"
            >
              {config.emoji}
            </motion.span>
            {config.title}
          </h1>
          
          <motion.div
            className="text-center text-sm font-mono text-purple-300"
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            ___CONNECTING___
          </motion.div>
        </motion.div>

        <div className="flex flex-col gap-8 w-full max-w-xl">
          
          {/* Host Section */}
          <motion.div 
            className="relative border-2 border-white/40 rounded-3xl p-8 flex flex-col items-center overflow-hidden backdrop-blur-sm bg-purple-900/20"
            initial={{ x: -50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            whileHover={{ borderColor: 'rgba(255,255,255,0.6)' }}
          >
            {/* Mask slice pattern background */}
            <div className="absolute inset-0 opacity-5 pointer-events-none">
              <div className="grid grid-cols-6 grid-rows-4 gap-2 p-4 h-full">
                {[...Array(24)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="rounded"
                    style={{
                      background: i % 2 === 0 ? '#f4e04d' : 'white',
                      clipPath: i % 3 === 0 
                        ? 'polygon(0 0, 100% 0, 80% 100%, 0% 100%)' 
                        : i % 3 === 1
                        ? 'polygon(20% 0, 100% 0, 100% 100%, 0% 100%)'
                        : 'polygon(0 0, 100% 0, 100% 100%, 20% 100%)'
                    }}
                    animate={{ opacity: [0.5, 0, 0.5] }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      delay: i * 0.08,
                    }}
                  />
                ))}
              </div>
            </div>

            <h2 
              className="text-3xl md:text-4xl font-bold mb-6 relative z-10"
              style={{ fontFamily: 'Courier New, monospace' }}
            >
              <motion.span
                animate={{ opacity: [1, 0.3, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                👑
              </motion.span>
              {' '}Host a session
            </h2>

            <motion.button 
              onClick={handleHost}
              whileHover={{ scale: 1.05, rotate: 1 }}
              whileTap={{ scale: 0.95 }}
              style={{ backgroundColor: '#ad54e0' }}
              className="relative px-16 py-4 text-white text-2xl font-bold rounded-full transition-all duration-300 shadow-lg uppercase tracking-wider overflow-hidden group"
            >
              {/* Mask reveal bars animation */}
              <div className="absolute inset-0 flex">
                {[...Array(5)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="flex-1 bg-purple-900"
                    initial={{ scaleY: 1 }}
                    whileHover={{ scaleY: [1, 0, 1] }}
                    transition={{ duration: 0.6, delay: i * 0.05 }}
                  />
                ))}
              </div>
              
              <span className="relative z-10 flex items-center gap-2">
                <motion.span
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  🎮
                </motion.span>
                CREATE
              </span>
            </motion.button>

            <motion.p 
              className="mt-3 text-xs text-purple-200 font-mono"
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.6 }}
              transition={{ delay: 0.5 }}
            >
              CODE____ GENERATED
            </motion.p>
          </motion.div>

          {/* Join Section */}
          <motion.div 
            className="relative border-2 border-white/40 rounded-3xl p-8 flex flex-col items-center overflow-hidden backdrop-blur-sm bg-purple-900/20"
            initial={{ x: 50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            whileHover={{ borderColor: 'rgba(255,255,255,0.6)' }}
          >
            {/* Mask cutout pattern */}
            <div className="absolute inset-0 opacity-5 pointer-events-none">
              <div className="grid grid-cols-6 grid-rows-4 gap-2 p-4 h-full">
                {[...Array(24)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="bg-white rounded"
                    style={{
                      clipPath: `polygon(
                        ${Math.random() * 20}% 0%, 
                        ${80 + Math.random() * 20}% 0%, 
                        ${80 + Math.random() * 20}% 100%, 
                        ${Math.random() * 20}% 100%
                      )`
                    }}
                    animate={{ opacity: [0.5, 0, 0.5] }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      delay: 0.5 + i * 0.08,
                    }}
                  />
                ))}
              </div>
            </div>

            <h2 
              className="text-3xl md:text-4xl font-bold mb-6 relative z-10"
              style={{ fontFamily: 'Courier New, monospace' }}
            >
              <motion.span
                animate={{ opacity: [1, 0.3, 1] }}
                transition={{ duration: 1.5, repeat: Infinity, delay: 0.5 }}
              >
                🔓
              </motion.span>
              {' '}Enter code to join
            </h2>

            <div className="flex gap-3 relative z-10">
              <div className="relative">
                <input 
                  type="text"
                  value={joinCode}
                  onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                  onKeyPress={(e) => e.key === 'Enter' && handleJoin()}
                  maxLength={6}
                  placeholder="CD___"
                  style={{ backgroundColor: '#ad54e0' }}
                  className="w-48 px-8 py-4 text-white text-2xl font-bold rounded-full text-center placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-[#f4e04d] uppercase font-mono"
                />
                
                {/* Masked placeholder animation */}
                {!joinCode && (
                  <motion.div
                    className="absolute inset-0 flex items-center justify-center gap-1 pointer-events-none"
                    animate={{ opacity: [0.3, 0.6, 0.3] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    {['C', 'D', '_', '_', '_'].map((char, i) => (
                      <motion.span 
                        key={i} 
                        className="text-white/40 text-xl font-mono"
                        animate={{ 
                          opacity: char === '_' ? [0.2, 0.5, 0.2] : 0.4 
                        }}
                        transition={{ 
                          duration: 1, 
                          repeat: Infinity, 
                          delay: i * 0.1 
                        }}
                      >
                        {char}
                      </motion.span>
                    ))}
                  </motion.div>
                )}
              </div>

              <motion.button
                onClick={handleJoin}
                whileHover={{ scale: 1.05, x: 3 }}
                whileTap={{ scale: 0.95 }}
                style={{ backgroundColor: '#ad54e0' }}
                className="px-8 py-4 text-white text-2xl font-bold rounded-full hover:brightness-110 transition-all duration-300 shadow-lg"
              >
                →
              </motion.button>
            </div>

            <motion.p 
              className="mt-3 text-xs text-purple-200 font-mono"
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.6 }}
              transition={{ delay: 0.7 }}
            >
              UNMASK__SESSION
            </motion.p>
          </motion.div>

        </div>

        {/* Bottom status */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.5 }}
          transition={{ delay: 1 }}
          className="text-purple-300 text-sm mt-8 font-mono"
        >
          <motion.span
            className="text-[#f4e04d]"
            animate={{ opacity: [1, 0.3, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            [WAITING]
          </motion.span>
          {' '}FOR CONNECTION...
        </motion.p>
      </div>
    </div>
  );
}