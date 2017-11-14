'use strict';
const {expect} = require('chai');
const themodule = require('../skyconnecttracker');
const moment = require('moment');
const testdata = require('./testdata');
const db = require('../db');
const testparams = require('../connections');

const username = testparams.skyconnectparams.user;
const password = testparams.skyconnectparams.password;

let skytrackertemplateurl = `https://www.skyconnecttracker.us/xml/service1.asmx/XmlResponse?request=<Request xmlns=\'http://www.skyconnecttracker.com/SkyConnect XML Format Release 9\' RequestTime=\'${moment().format()}\' Server=\'Taborda1\'><Username>${username}</Username><Password>${password}</Password><DeliverData><newRecordsOnly>N</newRecordsOnly><Format><TimeStamp>DateTime</TimeStamp></Format></DeliverData></Request>`;

describe('All Integration Tests', function() {
    describe('Skyconnect Module', function() {
        describe('Request Skytracker Json Data', function() {
            it('Should return a result', function() {

                return themodule.requestJsonData(skytrackertemplateurl)
                    .then((result) => expect(result).to.be.an('object', 'result should be an object.'))
            })

        });
        describe('Bad url tests', function() {
            it('Should fail with a bad url', function() {
                return themodule.requestJsonData('https://www.skyconnecttracker.us/xml/service')
                    .then((result) => expect(result).to.be.null)
                    .catch((err) => expect(err).to.be.an('object', 'Error should be an object.'))
            })
        });


    });
    describe('Db Integration', function() {
        describe('Upsert data test records.', function() {
            it('Should succeed with 2 records', function() {
                let data = testdata.valid_geojson();
                return db.upsertdb('test', data.features, testparams.dbconnectionparams)
                    .then((result) => {
                        expect(result).to.be.an('object').that.has.property('timestamp');
                    })
            })
        });
        describe('Remove data tests', function() {
            it('Should successfully remove test records', function() {
                return db.deleteRecordsBefore(moment(),'test', testparams.dbconnectionparams)
                    .then( result => expect(result).to.be.a('string'));
            })
        });
    });
});