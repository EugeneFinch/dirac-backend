const assert = require('assert');
const app = require('../../src/app');

describe('\'team-competitor\' service', () => {
  it('registered the service', () => {
    const service = app.service('team-competitor');

    assert.ok(service, 'Registered the service');
  });
});
