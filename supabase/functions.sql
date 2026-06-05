-- ============================================
-- Quest Board: Database Functions & Triggers
-- ============================================

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (id, username, display_name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'username', 'adventurer_' || substr(NEW.id::text, 1, 8)),
    COALESCE(NEW.raw_user_meta_data ->> 'display_name', 'Anonymous Adventurer')
  );
  RETURN NEW;
END;
$$;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Recalculate level and title on XP change
CREATE OR REPLACE FUNCTION public.recalculate_level()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
DECLARE
  new_level integer;
  xp_for_level integer;
BEGIN
  new_level := 1;
  LOOP
    xp_for_level := floor(100 * power(new_level + 1, 1.5));
    EXIT WHEN NEW.xp < xp_for_level;
    new_level := new_level + 1;
  END LOOP;

  NEW.level := new_level;
  NEW.title := CASE
    WHEN new_level >= 100 THEN '传奇勇士'
    WHEN new_level >= 80  THEN '龙骑士'
    WHEN new_level >= 60  THEN '圣殿骑士'
    WHEN new_level >= 50  THEN '皇家守卫'
    WHEN new_level >= 40  THEN '精英战士'
    WHEN new_level >= 30  THEN '高阶冒险者'
    WHEN new_level >= 20  THEN '熟练剑士'
    WHEN new_level >= 10  THEN '见习骑士'
    WHEN new_level >= 5   THEN '旅人'
    ELSE '新手冒险者'
  END;

  NEW.updated_at := now();
  RETURN NEW;
END;
$$;

CREATE OR REPLACE TRIGGER on_xp_change_recalc_level
  BEFORE UPDATE OF xp ON public.profiles
  FOR EACH ROW
  WHEN (NEW.xp > OLD.xp)
  EXECUTE FUNCTION public.recalculate_level();

-- Check and unlock achievements
CREATE OR REPLACE FUNCTION public.check_achievements(p_user_id uuid)
RETURNS TABLE(achievement_id uuid, achievement_name text, achievement_icon text)
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
DECLARE
  v_total_tasks integer;
  v_streak integer;
  v_daily_combo integer;
  v_epic_done integer;
  v_profile_level integer;
  v_achievement record;
  v_today date := CURRENT_DATE;
BEGIN
  SELECT total_tasks_completed, current_streak, level
  INTO v_total_tasks, v_streak, v_profile_level
  FROM public.profiles WHERE id = p_user_id;

  -- Today's completed count
  SELECT COUNT(*) INTO v_daily_combo
  FROM public.tasks
  WHERE user_id = p_user_id AND status = 'completed' AND completed_at::date = v_today;

  -- Epic tasks done total
  SELECT COUNT(*) INTO v_epic_done
  FROM public.tasks
  WHERE user_id = p_user_id AND status = 'completed' AND difficulty = 'epic';

  FOR v_achievement IN
    SELECT a.* FROM public.achievements a
    WHERE a.id NOT IN (
      SELECT ua.achievement_id FROM public.user_achievements ua WHERE ua.user_id = p_user_id
    )
    AND (
      (a.requirement_type = 'total_tasks' AND v_total_tasks >= a.requirement_value)
      OR (a.requirement_type = 'streak' AND v_streak >= a.requirement_value)
      OR (a.requirement_type = 'daily_combo' AND v_daily_combo >= a.requirement_value)
      OR (a.requirement_type = 'difficulty_epic' AND v_epic_done >= a.requirement_value)
      OR (a.requirement_type = 'level' AND v_profile_level >= a.requirement_value)
    )
  LOOP
    INSERT INTO public.user_achievements (user_id, achievement_id)
    VALUES (p_user_id, v_achievement.id)
    ON CONFLICT DO NOTHING;

    IF v_achievement.xp_reward > 0 OR v_achievement.gold_reward > 0 THEN
      UPDATE public.profiles
      SET xp = xp + v_achievement.xp_reward,
          gold = gold + v_achievement.gold_reward,
          updated_at = now()
      WHERE id = p_user_id;
    END IF;

    achievement_id := v_achievement.id;
    achievement_name := v_achievement.name;
    achievement_icon := v_achievement.icon;
    RETURN NEXT;
  END LOOP;
