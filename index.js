let skytracker = require('./skyconnecttracker');
let db = require('./db');
let {dbconnectionparams, skyconnectparams} = require('./connections'); //default connections.
const moment = require('moment');
const feedname = 'kerncounty_avl';

let etlskyconnectdata = (dboptions = dbconnectionparams, skyconnectoptions = skyconnectparams) => new Promise((resolves,rejects) => {

    const username = skyconnectoptions.user;
    const password = skyconnectoptions.password;
    //let startTime = moment().subtract(1,'day');
    //let timefilter = `<Time><Start>${startTime.format()}</Start></Time>`;
    let newRequestsOnly = 'N';
    let requestparams = `?request=<Request xmlns=\'http://www.skyconnecttracker.com/SkyConnect XML Format Release 9\' RequestTime=\'${moment().format()}\' Server=\'Taborda1\'><Username>${username}</Username><Password>${password}</Password><DeliverData><newRecordsOnly>${newRequestsOnly}</newRecordsOnly><Format><TimeStamp>DateTime</TimeStamp></Format></DeliverData><Filter></Filter></Request>`;
    console.log('Requesting Primary service data from: ', skyconnectoptions.primaryhost);
    skytracker.requestJsonData(skyconnectoptions.primaryhost + requestparams)
        .then(result => {
            return processresult(result,dboptions);
        })
        .then(result => resolves(result))
        .catch(error => {
            console.log(`Error processing from primary server: ${error}`);
            console.log('Trying secondary server: ', skyconnectoptions.secondaryhost);
            skytracker.requestJsonData(skyconnectoptions.secondaryhost + requestparams)
                .then(result => processresult(result,dboptions))
                .then(timestamp => resolves(timestamp))
                .catch(e => rejects(e))
        })
});

let processresult = (result, dboptions) => {
    if (!skytracker.validResult(result))
        throw new Error('Invalid result found in data. Result:' + JSON.stringify(result));
    let validmessages = skytracker.filterValidMessages((result.SkyConnectData || {}).Message || []);
    let latestmessages = skytracker.latestMessagesPerUnit(validmessages);
    let geoJsonResult = skytracker.transformToGeoJson(latestmessages);
    return db.upsertdb(feedname, geoJsonResult.features, dboptions)
};

let prunestaledata = (olderthan = moment().subtract(30,'days'), dboptions = dbconnectionparams) => {
    return db.deleteRecordsBefore(olderthan,feedname,dboptions)
};
module.exports = {
    etlskyconnectdata: etlskyconnectdata,
    prunestaledata : prunestaledata
};