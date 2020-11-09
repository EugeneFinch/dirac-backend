const assert = require('assert');
const app = require('../../src/app');

describe('\'speaker\' service', () => {
  it('registered the service', () => {
    const service = app.service('speaker');

    assert.ok(service, 'Registered the service');
  });
});
