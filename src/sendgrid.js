/* eslint-disable no-unused-vars */
const _ = require('lodash');
const sgMail = require('@sendgrid/mail');

const ADMIN_BOT_EMAIL = ['bot@diracnlp.com', 'lex@diracnlp.com'];
const ADMIN_SEND_EMAIL = 'hello@diracnlp.com';

class Service {
  constructor (options, app) {
    sgMail.setApiKey('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');
  }

  async sendAnalyzeMeeting({ data, emails, recordingId }) {
    const buildHTML = _.reduce(data, (result, { intent, answer, question }) => {
      return `${result}<br><p style="color:black"><b style="color:black">Question: ${intent}</b><br> Response: ${answer || ' '}</p>`;
    }, '');

    const promise = _.map(emails, v => !_.includes(ADMIN_BOT_EMAIL, v) && sgMail.send({
      to: v,
      from: ADMIN_SEND_EMAIL,
      subject: `[DIRAC] ANALYZE MEETING - ${recordingId}`,
      text: 'We are sending the analyze your previous meeting...',
      html: buildHTML,
    }));
    await Promise.all(promise);
  }
}

module.exports = function (options, app) {
  return new Service(options, app);
};
