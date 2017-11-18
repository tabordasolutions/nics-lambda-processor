create function upsert_geojson_point_record(feed_name text, object_id text, asofdatetime timestamp with time zone, geojson_geom text, json_properties text) returns void
	language plpgsql
as $$
BEGIN
      UPDATE geojson_point_feeds SET properties = json_properties,
        created_at = asofdatetime, the_geom = st_setsrid(st_geomfromgeojson(geojson_geom),4326)
        WHERE objectid = object_id and feedname = feed_name ;
      IF NOT FOUND THEN
        INSERT INTO geojson_point_feeds (feedname, objectid, properties, created_at, the_geom) VALUES
          (feed_name,object_id,json_properties,asofdatetime,st_setsrid(st_geomfromgeojson(geojson_geom),4326));
      END IF;
  END;
$$
;