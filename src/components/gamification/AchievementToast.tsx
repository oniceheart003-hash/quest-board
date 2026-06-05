import { motion, AnimatePresence } from 'framer-motion'
import { Trophy } from 'lucide-react'
import { useEffect, useState } from 'react'

interface AchievementToastProps {
  name: string
  icon?: string
  onComplete?: () => void
}

export function AchievementToast({ name, onComplete }: AchievementToastProps) {
  const [show, setShow] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setShow(false)
      onComplete?.()
    }, 3000)
    return () => clearTimeout(timer)
  }, [onComplete])

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ x: -300, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: -300, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 200, damping: 20 }}
          className="fixed top-20 left-4 right-4 z-50 max-w-sm mx-auto"
        >
          <div className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-xl shadow-purple-500/30">
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
              <Trophy size={20} className="text-yellow-300" />
            </div>
            <div>
              <p className="text-[10px] text-white/70 uppercase tracking-wider font-medium">
                成就解锁!
              </p>
              <p className="text-sm font-bold">{name}</p>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
