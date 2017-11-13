let mainmodule = require('./index');
let {dbconnectionparams, skyconnectparams} = require('./connections'); //default connections.
const moment = require('moment');

let dbparams = {
    ...dbconnectionparams,
    passworddecrypted:true
};

let scparams = {
    ...skyconnectparams,
    passworddecrypted: true
};

mainmodule.etlskyconnectdata(dbparams,scparams)
    .then(timestamp => mainmodule.prunestaledata(moment(timestamp).subtract(7, 'days'),dbconnectionparams))
    .then(result => console.log(result + ' Done.'))
    .catch(e => {
        console.error('Error during processing:', e);
        process.exit(1);
    });

