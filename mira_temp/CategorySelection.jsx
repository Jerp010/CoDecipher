// src/components/CategorySelection.jsx
import { motion } from 'framer-motion';

export default function CategorySelection({ onBack, selectedMode, onSelectCategory }) {
  const categories = [
    { name: "PYTHON", mask: "PY____" },
    { name: "HTML", mask: "HT__/P__" },
    { name: "C++", mask: "C__" },
    { name: "OOP", mask: "Class extends" },
    { name: "C#", mask: "C_" },
    { name: "JAVASCRIPT", mask: "JS________" }
  ];

  return (
    <div className="min-h-screen w-screen bg-gradient-to-br from-[#3e1257] via-[#5c1069] to-[#3e1257] overflow-hidden relative">
      
      {/* Animated Particle Background */}
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

      {/* Masked Code Snippets Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-10">
        {['____', '??', '▓▓▓', '___', '██'].map((masked, i) => (
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

      {/* Large Background Card with Mask Pattern */}
      <div 
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[85%] max-w-[1000px] h-[550px] rounded-[80px] shadow-2xl overflow-hidden"
        style={{ backgroundColor: '#390b53' }}
      >
        {/* Mask Grid Pattern Overlay */}
        <div className="absolute inset-0 opacity-5">
          <div className="grid grid-cols-12 grid-rows-8 gap-3 p-8 h-full">
            {[...Array(96)].map((_, i) => (
              <motion.div
                key={i}
                className="bg-white rounded"
                animate={{ opacity: [0.5, 0, 0.5] }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  delay: i * 0.03,
                }}
              />
            ))}
          </div>
        </div>

        {/* Scanning Lines Effect */}
        <motion.div
          className="absolute inset-0 h-1 bg-gradient-to-r from-transparent via-[#f4e04d]/30 to-transparent"
          animate={{ y: ['0%', '100%'] }}
          transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
        />
      </div>

      {/* Back Button with Mask Icon */}
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

      {/* Content Container */}
      <div className="relative flex flex-col items-center justify-center min-h-screen text-white px-8 py-12 z-10">
        
        {/* Selected Mode Title with Reveal Effect */}
        <motion.h1 
          className="text-6xl md:text-7xl font-bold mb-4 tracking-wide relative"
          style={{ fontFamily: 'Courier New, monospace' }}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <span className="relative inline-block">
            {selectedMode || "SOLO"}
            {/* Mask reveal bars */}
            <div className="absolute inset-0 flex gap-1 overflow-hidden pointer-events-none">
              {[...Array(10)].map((_, i) => (
                <motion.div
                  key={i}
                  className="flex-1 bg-purple-900/80"
                  initial={{ scaleY: 1 }}
                  animate={{ scaleY: [1, 0, 1] }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    delay: i * 0.1,
                  }}
                />
              ))}
            </div>
          </span>
        </motion.h1>

        {/* Mask indicator */}
        <motion.div
          className="mb-10 px-4 py-2 bg-purple-900/50 rounded-lg border border-purple-400/30"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <span className="text-sm font-mono text-purple-200">MODE__{selectedMode?.__LENGTH || 4}__CHARS</span>
        </motion.div>

        {/* Question Text with Mask Effect */}
        <motion.h2 
          className="text-3xl md:text-4xl font-bold mb-12 tracking-wide relative"
          style={{ 
            fontFamily: 'Courier New, monospace',
            color: '#f4e04d',
            textShadow: '2px 2px 0px rgba(0,0,0,0.3)'
          }}
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <motion.span
            animate={{ opacity: [1, 0.5, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            🎭
          </motion.span>
          {' '}What would you like to <span className="text-white">unmask</span>?
        </motion.h2>

        {/* Category Buttons Grid with Mask Reveal */}
        <div className="grid grid-cols-3 gap-5 max-w-3xl">
          
          {categories.map((category, index) => (
            <motion.button 
              key={index}
              onClick={() => onSelectCategory(category.name)}
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ 
                delay: 0.4 + index * 0.08,
                type: "spring",
                stiffness: 200
              }}
              whileHover={{ scale: 1.08, y: -5 }}
              whileTap={{ scale: 0.95 }}
              style={{ backgroundColor: '#ad54e0' }}
              className="group relative px-10 py-5 text-white text-xl md:text-2xl font-bold rounded-3xl transition-all duration-300 shadow-lg uppercase overflow-hidden"
            >
              {/* Mask Pattern Background */}
              <div className="absolute inset-0 opacity-20 pointer-events-none">
                <div className="grid grid-cols-4 grid-rows-3 gap-1 p-2 h-full">
                  {[...Array(12)].map((_, i) => (
                    <motion.div
                      key={i}
                      className="bg-white rounded"
                      animate={{ opacity: [0.5, 0, 0.5] }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        delay: i * 0.1,
                      }}
                    />
                  ))}
                </div>
              </div>

              {/* Horizontal scan line */}
              <motion.div
                className="absolute inset-0 h-0.5 bg-white/50"
                initial={{ y: '-100%' }}
                whileHover={{ y: '100%' }}
                transition={{ duration: 0.4 }}
              />

              {/* Category name (revealed) */}
              <div className="relative z-10">
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6 + index * 0.08 }}
                >
                  {category.name}
                </motion.div>
                
                {/* Masked version underneath */}
                <motion.div 
                  className="text-xs opacity-40 mt-1 font-mono"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 0.4 }}
                  transition={{ delay: 0.8 + index * 0.08 }}
                >
                  {category.mask}
                </motion.div>
              </div>

              {/* Glow effect on hover */}
              <motion.div
                className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20 transition-opacity duration-300 rounded-3xl"
              />
            </motion.button>
          ))}

        </div>

        {/* Bottom hint */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.6 }}
          transition={{ delay: 1.2 }}
          className="text-purple-300 text-sm mt-8"
        >
          Select a language to <span className="text-[#f4e04d] font-bold">reveal</span> the challenges
        </motion.p>
      </div>
    </div>
  );
}