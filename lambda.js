let mainmodule = require('./index');
const secretsPromise = require('serverless-secrets/client').load(); //deployed with serverless.

let {dbconnectionparams, skyconnectparams} = require('./connections'); //default connections.

let handler = function(event, context, callback) {
    if ( dbconnectionparams.passworddecrypted && skyconnectparams.passworddecrypted ) {
        mainmodule.etlskyconnectdata({dboptions: dbconnectionparams,skyconnectoptions: skyconnectparams})
            .then(() => console.log('Done.'))
            .catch(e => {
                console.error('Error during processing:', e);
                callback(e);
            });
    } else {

        secretsPromise.then(() => {
            dbconnectionparams.password = process.env.PGPASSWORD;
            dbconnectionparams.passworddecrypted = true;
            skyconnectparams.password = process.env.SKYCONNECTPASSWORD;
            skyconnectparams.passworddecrypted = true;
            mainmodule.etlskyconnectdata({dboptions: dbconnectionparams,skyconnectoptions: skyconnectparams})
                .then(() => console.log('Done.'))
                .catch(e => {
                    console.error('Error during processing:', e);
                    callback(e);
                });
        }).catch(err => {
            callback(err);
        });
    }
};

module.exports = exports = {
    handler: handler
};