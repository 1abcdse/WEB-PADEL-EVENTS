-- Dades de la inscripció per jugador/a: nivell declarat (C, C+, B…) i talla de samarreta (welcome pack).
ALTER TABLE entry_player
  ADD COLUMN declared_level text,
  ADD COLUMN shirt_size text;
