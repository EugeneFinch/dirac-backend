const assert = require('assert');
const app = require('../../src/app');

describe('\'calendar-event\' service', () => {
  it('registered the service', () => {
    const service = app.service('calendar-event');

    assert.ok(service, 'Registered the service');
  });
});
