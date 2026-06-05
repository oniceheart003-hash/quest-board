// XP required to reach a given level (cumulative)
export function xpForLevel(level: number): number {
  let total = 0
  for (let i = 1; i <= level; i++) {
    total += Math.floor(100 * Math.pow(i, 1.5))
  }
  return total
}

// Calculate current level from total XP
export function calculateLevel(totalXp: number): number {
  let level = 1
  while (xpForLevel(level + 1) <= totalXp) {
    level++
  }
  return level
}

// XP progress toward next level
export function xpProgress(totalXp: number): {
  currentLevel: number
  currentLevelXp: number
  nextLevelXp: number
  progress: number
} {
  const currentLevel = calculateLevel(totalXp)
  const currentLevelXp = xpForLevel(currentLevel)
  const nextLevelXp = xpForLevel(currentLevel + 1)
  const progress = ((totalXp - currentLevelXp) / (nextLevelXp - currentLevelXp)) * 100
  return { currentLevel, currentLevelXp, nextLevelXp, progress }
}

// Title based on level
export function getTitle(level: number): string {
  if (level >= 100) return '传奇勇士'
  if (level >= 80) return '龙骑士'
  if (level >= 60) return '圣殿骑士'
  if (level >= 50) return '皇家守卫'
  if (level >= 40) return '精英战士'
  if (level >= 30) return '高阶冒险者'
  if (level >= 20) return '熟练剑士'
  if (level >= 10) return '见习骑士'
  if (level >= 5) return '旅人'
  return '新手冒险者'
}

// XP reward by difficulty
export function getXpReward(difficulty: string): number {
  switch (difficulty) {
    case 'easy': return 20
    case 'medium': return 50
    case 'hard': return 120
    case 'epic': return 250
    default: return 50
  }
}

// Gold reward by difficulty
export function getGoldReward(difficulty: string): number {
  switch (difficulty) {
    case 'easy': return 5
    case 'medium': return 10
    case 'hard': return 25
    case 'epic': return 50
    default: return 10
  }
}

// Streak multiplier: 1 + min(days * 0.05, 1.0), capped at 2x (20 days)
export function getStreakMultiplier(streak: number): number {
  return 1 + Math.min(streak * 0.05, 1.0)
}

// Critical hit check (10% chance)
export function isCriticalHit(): boolean {
  return Math.random() < 0.1
}
