let requestp = require('request-promise-native'); //Adding native ES6 promises to request.
let {Parser} = require('xml2js');
const moment = require('moment-timezone');

let requestJsonData = (url) => new Promise((resolves, rejects) => {

    if (!url)
        rejects(new Error('Url parameter must contain a value.'));
    let options = {
        url: url,
        timeout: 1500,
        agentOptions: { ciphers: 'DES-CBC3-SHA' } //Fixes "socket hangup" problem with outdated TLS 1.0 protocol. See: https://stackoverflow.com/questions/42545683/socket-hang-up-at-tlssocket-onhangup-when-connecting-to-iis6-server-with-tls-1-0
    };

    requestp(options)
        .then((result) => xmltojson(result))
        .then(resultjson => resolves(resultjson))
        .catch((error) => rejects(error));
});

let xmltojson = (xml) => new Promise((resolves, rejects) => {
    let parser = new Parser({explicitArray: false, mergeAttrs: true, normalize: true, explicitCharkey:true});
    new parser.parseString(xml, (err,result) => err ? rejects(err) : resolves(result))
});
let getMessageArrayFromResult = (resultjson) => {
    let messages = [];
    if ((resultjson.SkyConnectData || {}).Message)
        messages = (Array.isArray(resultjson.SkyConnectData.Message) ? resultjson.SkyConnectData.Message : new Array(resultjson.SkyConnectData.Message));
    return messages;
};
let transformToGeoJson = (messages) => {
    let features = messages
        .map((message) => {
            return {
                "type": "Feature",
                "id": message.Registration._,
                "geometry": {
                    "type": "Point",
                    "coordinates": [
                        message.GPS.Longitude._,
                        message.GPS.Latitude._
                    ]
                },
                "properties": {
                    "name" : message.Registration._,
                    "messagetype": ((message.Type || {})._) ? message.Type._ : null,
                    "gpsdatetime" : (message.GPS.DateTime || {})._ ? moment(message.GPS.DateTime._) : null,
                    "altitude" : ((message.GPS.Altitude || {})._) ? message.GPS.Altitude._ : null,
                    "altitudeunits" : ((message.GPS.Altitude || {}).units) ? message.GPS.Altitude.units : null,
                    "heading" : ((message.GPS.Heading || {})._) ? message.GPS.Heading._ : null,
                    "headingunits" :((message.GPS.Heading || {}).units) ? message.GPS.Heading.units: null,
                    "speed" : ((message.GPS.Speed || {})._) ? message.GPS.Speed._: null,
                    "speedunits" : ((message.GPS.Speed || {}).units) ? message.GPS.Speed.units : null,
                    "vehicle": ((message.Vehicle || {})._) ? message.Vehicle._: null,
                    "vehicletype" : ((message.Vehicle || {}).Type) ? message.Vehicle.Type : null
                }
            }
        })
        .map((feature) => {
            feature.properties.desc = createDescription(feature);
            return feature;
        });

    return {
        "type": "FeatureCollection",
        "crs": {
            "type": "name",
            "properties": {
                "name": "EPSG:4326"
            }
        },
        "features" : features

    };
};

let filterValidMessages = (messages) => {
    if (!Array.isArray(messages)) throw new Error('Invalid parameter - messages must be an array. Found:' + JSON.stringify(messages) );
    return messages.filter((message) => {
        return (((message.GPS || {}).DateTime || {})._)
            && (((message.GPS || {}).Latitude || {})._)
            && (((message.GPS || {}).Longitude || {})._)
            && ((message.Registration || {})._)
    });
};

let latestMessagesPerUnit = (messages) => {
    if (!Array.isArray(messages)) throw new Error('Invalid parameter - messages must be an array. Found:' + JSON.stringify(messages) );
    let vehicleMap = {};
    messages.sort((a,b) => moment(b.GPS.DateTime._).unix() - moment(a.GPS.DateTime._).unix());

    return messages.filter((message) => {
        if (!vehicleMap[message.Registration._]) {
            vehicleMap[message.Registration._] = message.GPS.DateTime._;
            return true;
        }
        return false;
    })
};

let validResult = (jsonResult) => {
    //Make sure the result has a SystemStatus with NetworkStatus at minimum.
    return !!(((jsonResult || {}).SkyConnectData || {}).SystemStatus || {}).NetworkStatus;
};

let createDescription = (feature) => {
    let createEntry = (title, val) => `<b>${title}:</b>${val || 'N/A'}<br/>`;
    return createEntry('Registration', feature.properties.name) +
        createEntry('Message Type', feature.properties.messagetype) +
        createEntry('GPS Time', moment(feature.properties.gpsdatetime).tz('America/Los_Angeles').format('l LTS z')) +
        createEntry('Altitude', `${isNaN(feature.properties.altitude) ? 'N/A' : feature.properties.altitude} ${(feature.properties.altitudeunits || '')}`) +
        createEntry('Heading', `${isNaN(feature.properties.heading) ? 'N/A' : feature.properties.heading} ${(feature.properties.headingunits || '')}`) +
        createEntry('Speed', `${isNaN(feature.properties.speed) ? 'N/A' : feature.properties.speed} ${(feature.properties.speedunits || '')}`) +
        createEntry('Vehicle', feature.properties.vehicle) +
        createEntry('Vehicle Type', feature.properties.vehicletype);
};

module.exports = exports = {
    requestJsonData: requestJsonData,
    xmltojson: xmltojson,
    getMessageArrayFromResult: getMessageArrayFromResult,
    transformToGeoJson : transformToGeoJson,
    latestMessagesPerUnit : latestMessagesPerUnit,
    filterValidMessages: filterValidMessages,
    validResult: validResult,
    createDescription: createDescription
};

