const assert = require('assert');
const app = require('../../src/app');

describe('\'transcribe\' service', () => {
  it('registered the service', () => {
    const service = app.service('transcribe');

    assert.ok(service, 'Registered the service');
  });
});
