const assert = require('assert');
const app = require('../../src/app');

describe('\'mail-history\' service', () => {
  it('registered the service', () => {
    const service = app.service('mail-history');

    assert.ok(service, 'Registered the service');
  });
});
