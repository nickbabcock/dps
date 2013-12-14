CREATE TABLE Crimes(
    Crime TEXT,
    Time DATETIME,
    Longitude DOUBLE,
    Latitude DOUBLE,
    Description TEXT,
    UNIQUE (Time, Longitude, Latitude) ON CONFLICT REPLACE
);

CREATE TABLE Locations(
    Location TEXT,
    Latitude DOUBLE,
    Longitude DOUBLE
);
