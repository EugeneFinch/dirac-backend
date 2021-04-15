const createService = require('./analytics-talk-to-listen.class.js');
const hooks = require('./analytics-talk-to-listen.hooks');

const excel = require('node-excel-export');


module.exports = function (app) {
  const options = [];
  // Initialize our service with any options it requires

  app.use('/analytics-talk-to-listen-export', createService(options, app),
    async (req,res)=>{
      const { result, team = 'default'} = res.data;

      const headerStyle = {
        font: {
          bold: true,
        }
      };

      const cellStyle = {
        alignment: {
          vertical: 'middle',
          horizontal: 'center'
        }
      };

      const specification = {
        name:{
          displayName: 'Rep name',
          headerStyle: headerStyle,
          width: '20'
        },
        talk_ratio: {
          displayName: 'Talk',
          headerStyle: headerStyle,
          cellStyle: cellStyle,
          width: '20'
        },
        listen_ratio: {
          displayName: 'Listen',
          headerStyle: headerStyle,
          cellStyle: cellStyle,
          width: '20'
        }
      };

      const report = excel.buildExport(
        [
          {
            name: team + '_talktolisten',
            specification: specification,
            data: result
          }
        ]
      );

      res.attachment('reporting-dirac.xlsx');
      return res.send(report);
    });

  const service = app.service('analytics-talk-to-listen-export');
  service.hooks(hooks);
};
