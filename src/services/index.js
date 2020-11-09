const upload = require('./upload/upload.service.js');
const recording = require('./recording/recording.service.js');
const transcribeParser = require('./transcribe-parser/transcribe-parser.service.js');
const speaker = require('./speaker/speaker.service.js');
const transcript = require('./transcript/transcript.service.js');
// eslint-disable-next-line no-unused-vars
module.exports = function (app) {
  app.configure(upload);
  app.configure(recording);
  app.configure(transcribeParser);
  app.configure(speaker);
  app.configure(transcript);
};
