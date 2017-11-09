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
        .filter((message) => (message.Registration && message.GPS && message.GPS.Longitude && message.GPS.Latitude)) //required properties.
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

let latestMessagesPerUnit = (allmessages) => {
    if (!allmessages && !allmessages.length) throw new Error('Invalid parameter: allmessages');
    let vehicleMap = {};
    let validmessages = allmessages.filter((message) => (((message.GPS || {}).DateTime || {})._) && ((message.Registration || {})._));
    validmessages.sort((a,b) => {
        let dta = a.GPS.DateTime._, dtb = b.GPS.DateTime._;
        if (dta === dtb) return 0;
        return (moment(dta).isAfter(dtb)) ? 1 : 0;
    });

    return validmessages.filter((message) => {
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
    return createEntry('Name', feature.properties.name) +
        createEntry('Last Update', moment(feature.properties.lastupdate)) +
        createEntry('Altitude', `${(feature.properties.altitude || 'N/A')}  ${(feature.properties.altitudeunits || '')}`) +
        createEntry('Heading', `${(feature.properties.heading || 'N/A')}  ${(feature.properties.headingunits || '')}`) +
        createEntry('Speed', `${(feature.properties.speed || 'N/A')}  ${(feature.properties.speedunits || '')}`) +
        createEntry('Vehicle', feature.properties.vehicle) + createEntry('Vehicle Type', feature.properties.vehicletype);

};

module.exports = exports = {
    requestJsonData: requestJsonData,
    transformToGeoJson : transformToGeoJson,
    latestMessagesPerUnit : latestMessagesPerUnit,
    validResult: validResult
};

