-- The main table that is the result of the data mining. To allow for more
-- repeats in the data mining, declare that incidents are unique with respects
-- to the time and location of the incidents, such that two incidents can
-- never occur at the same place and the same time.
CREATE TABLE IF NOT EXISTS Crimes(
    Crime TEXT,
    Time DATETIME,
    Longitude DOUBLE,
    Latitude DOUBLE,
    Description TEXT,
    UNIQUE (Time, Longitude, Latitude) ON CONFLICT REPLACE
);

-- The locations table is used to cache responses from Google's geocoding
-- service so that the number of requests to their service can be reduced,
-- keeping us under their API limit and speeding up the data mining
CREATE TABLE IF NOT EXISTS Locations(
    Location TEXT,
    Latitude DOUBLE,
    Longitude DOUBLE
);
