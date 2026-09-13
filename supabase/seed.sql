-- Life Quest seed: guild shop catalog, gear armory, world zones.
-- Idempotent: safe to run repeatedly.

insert into public.item_catalog (slug, name, description, kind, rarity, price, glyph, purchasable) values
  -- ——— starter badge (granted on signup) ———
  ('badge-newcomer', 'Newcomer Badge', 'Proof you answered the call to adventure.', 'badge', 'common', 0, 'seal', false),
  ('badge-stargazer', 'Stargazer Badge', 'Found in a daily chest beneath the constellations.', 'badge', 'uncommon', 0, 'seal', false),

  -- ——— titles ———
  ('title-squire', 'Squire', 'Every legend starts somewhere.', 'title', 'common', 100, 'scroll', true),
  ('title-knight', 'Knight', 'Discipline forged in daily quests.', 'title', 'uncommon', 400, 'scroll', true),
  ('title-sage', 'Sage', 'Wisdom purchased with a hundred books.', 'title', 'rare', 900, 'scroll', true),
  ('title-champion', 'Champion', 'The board remembers your streaks.', 'title', 'epic', 2000, 'trophy', true),
  ('title-legend', 'Living Legend', 'There are songs about your inbox zero.', 'title', 'legendary', 5000, 'trophy', true),

  -- ——— avatar frames ———
  ('frame-bronze', 'Bronze Frame', 'A modest ring for a modest hero.', 'frame', 'common', 150, 'circle', true),
  ('frame-silver', 'Silver Frame', 'Polished by many completed quests.', 'frame', 'uncommon', 350, 'circle', true),
  ('frame-gold', 'Gold-Leaf Frame', 'Illuminated in real gold leaf.', 'frame', 'rare', 800, 'circle', true),
  ('frame-rainbow', 'Prismatic Frame', 'Colors no scribe can explain.', 'frame', 'legendary', 3000, 'circle', true),

  -- ——— themes ———
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

-- ============ GEAR ARMORY: 6 slots x 3 tiers ============
-- Slots map to attributes: STR weapon, INT tome, VIT armor, DIS helm, CHA cloak, CRA instrument.
insert into public.gear_catalog (slug, slot, tier, name, description, price) values
  -- STR — the weapon
  ('str-weapon-1', 'str', 1, 'Oaken Training Sword', 'A squire''s first blade, carved from hearth-wood.', 0),
  ('str-weapon-2', 'str', 2, 'Iron Longsword', 'Forged for the champion who earned every callus.', 0),
  ('str-weapon-3', 'str', 3, 'Blade of the Dawn', 'It hums when its wielder keeps a promise.', 0),
  -- INT — the tome
  ('int-tome-1', 'int', 1, 'Apprentice''s Primer', 'Marginalia on every page, all in your hand.', 0),
  ('int-tome-2', 'int', 2, 'Scholar''s Codex', 'Bound in cobalt-dyed leather, chained to discipline.', 0),
  ('int-tome-3', 'int', 3, 'Chronicle of Ascension', 'Its blank pages fill as your mind does.', 0),
  -- VIT — the armor
  ('vit-armor-1', 'vit', 1, 'Padded Doublet', 'Stitched during a week of honest rest.', 0),
  ('vit-armor-2', 'vit', 2, 'Squire''s Mail', 'Rings polished by a hundred small good nights.', 0),
  ('vit-armor-3', 'vit', 3, 'Aegis of the Verdant Oath', 'Heavy is the hero who sleeps as appointed.', 0),
  -- DIS — the helm
  ('dis-helm-1', 'dis', 1, 'Leather Cap', 'Worn low over eyes that intend to finish things.', 0),
  ('dis-helm-2', 'dis', 2, 'Iron Kettle Helm', 'Unadorned. Unstoppable.', 0),
  ('dis-helm-3', 'dis', 3, 'Crown of Quiet Resolve', 'Not given. Grown.', 0),
  -- CHA — the cloak
  ('cha-cloak-1', 'cha', 1, 'Wanderer''s Shawl', 'Carries stories from three towns over.', 0),
  ('cha-cloak-2', 'cha', 2, 'Madder-Red Cloak', 'Dyed in carmine, noticed across any room.', 0),
  ('cha-cloak-3', 'cha', 3, 'Mantle of the Beloved', 'People tell it their troubles. It listens.', 0),
  -- CRA — the instrument
  ('cra-instrument-1', 'cra', 1, 'Tin Whistle', 'Slightly out of tune. Utterly yours.', 0),
  ('cra-instrument-2', 'cra', 2, 'Lapidary''s Kit', 'For cutting beauty out of rough days.', 0),
  ('cra-instrument-3', 'cra', 3, 'Lyre of the Golden Hour', 'Its strings remember every finished draft.', 0)
on conflict (slot, tier) do update
  set slug = excluded.slug,
      name = excluded.name,
      description = excluded.description,
      price = excluded.price;

-- ============ WORLD ZONES: the Sunken Road ============
insert into public.zones (id, name, lore, unlock_level, order_index) values
  (1, 'The Hearthstead', 'Home. The fire is small but yours to tend. Every legend in this ledger begins with a chore done well.', 1, 1),
  (2, 'Milkwood', 'A forest of ordinary miracles. The birds here respect a morning routine.', 2, 2),
  (3, 'The Inkfall Bridge', 'Sages cross on stepping-stones of finished pages. One is always missing.', 4, 3),
  (4, 'Coppergate Market', 'Every hello you have ever owed someone is traded here at fair prices.', 6, 4),
  (5, 'The Forgeways', 'Hills that remember hands that make things. The sparks sing in ochre.', 8, 5),
  (6, 'Vigil Keep', 'A garrison of the disciplined. They say the kettle helms never rust.', 11, 6),
  (7, 'The Mirror Fen', 'The water shows the hero you are becoming. It is kinder than you think.', 14, 7),
  (8, 'Mount Ledgerline', 'The summit of the chronicle. From here, every chore you ever finished is visible at once.', 18, 8)
on conflict (id) do update
  set name = excluded.name,
      lore = excluded.lore,
      unlock_level = excluded.unlock_level,
      order_index = excluded.order_index;
