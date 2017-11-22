const processor = require('./processor');
const secretsPromise = require('serverless-secrets/client').load(); //deployed with serverless.
const moment = require('moment');

let {dbconnectionparams, skyconnectparams} = require('./connections'); //default connections.

let handler = function(event, context, callback) {
    console.log('Checking Env Variables.');
    if ( dbconnectionparams.passworddecrypted && skyconnectparams.passworddecrypted ) {
        console.log('Calling etl process...');
        processor.etlskyconnectdata({dboptions: dbconnectionparams,skyconnectoptions: skyconnectparams})
            .then(result => processor.prunestaledata(moment(result.timestamp).subtract(7, 'days'),dbconnectionparams))
            .then(result => console.log(result + '. Done.'))
            .catch(e => {
                console.error('Error during processing:', e);
                callback(e);
            });
    } else {
        console.log('decrypting secrets...');
        secretsPromise.then(() => {
            console.log('decrypted secrets');
            dbconnectionparams.password = process.env.PGPASSWORD;
            dbconnectionparams.passworddecrypted = true;
            skyconnectparams.password = process.env.SKYCONNECTPASSWORD;
            skyconnectparams.passworddecrypted = true;
            processor.etlskyconnectdata(dbconnectionparams, skyconnectparams)
                .then(result => processor.prunestaledata(moment(result.timestamp).subtract(7, 'days'),dbconnectionparams))
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