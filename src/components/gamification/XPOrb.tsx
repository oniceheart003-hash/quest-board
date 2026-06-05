import { motion, AnimatePresence } from 'framer-motion'
import { Zap, Coins } from 'lucide-react'
import { useEffect, useState } from 'react'

interface XPOrbProps {
  xp: number
  gold: number
  critical?: boolean
  onComplete?: () => void
}

export function XPOrb({ xp, gold, critical, onComplete }: XPOrbProps) {
  const [show, setShow] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setShow(false)
      onComplete?.()
    }, 2000)
    return () => clearTimeout(timer)
  }, [onComplete])

  return (
    <AnimatePresence>
      {show && (
        <div className="fixed inset-0 z-50 pointer-events-none flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            {/* XP */}
            <motion.div
              initial={{ y: 20, opacity: 0, scale: 0.5 }}
              animate={{ y: -20, opacity: 1, scale: 1 }}
              exit={{ y: -60, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 200, damping: 15 }}
              className="flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-500/90 backdrop-blur-sm text-white font-bold text-lg shadow-lg"
            >
              <Zap size={20} className="text-yellow-300" />
              <span>+{xp} XP</span>
            </motion.div>

            {/* Gold */}
            <motion.div
              initial={{ y: 20, opacity: 0, scale: 0.5 }}
              animate={{ y: -20, opacity: 1, scale: 1 }}
              exit={{ y: -60, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.15 }}
              className="flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/90 backdrop-blur-sm text-white font-bold text-lg shadow-lg"
            >
              <Coins size={20} />
              <span>+{gold} G</span>
            </motion.div>

            {/* Critical hit */}
            {critical && (
              <motion.div
                initial={{ scale: 0, rotate: -10 }}
                animate={{ scale: 1, rotate: 0 }}
                exit={{ opacity: 0 }}
                transition={{ type: 'spring', stiffness: 300, damping: 10, delay: 0.3 }}
                className="px-6 py-2 rounded-full bg-gradient-to-r from-amber-400 to-red-500 text-white font-black text-xl shadow-xl"
              >
                💥 暴击!
              </motion.div>
            )}
          </div>
        </div>
      )}
    </AnimatePresence>
  )
}
