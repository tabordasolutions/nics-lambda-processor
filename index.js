let skytracker = require('./skyconnecttracker');
let db = require('./db');
let {dbconnectionparams, skyconnectparams} = require('./connections'); //default connections.
const moment = require('moment');


let etlskyconnectdata = ({dboptions = dbconnectionparams, skyconnectoptions = skyconnectparams}) => new Promise((resolves,rejects) => {

    const username = skyconnectoptions.user;
    const password = skyconnectoptions.password;
    //let startTime = moment().subtract(1,'day');
    let timefilter = '';//`<Time><Start>${startTime.format()}</Start></Time>`;
    let newRequestsOnly = 'N';
    let requestparams = `?request=<Request xmlns=\'http://www.skyconnecttracker.com/SkyConnect XML Format Release 9\' RequestTime=\'${moment().format()}\' Server=\'Taborda1\'><Username>${username}</Username><Password>${password}</Password><DeliverData><newRecordsOnly>${newRequestsOnly}</newRecordsOnly><Format><TimeStamp>DateTime</TimeStamp></Format></DeliverData><Filter><Type>Position</Type>${timefilter}</Filter></Request>`;
    console.log('Requesting Primary service data from: ', skyconnectoptions.primaryhost);
    skytracker.requestJsonData(skyconnectoptions.primaryhost + requestparams)
        .then(result => {
            return processresult(result,dboptions);
        })
        .then(() => resolves())
        .catch(error => {
            console.log(`Error processing from primary server: ${error}`);
            console.log('Trying secondary server: ', skyconnectoptions.secondaryhost);
            skytracker.requestJsonData(skyconnectoptions.secondaryhost + requestparams)
                .then(result => {
                    return processresult(result,dboptions);
                })
                .then(() => resolves())
                .catch(e => rejects(e))
        })
});

let processresult = (result, dboptions) => {
    if (!skytracker.validResult(result))
        throw new Error('Invalid result found in data. Result:' + JSON.stringify(result));
    let latestmessages = skytracker.latestMessagesPerUnit(((result.SkyConnectData || {}).Message || []));
    let geoJsonResult = skytracker.transformToGeoJson(latestmessages);
    return db.upsertdb('kerncounty_avl', geoJsonResult.features, dboptions)
        .then(result => db.deleteRecordsBefore(result.timestamp,'kerncounty_avl', null))
        .then(result => console.log(result))
};

module.exports = {
    etlskyconnectdata: etlskyconnectdata
};