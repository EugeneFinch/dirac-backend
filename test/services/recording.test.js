const assert = require('assert');
const app = require('../../src/app');

describe('\'recording\' service', () => {
  it('registered the service', () => {
    const service = app.service('recording');

    assert.ok(service, 'Registered the service');
  });
});
