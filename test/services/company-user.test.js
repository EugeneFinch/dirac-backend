const assert = require('assert');
const app = require('../../src/app');

describe('\'company-user\' service', () => {
  it('registered the service', () => {
    const service = app.service('company-user');

    assert.ok(service, 'Registered the service');
  });
});
