const fs = require('fs');

const valid_geojson = () => JSON.parse(fs.readFileSync('test/data/valid_geojson1.json'));

const valid_jsonfromxmlresult = () => JSON.parse(fs.readFileSync('test/data/valid_jsonfromxmlresult1.json'));

const skyconnect_responsexml = () => fs.readFileSync('test/data/skyconnect_response.xml');

const filtered_latestmessages = () => JSON.parse(fs.readFileSync('test/data/filtered_latestmessages.json'));

const valid_messages = () => JSON.parse(fs.readFileSync('test/data/validmessages.json'));

module.exports = exports = {
    valid_geojson : valid_geojson,
    valid_jsonfromxmlresult : valid_jsonfromxmlresult,
    valid_messages : valid_messages,
    skyconnect_responsexml : skyconnect_responsexml,
    filtered_latestmessages : filtered_latestmessages
};