const assert = require('assert');
const app = require('../../src/app');

describe('\'transcript-coaching\' service', () => {
  it('registered the service', () => {
    const service = app.service('transcript-coaching');

    assert.ok(service, 'Registered the service');
  });
});
