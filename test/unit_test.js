'use strict';
const {expect} = require('chai');
const themodule = require('../skyconnecttracker');
const testdata = require('./testdata');

describe('All Unit Tests', function() {
    describe('Skyconnect Module', function() {
        describe('RequestJsonData', function() {
            it('Should be a function', function() {
                expect(themodule.requestJsonData).to.be.a('function');
            });
        });
        describe('LatestMessagesPerUnit', function() {
            it('Should be a function', function() {
                expect(themodule.latestMessagesPerUnit).to.be.a('function');
            });
        });
        describe('ValidResult', function() {
            it('Should be a function', function() {
                expect(themodule.validResult).to.be.a('function');
            });
        });
        describe('Filter Latest Units tests', function() {
            it('Should return data array with length greater than zero', function() {
                const data = testdata.valid_jsonfromxmlresult();
                let filtered = themodule.latestMessagesPerUnit(data.SkyConnectData.Message);
                expect(filtered).to.be.an('array','result should be an array.');
                expect(filtered.length).to.be.greaterThan(0);
            });
        });
        describe('Validate json result', function() {
            it('Should return valid result', function() {
                const data = testdata.valid_jsonfromxmlresult();
                let valid = themodule.validResult(data);
                expect(valid).to.be.true;
            });
        });
        describe('Transform Latest messages to GeoJson', function() {
            it('Should return an object', function() {
                let geoJsonResult = themodule.transformToGeoJson(testdata.filtered_latestmessages());
                expect(geoJsonResult).to.be.an('object');
            });
        });

    });
    //TODO: mock the db module and make tests.
});