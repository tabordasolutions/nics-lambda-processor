let processor = require('./processor');
let {dbconnectionparams, skyconnectparams} = require('./connections'); //default connections.
const moment = require('moment');

dbconnectionparams.passworddecrypted = true;
skyconnectparams.passworddecrypted = true;

processor.etlskyconnectdata(dbconnectionparams,skyconnectparams)
    .then(result => processor.prunestaledata(moment(result.timestamp).subtract(7, 'days'),dbconnectionparams))
    .then(result => console.log(result + ' Done.'))
    .catch(e => {
        console.error('Error during processing:', e);
        process.exit(1);
    });

