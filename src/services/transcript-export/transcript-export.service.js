// Initializes the `transcript-export` service on path `/transcript-export`
const { TranscriptExport } = require('./transcript-export.class');
const hooks = require('./transcript-export.hooks');
const docx = require('docx');
const { Document, Packer, Paragraph,TextRun } = docx;

module.exports = function (app) {
  const options = {
    paginate: app.get('paginate')
  };

  // Initialize our service with any options it requires
  app.use('/transcript-export', 
    new TranscriptExport(options, app),
    async (req,res)=>{
      const result = res.data;
      const doc = new Document();

      doc.addSection({
        properties: {},
        children: result.map(v=>(new Paragraph({
          children: [new TextRun(`${v.speaker_name}: `), new TextRun(v.content)]
        }))),
      });

      const b64string = await Packer.toBase64String(doc);
    
      res.setHeader('Content-Disposition', 'attachment; filename=transcript.docx');
      res.send(Buffer.from(b64string, 'base64'));
  
    // res.type('csv');
    // res.end(csv);
    });

  // Get our initialized service so that we can register hooks
  const service = app.service('transcript-export');

  service.hooks(hooks);
};
