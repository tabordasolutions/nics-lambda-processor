create table geojson_point_feeds
(
	objectid varchar not null,
	properties varchar,
	created_at timestamp with time zone not null,
	the_geom geometry(Point,4326) not null,
	feedname varchar(100) not null,
	constraint geojson_point_feeds_pkey
		primary key (objectid, feedname)
)
;