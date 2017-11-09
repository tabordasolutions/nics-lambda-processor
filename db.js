const moment = require('moment-timezone');
const { Client } = require('pg');

let upsertdb = (feedname, features = [], connectionparams) => new Promise((resolves,rejects) =>{

    if (!feedname) throw new Error('Missing required parameter: feedname');
    if (!features) throw new Error('Missing required parameter: features');

    let AsOfDateLocalTZ = moment().tz("US/Pacific").format();
    let upsertrecord_querytext = 'Select upsert_geojson_avl_record($1, $2, $3, $4, $5)';
    const client = new Client(connectionparams);
    let begintransaction = client.query('BEGIN');
    let aborttransaction = client.query('ROLLBACK');
    let committransaction = client.query('COMMIT');
    let upsertrecords = features
        .filter((feature) => {
            return (feature.type === 'Feature' && feature.geometry.type === 'Point' && feature.properties !== null)
        })
        .map(({id, geometry, properties}) => client.query(upsertrecord_querytext, [feedname, id, AsOfDateLocalTZ,JSON.stringify(geometry), JSON.stringify(properties)]));

    console.log('Current Timestamp is: ', AsOfDateLocalTZ);
    console.log(`Total # of features: ${features.length}, Valid # of features: ${upsertrecords.length}`);
    //client connect() promise doesn't behave well, so using old school callback.
    client.connect((err) => {
        if (err) {
            rejects(new Error(`Could not connect to dbhost ${connectionparams.host}:${connectionparams.port} - ${err.message}`));
        }
        else {
            console.log('Connected to Db');
            //Start the work with chained promises.
            begintransaction
                .then(() => Promise.all(upsertrecords))
                .then(() => console.log(`Successfully processed ${upsertrecords.length} records`))
                .then(() => committransaction)
                .then(() => console.log(`Committed transaction`))
                .then(() => client.end())
                .then(() => console.log('Disconnected database client'))
                .then(() => resolves({ timestamp: AsOfDateLocalTZ}))
                .catch(e => {
                    console.error(`Error occurred during processing: ${e}`);
                    aborttransaction
                        .then(() => console.error('Aborted transaction'))
                        .catch((e) => console.error(`Error aborting transaction: ${e}`))
                        .then(() => {console.error('Disconnecting Client'); client.end();})
                        .catch((e) => console.error(`Error disconnecting client: ${e}`))
                        .then(() => rejects(e))
                })
        }
    })


});

let deleteRecordsBefore = (asofdatetime,feedname, connectionparams) => new Promise((resolves,rejects) => {
    if (!feedname || !asofdatetime) rejects(new Error('Invalid Argument(s)'));
    const client = new Client(connectionparams);
    client.connect((err) => {
        if (err) {
            throw err;
        }
        else {
            let returnmessage;
            client.query('BEGIN')
                .then(() => client.query('DELETE FROM geojson_point_feeds WHERE created_at < $1 AND feedname=$2', [asofdatetime,feedname]))
                .then(result => returnmessage = `Deleted ${result.rowCount} stale records.`)
                .then(() => client.query('COMMIT'))
                .then(() => client.end())
                .then(() => resolves(returnmessage))
                .catch(e => {
                    returnmessage = `Error occurred during processing: ${e}`;
                    client.end()
                        .then(() => rejects(e))
                        .catch(e => console.error(`Error disconnecting client: ${e}`))
                })
        }
    })


});

module.exports = {
    upsertdb : upsertdb,
    deleteRecordsBefore:deleteRecordsBefore
};
