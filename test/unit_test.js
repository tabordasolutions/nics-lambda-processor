'use strict';
const {expect} = require('chai');
const skyconnecttrackermodule = require('../skyconnecttracker');
const processormodule = require('../processor');

const testdata = require('./testdata');

describe('All Unit Tests', function() {
    describe('Skyconnect Module', function() {
        describe('RequestJsonData', function() {
            it('Should be a function', function() {
                expect(skyconnecttrackermodule.requestJsonData).to.be.a('function');
            });
        });
        describe('xmltojson', function() {
            it('Should be a function', function() {
                expect(skyconnecttrackermodule.xmltojson).to.be.a('function');
            });
            it('Should return a message object from xml with a single message.', function() {
                return skyconnecttrackermodule.xmltojson(testdata.skyconnect_response_single_message())
                    .then(result => expect(result.SkyConnectData.Message).to.be.an('object'));

            });
            it('Should return an array of message objects from xml with a multiple messages.', function() {
                return skyconnecttrackermodule.xmltojson(testdata.skyconnect_responsexml())
                    .then(result => expect(result.SkyConnectData.Message).to.be.an('array'));
            })
        });
        describe('getMessageArrayFromResult', function() {
            it('Should be a function', function() {
                expect(skyconnecttrackermodule.getMessageArrayFromResult).to.be.a('function');
            });
            it('Should return data array with a single message', function() {
                const result = testdata.valid_jsonfromxmlresult_singlemessage();
                let messages = skyconnecttrackermodule.getMessageArrayFromResult(result);
                expect(messages).to.be.an('array','result should be an array.');
                expect(messages.length).to.be.equal(1);
            });
            it('Should return data array with zero messages', function() {
                let messages = skyconnecttrackermodule.getMessageArrayFromResult({});
                expect(messages).to.be.an('array','result should be an array.');
                expect(messages.length).to.be.equal(0);
            });
            it('Should return data array with messages > 1', function() {
                const result = testdata.valid_jsonfromxmlresult_multiple_messages();
                let messages = skyconnecttrackermodule.getMessageArrayFromResult(result);
                expect(messages).to.be.an('array','result should be an array.');
                expect(messages.length).to.be.greaterThan(1);
            });
        });
        describe('LatestMessagesPerUnit', function() {
            it('Should be a function', function() {
                expect(skyconnecttrackermodule.latestMessagesPerUnit).to.be.a('function');
            });
        });
        describe('ValidResult', function() {
            it('Should be a function', function() {
                expect(skyconnecttrackermodule.validResult).to.be.a('function');
            });
        });
        describe('filterValidMessages', function() {
            it('Should be a function', function() {
                expect(skyconnecttrackermodule.filterValidMessages).to.be.a('function');
            })
        });
        describe('Filter all Valid Messages', function() {
            it('Should return multiple messages', function() {
                const data = testdata.valid_jsonfromxmlresult_multiple_messages();
                let validmessages = skyconnecttrackermodule.filterValidMessages(skyconnecttrackermodule.getMessageArrayFromResult(data));
                expect(validmessages).to.be.an('array','result should be an array.');
                expect(validmessages.length).to.equal(236);
            });
            it('Should return single message', function() {
                const data = testdata.valid_jsonfromxmlresult_singlemessage();
                let validmessages = skyconnecttrackermodule.filterValidMessages(skyconnecttrackermodule.getMessageArrayFromResult(data));
                expect(validmessages).to.be.an('array','result should be an array.');
                expect(validmessages.length).to.equal(1);
            });
            it('Should throw an error on undefined message', function() {
                expect(skyconnecttrackermodule.filterValidMessages.bind(skyconnecttrackermodule,undefined)).to.throw('Invalid parameter - messages must be an array. Found:undefined');
            });
            it('Should throw an error on null message', function() {
                expect(skyconnecttrackermodule.filterValidMessages.bind(skyconnecttrackermodule,null)).to.throw('Invalid parameter - messages must be an array. Found:null');
            });
            it('Should throw an error on empty object message', function() {
                expect(skyconnecttrackermodule.filterValidMessages.bind(skyconnecttrackermodule,{})).to.throw('Invalid parameter - messages must be an array. Found:{}');
            });
            it('Should throw an error on empty string message', function() {
                expect(skyconnecttrackermodule.filterValidMessages.bind(skyconnecttrackermodule,'')).to.throw('Invalid parameter - messages must be an array. Found:');
            });
        });
        describe('Filter to only latest message from units', function() {
            it('Should return data array with length = 2', function() {
                const validmessages = testdata.valid_messages();
                let filtered = skyconnecttrackermodule.latestMessagesPerUnit(validmessages);
                expect(filtered).to.be.an('array','result should be an array.');
                expect(filtered.length).to.be.equal(2);
                expect(filtered[0].Registration._).to.be.equal('N408KC');
                expect(filtered[0].GPS.DateTime._).to.be.equal('2017-10-30T19:46:11+00:00');
                expect(filtered[1].Registration._).to.be.equal('N407KC');
                expect(filtered[1].GPS.DateTime._).to.be.equal('2017-10-30T18:19:31+00:00');
            });
            it('Should throw an error on undefined message', function() {
                expect(skyconnecttrackermodule.latestMessagesPerUnit.bind(skyconnecttrackermodule,undefined)).to.throw('Invalid parameter - messages must be an array. Found:undefined');
            });
            it('Should throw an error on null message', function() {
                expect(skyconnecttrackermodule.latestMessagesPerUnit.bind(skyconnecttrackermodule,null)).to.throw('Invalid parameter - messages must be an array. Found:null');
            });
            it('Should throw an error on empty object message', function() {
                expect(skyconnecttrackermodule.latestMessagesPerUnit.bind(skyconnecttrackermodule,{})).to.throw('Invalid parameter - messages must be an array. Found:{}');
            });
            it('Should throw an error on empty string message', function() {
                expect(skyconnecttrackermodule.latestMessagesPerUnit.bind(skyconnecttrackermodule,'')).to.throw('Invalid parameter - messages must be an array. Found:');
            });
        });
        describe('Validate json result', function() {
            it('Should return valid result', function() {
                const data = testdata.valid_jsonfromxmlresult_multiple_messages();
                let valid = skyconnecttrackermodule.validResult(data);
                expect(valid).to.be.true;
            });
        });
        describe('Transform Latest messages to GeoJson', function() {
            it('Should return a FeatureCollection with 2 features and EPSG:4326 projection', function() {
                let geoJsonResult = skyconnecttrackermodule.transformToGeoJson(testdata.filtered_latestmessages());
                expect(geoJsonResult).to.be.an('object');
                expect(geoJsonResult.type).to.be.equal('FeatureCollection');
                expect(geoJsonResult.crs.properties.name).to.be.equal('EPSG:4326');
                expect(geoJsonResult.features.length).to.equal(2);

            });
        });

    });
    describe('Processor Module', function() {
        describe('swaphosts', function() {
            it('Should be a function', function() {
                expect(processormodule.swaphosts).to.be.a('function');
            });
            it('Should swap primary and seconday hosts', function() {
                let testdata = {primaryhost: "primaryhost", secondaryhost: "secondaryhost"};
                processormodule.swaphosts(testdata);
                expect(testdata.primaryhost).to.equal('secondaryhost');
                expect(testdata.secondaryhost).to.equal('primaryhost');
            });
        });

    })
});