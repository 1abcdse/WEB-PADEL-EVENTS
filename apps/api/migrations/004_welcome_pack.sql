-- Un sol welcome pack per persona i prova, encara que jugui dues categories (decisió del coordinador).
CREATE TABLE welcome_pack (
  competition_id uuid NOT NULL REFERENCES competition(id),
  player_id uuid NOT NULL REFERENCES player(id),
  shirt_size text,
  delivered_at timestamptz,
  PRIMARY KEY (competition_id, player_id)
);

INSERT INTO welcome_pack (competition_id, player_id, shirt_size, delivered_at)
SELECT DISTINCT ON (competition_id, player_id) competition_id, player_id, shirt_size, welcome_pack_delivered_at
  FROM entry_player
 ORDER BY competition_id, player_id, welcome_pack_delivered_at NULLS LAST;

ALTER TABLE entry_player DROP COLUMN welcome_pack_delivered_at;
