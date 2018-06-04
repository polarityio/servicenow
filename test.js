let chai = require('chai');
let assert = chai.assert;

let bunyan = require('bunyan');
let config = require('./config/config');
config.request.rejectUnauthorized = false;

let integration = require('./integration');
// uncomment to debug tests  
integration.startup(bunyan.createLogger({ name: 'Mocha Test'/*, level: bunyan.TRACE*/ }));

describe('Service Now integration', () => {
    let options;

    before(() => {
        options = {
            host: 'https://localhost:5555',
            username: 'username',
            password: 'password'
        };
    });

    function getEntities(type, value) {
        let isEmail = type === 'email';
        let types = type.indexOf('custom') > -1 ? type : undefined;
        return {
            type: type.split('.')[0],
            types: types,
            isEmail: isEmail,
            value: value
        };
    }

    describe('email lookups', () => {
        it('should handle request errors', (done) => {
            integration.doLookup(
                [getEntities('email', 'doesnt matter because the SSL fails')],
                { host: 'http://localhost:5555', username: 'asdf', password: 'asdf' },
                (err, results) => {
                    assert.isOk(err);
                    assert.equal(0, results.length);
                    done();
                });
        });

        it('should handle non-200 responses', (done) => {
            integration.doLookup([getEntities('email', 'invalidemail@baddomain.com')], options, (err, results) => {
                assert.isOk(err);
                assert.equal(0, results.length);
                done();
            });
        });

        it('should allow looking up users by email', (done) => {
            integration.doLookup([getEntities('email', 'lucius.bagnoli@example.com')], options, (err, results) => {
                assert.isNotOk(err);
                assert.equal(1, results.length);
                done();
            });
        });

        it('should allow looking up users by more emails', (done) => {
            integration.doLookup([getEntities('email', 'john.example@example.com')], options, (err, results) => {
                assert.isNotOk(err);
                assert.equal(1, results.length);
                done();
            });
        });

        it('should return user details', (done) => {
            integration.doLookup([getEntities('email', 'john.example@example.com')], options, (err, results) => {
                assert.equal('john.example@example.com', results[0].data.details.email);
                done();
            });
        });

        it('should lookup multiple entities', (done) => {
            integration.doLookup(
                [getEntities('email', 'john.example@example.com'),
                getEntities('email', 'lucius.bagnoli@example.com')],
                options,
                (err, results) => {
                    assert.equal('john.example@example.com', results[0].data.details.email);
                    assert.equal('lucius.bagnoli@example.com', results[1].data.details.email);
                    done();
                });
        });
    });

    describe('change lookups', () => {
        it('should allow looksups by change ids', (done) => {
            integration.doLookup([getEntities('custom.change', 'CHG0000001')], options, (err, results) => {
                assert.notOk(err);
                assert.equal(1, results.length);
                done();
            });
        });
    });

    describe('incident lookups', () => {
        it('should allow looksups by incident ids', (done) => {
            integration.doLookup([getEntities('custom.incident', 'INC0000001')], options, (err, results) => {
                assert.notOk(err);
                assert.equal(1, results.length);
                done();
            });
        });
    });
});
