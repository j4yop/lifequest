-- Life Quest seed: the guild shop catalog.
-- Idempotent: safe to run repeatedly.

insert into public.item_catalog (slug, name, description, kind, rarity, price, glyph, purchasable) values
  -- ——— starter badge (granted on signup) ———
  ('badge-newcomer', 'Newcomer Badge', 'Proof you answered the call to adventure.', 'badge', 'common', 0, 'seal', false),

  -- ——— titles: shown next to your name ———
  ('title-squire', 'Squire', 'Every legend starts somewhere.', 'title', 'common', 100, 'scroll', true),
  ('title-knight', 'Knight', 'Discipline forged in daily quests.', 'title', 'uncommon', 400, 'scroll', true),
  ('title-sage', 'Sage', 'Wisdom purchased with a hundred books.', 'title', 'rare', 900, 'scroll', true),
  ('title-champion', 'Champion', 'The board remembers your streaks.', 'title', 'epic', 2000, 'trophy', true),
  ('title-legend', 'Living Legend', 'There are songs about your inbox zero.', 'title', 'legendary', 5000, 'trophy', true),

  -- ——— avatar frames: ring colors on the character card ———
  ('frame-bronze', 'Bronze Frame', 'A modest ring for a modest hero.', 'frame', 'common', 150, 'circle', true),
  ('frame-silver', 'Silver Frame', 'Polished by many completed quests.', 'frame', 'uncommon', 350, 'circle', true),
  ('frame-gold', 'Gold Frame', 'Heavy is the head that wears it.', 'frame', 'rare', 800, 'circle', true),
  ('frame-rainbow', 'Prismatic Frame', 'Colors no smith can explain.', 'frame', 'legendary', 3000, 'circle', true),

  -- ——— themes: alternate board palettes ———
  ('theme-ember', 'Ember Theme', 'A warm hearth for your quest board.', 'theme', 'rare', 600, 'palette', true),
  ('theme-verdant', 'Verdant Theme', 'Deep forest tones for steady growth.', 'theme', 'epic', 1500, 'palette', true),

  -- ——— consumables ———
  ('consumable-streak-freeze', 'Streak Freeze', 'Protects your streak for one missed day.', 'consumable', 'uncommon', 120, 'snowflake', true)
on conflict (slug) do update
  set name = excluded.name,
      description = excluded.description,
      kind = excluded.kind,
      rarity = excluded.rarity,
      price = excluded.price,
      glyph = excluded.glyph,
      purchasable = excluded.purchasable;
