import { motion, AnimatePresence } from 'framer-motion'
import { useEffect, useState, useCallback } from 'react'
import confetti from 'canvas-confetti'
import { Crown, Sparkles } from 'lucide-react'

interface LevelUpModalProps {
  open: boolean
  newLevel: number
  newTitle: string
  onClose: () => void
}

export function LevelUpModal({ open, newLevel, newTitle, onClose }: LevelUpModalProps) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (open) {
      setVisible(true)
      // Fire confetti!
      const duration = 3000
      const end = Date.now() + duration
      const colors = ['#6366f1', '#8b5cf6', '#f59e0b', '#22c55e', '#ec4899']

      const frame = () => {
        confetti({
          particleCount: 3,
          angle: 60,
          spread: 55,
          origin: { x: 0, y: 0.7 },
          colors,
        })
        confetti({
          particleCount: 3,
          angle: 120,
          spread: 55,
          origin: { x: 1, y: 0.7 },
          colors,
        })
        if (Date.now() < end) requestAnimationFrame(frame)
      }
      frame()
    }
  }, [open])

  const handleClose = useCallback(() => {
    setVisible(false)
    setTimeout(onClose, 300)
  }, [onClose])

  return (
    <AnimatePresence>
      {visible && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/70 backdrop-blur-md"
            onClick={handleClose}
          />
          <motion.div
            initial={{ scale: 0.5, opacity: 0, y: 50 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.5, opacity: 0, y: 50 }}
            transition={{ type: 'spring', stiffness: 200, damping: 20 }}
            className="relative bg-gradient-to-b from-slate-800 to-slate-900 border border-slate-700 rounded-3xl p-8 text-center max-w-xs w-full mx-4 shadow-2xl"
          >
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 1, repeat: Infinity }}
              className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-amber-400 to-orange-600 flex items-center justify-center shadow-lg shadow-orange-500/30"
            >
              <Crown size={40} className="text-white" />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <div className="flex items-center justify-center gap-2 mb-2">
                <Sparkles size={18} className="text-amber-400" />
                <span className="text-amber-400 font-bold text-sm">LEVEL UP!</span>
                <Sparkles size={18} className="text-amber-400" />
              </div>
              <h2 className="text-3xl font-black text-white mb-1">Lv.{newLevel}</h2>
              <p className="text-lg text-indigo-400 font-semibold mb-6">{newTitle}</p>

              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={handleClose}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-bold text-lg shadow-lg shadow-indigo-500/25"
              >
                继续冒险
              </motion.button>
            </motion.div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
