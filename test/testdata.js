const fs = require('fs');

const valid_geojson = () => JSON.parse(fs.readFileSync('test/data/valid_geojson1.json'));

const valid_jsonfromxmlresult_multiple_messages = () => JSON.parse(fs.readFileSync('test/data/valid_jsonfromxmlresult1.json'));

const valid_jsonfromxmlresult_singlemessage = () => JSON.parse(fs.readFileSync('test/data/valid_jsonfromxmlresult_singlemessage.json'));

const skyconnect_responsexml = () => fs.readFileSync('test/data/skyconnect_response.xml');

const skyconnect_response_single_message = () => fs.readFileSync('test/data/skyconnect_response_single_message.xml');

const filtered_latestmessages = () => JSON.parse(fs.readFileSync('test/data/filtered_latestmessages.json'));

const valid_messages = () => JSON.parse(fs.readFileSync('test/data/validmessages.json'));

module.exports = exports = {
    valid_geojson : valid_geojson,
    valid_jsonfromxmlresult_multiple_messages : valid_jsonfromxmlresult_multiple_messages,
    valid_jsonfromxmlresult_singlemessage: valid_jsonfromxmlresult_singlemessage,
    valid_messages : valid_messages,
    skyconnect_responsexml : skyconnect_responsexml,
    skyconnect_response_single_message: skyconnect_response_single_message,
    filtered_latestmessages : filtered_latestmessages
};