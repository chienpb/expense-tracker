-- Trip maps (Phase 3): the traveller's route, stored DECIMATED — ~120
-- normalized [0,1] {x,y} points (its own bounding box, not real geography),
-- so render is cheap and the array fits the column. NULL = no route (a trip
-- with only hand-placed seals is still a complete map).
ALTER TABLE trips ADD COLUMN route JSONB;