END;
$$;

-- Complete a task (core game logic)
CREATE OR REPLACE FUNCTION public.complete_task(p_task_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
DECLARE
  v_task record;
  v_profile record;
  v_base_xp integer;
  v_base_gold integer;
  v_final_xp integer;
  v_final_gold integer;
  v_streak_multiplier numeric;
  v_critical boolean;
  v_streak integer;
  v_new_level integer;
  v_new_title text;
  v_achievements jsonb;
  v_today date := CURRENT_DATE;
  v_leveled_up boolean := false;
  v_ach record;
  v_ach_array jsonb := '[]'::jsonb;
BEGIN
  -- Get task
  SELECT * INTO v_task FROM public.tasks WHERE id = p_task_id;
  IF v_task IS NULL OR v_task.status = 'completed' THEN
    RETURN jsonb_build_object('error', 'Task not found or already completed');
  END IF;

  -- Get profile
  SELECT * INTO v_profile FROM public.profiles WHERE id = v_task.user_id;

  -- Calculate streak multiplier
  v_streak_multiplier := 1 + LEAST(v_profile.current_streak * 0.05, 1.0);

  -- Critical hit (10% chance)
  v_critical := random() < 0.10;

  -- Calculate rewards
  v_base_xp := v_task.xp_reward;
  v_base_gold := v_task.gold_reward;
  v_final_xp := ROUND(v_base_xp * v_streak_multiplier);
  v_final_gold := ROUND(v_base_gold * v_streak_multiplier);

  IF v_critical THEN
    v_final_xp := v_final_xp * 2;
    v_final_gold := v_final_gold * 2;
  END IF;

  -- Update task
  UPDATE public.tasks
  SET status = 'completed', completed_at = now(), updated_at = now()
  WHERE id = p_task_id;

  -- Streak logic
  IF v_profile.last_completed_date IS NULL OR v_profile.last_completed_date = v_today - 1 THEN
    v_streak := v_profile.current_streak + 1;
  ELSIF v_profile.last_completed_date < v_today - 1 THEN
    v_streak := 1;
  ELSE
    v_streak := v_profile.current_streak; -- already completed today
  END IF;

  -- Update profile
  UPDATE public.profiles SET
    xp = xp + v_final_xp,
    gold = gold + v_final_gold,
    current_streak = v_streak,
    longest_streak = GREATEST(longest_streak, v_streak),
    last_completed_date = v_today,
    total_tasks_completed = total_tasks_completed + 1,
    total_xp_earned = total_xp_earned + v_final_xp,
    updated_at = now()
  WHERE id = v_task.user_id;

  -- Upsert daily log
  INSERT INTO public.daily_logs (user_id, log_date, tasks_completed, xp_earned, gold_earned)
  VALUES (v_task.user_id, v_today, 1, v_final_xp, v_final_gold)
  ON CONFLICT (user_id, log_date)
  DO UPDATE SET
    tasks_completed = daily_logs.tasks_completed + 1,
    xp_earned = daily_logs.xp_earned + v_final_xp,
    gold_earned = daily_logs.gold_earned + v_final_gold;

  -- Check for level up
  SELECT level, title INTO v_new_level, v_new_title
  FROM public.profiles WHERE id = v_task.user_id;

  IF v_new_level > v_profile.level THEN
    v_leveled_up := true;
  END IF;

  -- Check achievements
  FOR v_ach IN
    SELECT * FROM public.check_achievements(v_task.user_id)
  LOOP
    v_ach_array := v_ach_array || jsonb_build_object(
      'id', v_ach.achievement_id,
      'name', v_ach.achievement_name,
      'icon', v_ach.achievement_icon
    );
  END LOOP;

  -- Return result
  RETURN jsonb_build_object(
    'final_xp', v_final_xp,
    'final_gold', v_final_gold,
    'leveled_up', v_leveled_up,
    'new_level', v_new_level,
    'new_title', v_new_title,
    'streak', v_streak,
    'critical_hit', v_critical,
    'unlocked_achievements', v_ach_array
  );
END;
$$;
