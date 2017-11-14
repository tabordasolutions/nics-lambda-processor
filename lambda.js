const processor = require('./processor');
const secretsPromise = require('serverless-secrets/client').load(); //deployed with serverless.
const moment = require('moment');

let {dbconnectionparams, skyconnectparams} = require('./connections'); //default connections.

let handler = function(event, context, callback) {
    if ( dbconnectionparams.passworddecrypted && skyconnectparams.passworddecrypted ) {
        processor.etlskyconnectdata({dboptions: dbconnectionparams,skyconnectoptions: skyconnectparams})
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
            processor.etlskyconnectdata(dbconnectionparams, skyconnectparams)
                .then(timestamp => processor.prunestaledata(moment(timestamp).subtract(7, 'days'),dbconnectionparams))
                .then(result => console.log(result + '. Done.'))
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