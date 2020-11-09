const assert = require('assert');
const app = require('../../src/app');

describe('\'transcript\' service', () => {
  it('registered the service', () => {
    const service = app.service('transcript');

    assert.ok(service, 'Registered the service');
  });
});
