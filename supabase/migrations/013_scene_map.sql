-- Trip maps (Phase 3): per-scene placement on the trip's parchment map.
-- Normalized [0,1] fractions (mirrors atlas_x/atlas_y). NULL = unplaced
-- (the scene waits in the tray). Both set together or both null.
ALTER TABLE scenes ADD COLUMN map_x DOUBLE PRECISION, ADD COLUMN map_y DOUBLE PRECISION;
