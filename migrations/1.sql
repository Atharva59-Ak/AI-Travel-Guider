
CREATE TABLE saved_trips (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT NOT NULL,
  name TEXT NOT NULL,
  from_city TEXT NOT NULL,
  to_city TEXT NOT NULL,
  travel_mode TEXT NOT NULL,
  route_details TEXT,
  estimated_cost REAL,
  estimated_duration TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE saved_cities (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT NOT NULL,
  city_name TEXT NOT NULL,
  city_state TEXT NOT NULL,
  saved_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE saved_attractions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT NOT NULL,
  attraction_id TEXT NOT NULL,
  attraction_name TEXT NOT NULL,
  city_name TEXT NOT NULL,
  saved_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE saved_itineraries (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT NOT NULL,
  itinerary_name TEXT NOT NULL,
  city TEXT NOT NULL,
  days INTEGER NOT NULL,
  budget TEXT NOT NULL,
  travel_style TEXT NOT NULL,
  interests TEXT NOT NULL,
  itinerary_content TEXT NOT NULL,
  saved_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_saved_trips_user_id ON saved_trips(user_id);
CREATE INDEX idx_saved_cities_user_id ON saved_cities(user_id);
CREATE INDEX idx_saved_attractions_user_id ON saved_attractions(user_id);
CREATE INDEX idx_saved_itineraries_user_id ON saved_itineraries(user_id);
