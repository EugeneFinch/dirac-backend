
module.exports = function(io) {
  io.on('connection', function(socket) {
    console.log('connection');
    socket.on('start',function(data){
      const fileName  = data.file;
      if(!fileName) return;
      console.log('start', fileName);
      const writer = fs.createWriteStream(fileName);
      const dataEvent = `data-${fileName}`;
      const endEvent = `end-${fileName}`;

      socket.on(dataEvent, function (data) {
        writer.write(data);
        console.log(dataEvent);
      });
      socket.once(endEvent, function (data) {
        writer.end();
        socket.removeAllListeners([dataEvent,endEvent]);
        console.log(endEvent);
      });
    });
  });
};