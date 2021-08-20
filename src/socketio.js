const fs = require('fs');
const axios = require('axios');
var FormData = require('form-data');
const path = require('path');
const uploadRecording = (recordingId,path)=>{
  const data = new FormData();
  data.append('file', fs.createReadStream(path));
  const config = {
    method: 'post',
    url: `http://localhost:3030/upload?recording_id=${recordingId}&APP_SECRET=bwvBIKT7Ia`,
    data : data,
    maxContentLength: Infinity,
    maxBodyLength: Infinity,
    headers: {'Content-Type': 'multipart/form-data;boundary=' + data.getBoundary()}
  };
  console.log('uploading');

  return axios(config)
    .then(function (response) {
      console.log(JSON.stringify(response.data));
    })
    .catch(function (error) {
      console.log(error);
    });

};

module.exports = function(io) {
  io.on('connection', function(socket) {
    console.log('connection');
    socket.on('start',function(data){
      const fileName  = data.file;
      const recordingId  = data.recordingId;
      if(!fileName) return;
      console.log('start', fileName);
      const filePath = path.join(__dirname,'../uploads',fileName);
      const writer = fs.createWriteStream(filePath);
      const dataEvent = `data-${fileName}`;
      const endEvent = `end-${fileName}`;

      socket.on(dataEvent, function (data) {
        writer.write(data);
        console.log(dataEvent);
      });

      console.log('endEvent: ' + endEvent);

      socket.on(endEvent, function (data,callback) {
        console.log(endEvent);
        writer.end();
        socket.removeAllListeners([dataEvent,endEvent]);
        console.log('callEndvent: ' + filePath);
        uploadRecording(recordingId,filePath);
        callback({status:'ok'});
      });
    });
  });


  io.on('disconnect', function(socket) {
    console.log('disconnect');
  });


};
