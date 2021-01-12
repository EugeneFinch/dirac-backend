const assert = require('assert');
const app = require('../../src/app');

describe('\'transcript-keyword-recap-config\' service', () => {
  it('registered the service', () => {
    const service = app.service('transcript-keyword-recap-config');

    assert.ok(service, 'Registered the service');
  });
});
