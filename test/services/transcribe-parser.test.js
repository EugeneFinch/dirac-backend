const assert = require('assert');
const app = require('../../src/app');

describe('\'transcribe-parser\' service', () => {
  it('registered the service', () => {
    const service = app.service('transcribe-parser');

    assert.ok(service, 'Registered the service');
  });
});
