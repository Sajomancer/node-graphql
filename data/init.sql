CREATE TABLE ingredients (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  supplier TEXT NOT NULL,
  current_price NUMERIC(10, 2), -- automatically updated from the price_changes table
  UNIQUE(name, supplier) -- this is correct but price_changes do not indicate the supplier
);

-- there are duplicate name-supplier pairs in the CSV
CREATE TEMP TABLE ingredients_staging (
  name TEXT,
  supplier TEXT
);

COPY ingredients_staging(name, supplier)
FROM '/docker-entrypoint-initdb.d/ingredients.csv'
WITH (FORMAT csv, HEADER true);

INSERT INTO ingredients (name, supplier)
SELECT DISTINCT name, supplier FROM ingredients_staging
ON CONFLICT (name, supplier) DO NOTHING;

CREATE TABLE price_changes (
  id SERIAL PRIMARY KEY,
  ingredient_id INTEGER REFERENCES ingredients(id),
  changed_at TIMESTAMPTZ NOT NULL,
  price NUMERIC(10, 2) NOT NULL
);

CREATE OR REPLACE FUNCTION update_current_price() RETURNS TRIGGER AS $$
BEGIN
  UPDATE ingredients
  SET current_price = NEW.price
  WHERE id = NEW.ingredient_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_current_price
  AFTER INSERT ON price_changes
  FOR EACH ROW
  EXECUTE FUNCTION update_current_price();

DO $$
DECLARE
    json_text TEXT;
    json_data JSONB;
    rec JSONB;
    latest_price_change JSONB;
BEGIN
    json_text := pg_read_file('/docker-entrypoint-initdb.d/price_changes.json');
    json_data := json_text::JSONB;
    
    FOR rec IN SELECT * FROM jsonb_array_elements(json_data)
    LOOP
         SELECT price_change
         INTO latest_price_change
         FROM (
            SELECT price_change
            FROM jsonb_array_elements(rec->'price_changes') AS price_change
            ORDER BY (price_change->>'changed_at')::timestamptz DESC
            LIMIT 1
         ) sub;

         INSERT INTO price_changes (ingredient_id, changed_at, price)
         VALUES (
          -- not handling duplicate names since price_change does not indicate supplier
             (SELECT id FROM ingredients WHERE name = rec->>'ingredient_name' LIMIT 1),
             (latest_price_change->>'changed_at')::timestamptz,
             (latest_price_change->>'price')::numeric
         );
    END LOOP;
END $$;

-- drop any ingredients without prices for simplicity, this will remove duplicates
DELETE FROM ingredients
WHERE id NOT IN (
    SELECT DISTINCT ingredient_id FROM price_changes
);

CREATE TABLE recipes (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  method TEXT NOT NULL
);

CREATE TABLE recipe_ingredients (
  recipe_id INTEGER NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
  ingredient_id INTEGER NOT NULL REFERENCES ingredients(id) ON DELETE CASCADE,
  -- problematic if an ingredient is deleted, what happens to the recipe?
  PRIMARY KEY (recipe_id, ingredient_id)
);

CREATE OR REPLACE FUNCTION create_recipe(
  _title TEXT,
  _method TEXT,
  _ingredient_ids INTEGER[]
)
RETURNS TABLE(recipe_id INTEGER, recipe_title TEXT) AS $$
BEGIN
  INSERT INTO recipes (title, method)
  VALUES (_title, _method)
  RETURNING id AS recipe_id, title AS recipe_title
    INTO recipe_id, recipe_title;
  
  INSERT INTO recipe_ingredients (recipe_id, ingredient_id)
  SELECT recipe_id, unnest(_ingredient_ids);
  
  RETURN NEXT;
END;
$$ LANGUAGE plpgsql;

CREATE INDEX idx_recipe_ingredients_ingredient_id
  ON recipe_ingredients (ingredient_id);