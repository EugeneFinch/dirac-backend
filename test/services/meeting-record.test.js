const assert = require('assert');
const app = require('../../src/app');

describe('\'meeting-record\' service', () => {
  it('registered the service', () => {
    const service = app.service('meeting-record');

    assert.ok(service, 'Registered the service');
  });
});
