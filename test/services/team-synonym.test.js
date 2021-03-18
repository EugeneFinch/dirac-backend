const assert = require('assert');
const app = require('../../src/app');

describe('\'team-synonym\' service', () => {
  it('registered the service', () => {
    const service = app.service('team-synonym');

    assert.ok(service, 'Registered the service');
  });
});
