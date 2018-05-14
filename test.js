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

    describe('email lookups', () => {
        it('should handle request errors', (done) => {
            integration.doLookup(
                [{ value: 'doesnt matter because the SSL fails' }],
                { host: 'http://localhost:5555', username: 'asdf', password: 'asdf' },
                (err, results) => {
                    assert.isOk(err);
                    assert.equal(0, results.length);
                    done();
                });
        });

        it('should handle non-200 responses', (done) => {
            integration.doLookup([{ value: 'invalidemail@baddomain.com' }], options, (err, results) => {
                assert.isOk(err);
                assert.equal(0, results.length);
                done();
            });
        });

        it('should allow looking up users by email', (done) => {
            integration.doLookup([{ value: 'lucius.bagnoli@example.com' }], options, (err, results) => {
                assert.isNotOk(err);
                assert.equal(1, results.length);
                done();
            });
        });

        it('should allow looking up users by more emails', (done) => {
            integration.doLookup([{ value: 'john.example@example.com' }], options, (err, results) => {
                assert.isNotOk(err);
                assert.equal(1, results.length);
                done();
            });
        });

        it('should return user details', (done) => {
            integration.doLookup([{ value: 'john.example@example.com' }], options, (err, results) => {
                assert.equal('john.example@example.com', results[0].result[0].email);
                done();
            });
        });

        it('should lookup multiple entities', (done) => {
            integration.doLookup([{ value: 'john.example@example.com' }, { value: 'lucius.bagnoli@example.com' }], options, (err, results) => {
                assert.equal('john.example@example.com', results[0].result[0].email);
                assert.equal('lucius.bagnoli@example.com', results[1].result[0].email);
                done();
            });
        });
    });

    describe('change lookups', () => {
        xit('should allow looksups by change ids', (done) => {
            integration.doLookup([{ value: 'CHG0000036' }], options, (err, results) => {

            });
        });
    });
});
