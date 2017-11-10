let requestp = require('request-promise-native'); //Adding native ES6 promises to request.
let {Parser} = require('xml2js');
const moment = require('moment');

let requestJsonData = (url) => new Promise((resolves, rejects) => {

    if (!url)
        rejects(new Error('Url parameter must contain a value.'));
    requestp(url)
        .then((result) => {
            let parser = new Parser({explicitArray: false, mergeAttrs: true, normalize: true, explicitCharkey:true});
            new parser.parseString(result, (err,result) => err ? rejects(err) : resolves(result))
        })
        .catch((error) => rejects(error));
});

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
                    "lastupdate" : (message.GPS.DateTime || {})._ ? moment(message.GPS.DateTime._) : null,
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
    if (!messages && !messages.length) throw new Error('Invalid parameter: messages');
    return messages.filter((message) => {
        return (((message.GPS || {}).DateTime || {})._)
            && (((message.GPS || {}).Latitude || {})._)
            && (((message.GPS || {}).Longitude || {})._)
            && ((message.Registration || {})._)
    });
};

let latestMessagesPerUnit = (messages) => {
    if (!messages && !messages.length) throw new Error('Invalid parameter: allmessages');
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
        createEntry('GPS Time', moment(feature.properties.lastupdate)) +
        createEntry('Altitude', `${(feature.properties.altitude || 'N/A')}  ${(feature.properties.altitudeunits || '')}`) +
        createEntry('Heading', `${(feature.properties.heading || 'N/A')}  ${(feature.properties.headingunits || '')}`) +
        createEntry('Speed', `${(feature.properties.speed || 'N/A')}  ${(feature.properties.speedunits || '')}`) +
        createEntry('Vehicle', feature.properties.vehicle) + createEntry('Vehicle Type', feature.properties.vehicletype);

};

module.exports = exports = {
    requestJsonData: requestJsonData,
    transformToGeoJson : transformToGeoJson,
    latestMessagesPerUnit : latestMessagesPerUnit,
    filterValidMessages: filterValidMessages,
    validResult: validResult
};

