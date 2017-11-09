let mainmodule = require('./index');
let {dbconnectionparams, skyconnectparams} = require('./connections'); //default connections.

let dbparams = {
    ...dbconnectionparams,
    passworddecrypted:true
};

let scparams = {
    ...skyconnectparams,
    passworddecrypted: true
};

mainmodule.etlskyconnectdata({dbparams,scparams})
    .then(() => console.log('Done.'))
    .catch(e => {
        console.error('Error during processing:', e);
    });

