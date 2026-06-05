-- ============================================
-- Quest Board: Seed Achievement Data
-- ============================================

INSERT INTO public.achievements (key, name, description, category, icon, color, xp_reward, gold_reward, requirement_type, requirement_value, sort_order) VALUES
('first_task',       '初出茅庐', '完成你的第一个任务。英雄的旅程始于第一步。', 'milestone', 'swords',     '#f59e0b', 50,   10,  'total_tasks',        1,   1),
('task_slayer_10',   '任务猎手', '完成 10 个任务。',            'milestone', 'target',      '#f59e0b', 100,  25,  'total_tasks',        10,  2),
('task_slayer_50',   '资深冒险者', '完成 50 个任务。',          'milestone', 'crosshair',   '#f59e0b', 250,  50,  'total_tasks',        50,  3),
('task_slayer_100',  '百战勇士', '完成 100 个任务。公会开始注意到你了。', 'milestone', 'shield', '#f59e0b', 500,  100, 'total_tasks',        100, 4),
('task_slayer_500',  '传说',     '完成 500 个任务。',           'milestone', 'crown',       '#f59e0b', 2000, 500, 'total_tasks',        500, 5),
('streak_3',         '三天之约', '连续 3 天完成任务。',          'streak',    'flame',       '#ef4444', 75,   15,  'streak',             3,   6),
('streak_7',         '一周坚持', '连续 7 天完成任务。习惯的火焰被点燃。', 'streak', 'flame',  '#ef4444', 200,  40,  'streak',             7,   7),
('streak_14',        '双周连击', '连续 14 天完成任务。',         'streak',    'flame',       '#ef4444', 400,  80,  'streak',             14,  8),
('streak_30',        '不灭的意志','连续 30 天完成任务。整整一个月！', 'streak', 'flame-kindling','#ef4444',1000,200,'streak',             30,  9),
('streak_100',       '传奇',     '连续 100 天完成任务。你就是传奇。', 'streak', 'flame',     '#ef4444', 5000, 1000,'streak',            100, 10),
('daily_combo_5',    '高效达人', '一天内完成 5 个任务。',        'special',   'zap',         '#8b5cf6', 150,  30,  'daily_combo',        5,   11),
('daily_combo_10',   '任务机器', '一天内完成 10 个任务。',       'special',   'zap',         '#8b5cf6', 300,  60,  'daily_combo',        10,  12),
('daily_combo_20',   '超越极限', '一天内完成 20 个任务。',       'special',   'zap',         '#8b5cf6', 600,  120,'daily_combo',        20,  13),
('epic_slayer_5',    '史诗猎手', '完成 5 个史诗任务。',          'special',   'skull',       '#a855f7', 300,  60,  'difficulty_epic',    5,   14),
('epic_slayer_25',   '史诗征服者','完成 25 个史诗任务。传说由此诞生。', 'special', 'skull',   '#a855f7', 1000, 200,'difficulty_epic',    25,  15),
('level_10',         '见习骑士', '达到等级 10。',                'milestone', 'sword',       '#6366f1', 200,  50,  'level',              10,  16),
('level_25',         '精英战士', '达到等级 25。',                'milestone', 'sword',       '#6366f1', 500,  100, 'level',              25,  17),
('level_50',         '半神',     '达到等级 50。凡人极限抛在身后。', 'milestone', 'gem',       '#6366f1', 1500, 300, 'level',              50,  18),
('level_100',        '传奇勇士', '达到等级 100。',               'milestone', 'trophy',      '#6366f1', 5000, 1000,'level',              100, 19);
