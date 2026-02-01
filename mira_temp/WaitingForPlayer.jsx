// src/components/WaitingForPlayer.jsx
import { motion } from 'framer-motion';

export default function WaitingForPlayer({ onBack, sessionCode }) {
  return (
    <div className="min-h-screen w-screen bg-gradient-to-br from-[#3e1257] via-[#5c1069] to-[#3e1257] overflow-hidden relative">
      
      {/* Animated Particles */}
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

      {/* Background Card with Scanning Effect */}
      <div 
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[85%] max-w-[1000px] h-[550px] rounded-[80px] shadow-2xl overflow-hidden"
        style={{ backgroundColor: '#390b53' }}
      >
        {/* Animated Mask Reveal Grid */}
        <div className="absolute inset-0 opacity-10">
          <div className="grid grid-cols-12 grid-rows-8 gap-2 p-6 h-full">
            {[...Array(96)].map((_, i) => (
              <motion.div
                key={i}
                className="bg-[#f4e04d] rounded"
                animate={{ 
                  opacity: [0, 0.8, 0],
                  scale: [0.8, 1, 0.8]
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  delay: i * 0.03,
                }}
              />
            ))}
          </div>
        </div>

        {/* Radar sweep effect */}
        <motion.div
          className="absolute left-1/2 top-1/2 w-full h-1 bg-gradient-to-r from-transparent via-[#f4e04d]/50 to-transparent origin-left"
          style={{ transformOrigin: 'left center' }}
          animate={{ rotate: [0, 360] }}
          transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
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
        
        {/* Scanning indicator */}
        <motion.div
          className="mb-8 text-[#f4e04d] text-6xl"
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        >
          🎭
        </motion.div>

        {/* Host Section with Code Reveal */}
        <motion.div 
          className="border-2 border-white/40 rounded-3xl p-10 flex flex-col items-center mb-12 max-w-xl w-full backdrop-blur-sm bg-purple-900/20 relative overflow-hidden"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          {/* Mask pattern */}
          <div className="absolute inset-0 opacity-5 pointer-events-none">
            <div className="grid grid-cols-8 grid-rows-5 gap-2 p-4 h-full">
              {[...Array(40)].map((_, i) => (
                <motion.div
                  key={i}
                  className="bg-white rounded"
                  animate={{ opacity: [0.3, 0, 0.3] }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    delay: i * 0.05,
                  }}
                />
              ))}
            </div>
          </div>

          <h2 
            className="text-3xl md:text-4xl font-bold mb-6 relative z-10"
            style={{ fontFamily: 'Courier New, monospace' }}
          >
            👑 Host a session
          </h2>

          {/* Code display with mask reveal */}
          <div className="relative">
            <motion.div 
              style={{ backgroundColor: '#ad54e0' }}
              className="px-16 py-4 text-white text-2xl font-bold rounded-full shadow-lg uppercase tracking-wider relative overflow-hidden"
            >
              {/* Code reveal animation */}
              <motion.div
                className="absolute inset-0 bg-purple-900"
                animate={{ x: ['-100%', '100%'] }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              />
              
              <span className="relative z-10 font-mono">
                {sessionCode?.split('').map((char, i) => (
                  <motion.span
                    key={i}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.1 }}
                  >
                    {char}
                  </motion.span>
                )) || 'CD123'}
              </span>
            </motion.div>

            {/* Glowing border effect */}
            <motion.div
              className="absolute inset-0 rounded-full border-2 border-[#f4e04d]"
              animate={{
                opacity: [0, 0.5, 0],
                scale: [1, 1.1, 1],
              }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          </div>

          <motion.p 
            className="mt-4 text-xs text-purple-200 font-mono"
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            CODE_VISIBLE__SHARE_NOW
          </motion.p>
        </motion.div>

        {/* Waiting Text with Typing Effect */}
        <motion.div className="text-center">
          <motion.h3 
            className="text-2xl md:text-3xl font-bold mb-4"
            style={{ fontFamily: 'Courier New, monospace' }}
          >
            <motion.span
              animate={{ opacity: [0, 1, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              █
            </motion.span>
            {' '}Waiting for player 2 to join
            <motion.span
              animate={{ opacity: [1, 0, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
            >
              ...
            </motion.span>
          </motion.h3>

          {/* Scanning bars */}
          <div className="flex justify-center gap-2">
            {[...Array(5)].map((_, i) => (
              <motion.div
                key={i}
                className="w-2 bg-[#f4e04d] rounded-full"
                animate={{ height: ['20px', '40px', '20px'] }}
                transition={{
                  duration: 1,
                  repeat: Infinity,
                  delay: i * 0.1,
                }}
              />
            ))}
          </div>

          <motion.p
            className="mt-6 text-purple-300 text-sm font-mono"
            animate={{ opacity: [0.4, 0.8, 0.4] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            [SCANNING__FOR__CONNECTIONS]
          </motion.p>
        </motion.div>
      </div>
    </div>
  );
}