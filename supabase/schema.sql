-- ============================================
-- Quest Board: Database Schema
-- Run this in Supabase SQL Editor
-- ============================================

-- Enums
CREATE TYPE public.task_difficulty AS ENUM ('easy', 'medium', 'hard', 'epic');
CREATE TYPE public.task_status AS ENUM ('pending', 'in_progress', 'completed');
CREATE TYPE public.achievement_category AS ENUM ('milestone', 'streak', 'special', 'secret');

-- Profiles (extends auth.users)
CREATE TABLE public.profiles (
  id            uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username      text UNIQUE,
  display_name  text NOT NULL DEFAULT '',
  avatar_url    text,
  xp            integer NOT NULL DEFAULT 0,
  gold          integer NOT NULL DEFAULT 0,
  level         integer NOT NULL DEFAULT 1,
  title         text NOT NULL DEFAULT '新手冒险者',
  current_streak     integer NOT NULL DEFAULT 0,
  longest_streak     integer NOT NULL DEFAULT 0,
  last_completed_date date,
  total_tasks_completed integer NOT NULL DEFAULT 0,
  total_xp_earned       integer NOT NULL DEFAULT 0,
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_profiles_level ON public.profiles(level DESC, xp DESC);

-- Task Categories
CREATE TABLE public.task_categories (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name       text NOT NULL,
  color      text NOT NULL DEFAULT '#6366f1',
  icon       text NOT NULL DEFAULT 'target',
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_task_categories_user ON public.task_categories(user_id);

-- Tasks
CREATE TABLE public.tasks (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  category_id   uuid REFERENCES public.task_categories(id) ON DELETE SET NULL,
  title         text NOT NULL,
  description   text DEFAULT '',
  difficulty    public.task_difficulty NOT NULL DEFAULT 'medium',
  status        public.task_status NOT NULL DEFAULT 'pending',
  xp_reward     integer NOT NULL DEFAULT 50,
  gold_reward   integer NOT NULL DEFAULT 10,
  estimated_minutes integer,
  due_date      date,
  completed_at  timestamptz,
  sort_order    integer NOT NULL DEFAULT 0,
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_tasks_user_status ON public.tasks(user_id, status);
CREATE INDEX idx_tasks_user_due ON public.tasks(user_id, due_date);
CREATE INDEX idx_tasks_user_created ON public.tasks(user_id, created_at DESC);

-- Daily Logs
CREATE TABLE public.daily_logs (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  log_date        date NOT NULL DEFAULT CURRENT_DATE,
  tasks_completed integer NOT NULL DEFAULT 0,
  xp_earned       integer NOT NULL DEFAULT 0,
  gold_earned     integer NOT NULL DEFAULT 0,
  perfect_day     boolean NOT NULL DEFAULT false,
  note            text DEFAULT '',
  UNIQUE(user_id, log_date)
);

CREATE INDEX idx_daily_logs_user ON public.daily_logs(user_id, log_date DESC);

-- Achievements (static definitions)
CREATE TABLE public.achievements (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key               text UNIQUE NOT NULL,
  name              text NOT NULL,
  description       text NOT NULL,
  category          achievement_category NOT NULL,
  icon              text NOT NULL DEFAULT 'trophy',
  color             text NOT NULL DEFAULT '#f59e0b',
  xp_reward         integer NOT NULL DEFAULT 0,
  gold_reward       integer NOT NULL DEFAULT 0,
  requirement_type  text NOT NULL,
  requirement_value integer NOT NULL,
  sort_order        integer NOT NULL DEFAULT 0,
  created_at        timestamptz NOT NULL DEFAULT now()
);

-- User Achievements (unlocked)
CREATE TABLE public.user_achievements (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  achievement_id  uuid NOT NULL REFERENCES public.achievements(id) ON DELETE CASCADE,
  unlocked_at     timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, achievement_id)
);

CREATE INDEX idx_user_achievements_user ON public.user_achievements(user_id);
