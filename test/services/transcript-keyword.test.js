const assert = require('assert');
const app = require('../../src/app');

describe('\'transcript-keyword\' service', () => {
  it('registered the service', () => {
    const service = app.service('transcript-keyword');

    assert.ok(service, 'Registered the service');
  });
});
