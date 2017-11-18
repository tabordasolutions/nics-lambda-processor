CREATE VIEW kerncounty_avl AS SELECT gpf.objectid,
    gpf.the_geom AS location,
    gpf.created_at,
    ((gpf.properties)::json ->> 'desc'::text) AS description,
    (((gpf.properties)::json ->> 'lastupdate'::text))::timestamp with time zone AS lastupdate,
    (((gpf.properties)::json ->> 'heading'::text))::integer AS course
   FROM geojson_point_feeds gpf
  WHERE ((gpf.feedname)::text = 'kerncounty_avl'::text)
;