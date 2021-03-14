const assert = require('assert');
const app = require('../../src/app');

describe('\'transcript-export\' service', () => {
  it('registered the service', () => {
    const service = app.service('transcript-export');

    assert.ok(service, 'Registered the service');
  });
});
