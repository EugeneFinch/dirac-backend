/* eslint-disable no-undef */
const puppeteer = require('puppeteer-extra');
 
// add stealth plugin and use defaults (all evasion techniques)
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(StealthPlugin());

(async() => {

  const browser = await puppeteer.launch({
    args: [ '--use-fake-ui-for-media-stream' ],
  });
  const page = await browser.newPage();
  await page.goto('https://meet.google.com/pcd-tpqw-drr?pli=1&authuser=1', {waitUntil: 'load'});
  await page.waitForSelector('input',{visible:true,timeout:10000});

  // Type our query into the search bar
  await page.type('input','puppeteer');

  // Submit form
  await page.keyboard.press('Enter');
  await page.click('[data-is-muted]');

  // Wait for search results page to load
  await page.waitForSelector('[data-loadingmessage]',{visible:true,timeout:30000});
  await page.waitForSelector('[data-loadingmessage]',{hidden:true,timeout:30000});
  console.log('JOIN!', page.url());
  // await page.screenshot({path: 'join.png'});
  page.on('console', msg => {
    for (let i = 0; i < msg.args().length; ++i)
      console.log(`${i}: ${msg.args()[i]}`);
  });
  page.on('error', msg => {
    for (let i = 0; i < msg.args().length; ++i)
      console.log(`Error: ${msg.args()[i]}`);
  });

  var jquery_ev_fn = await page.evaluate(function(){
    return window.fetch('https://cdn.jsdelivr.net/npm/socket.io-client@2/dist/socket.io.js').then(function(res){
      return res.text();
    });
  });
  await page.evaluate(jquery_ev_fn);

  await page.evaluate(() => {
    return new Promise((resolve,reject)=>{
      var socketio = io('http://localhost:3030');
      var d = new Date();
      const fileName = `${d.getMinutes()}-${d.getSeconds()}.weba`;
      const dataEvent = `data-${fileName}`;
      const endEvent = `end-${fileName}`;
      socketio.on('connect', function() {
        var audio = document.querySelector('audio');
        var stream = audio.captureStream ? audio.captureStream() : audio.mozCaptureStream();
        var rec = new MediaRecorder(stream,{mimeType:'audio/webm'});
        rec.ondataavailable = e => {
          socketio.emit(dataEvent,e.data);
        };
        // once everything is done
        rec.onstop = e => {
          console.log('stop');
          socketio.emit(endEvent,{file:fileName});
          return resolve('stop');
        };
        rec.onerror = e => {
          console.log('e --->>',e);
          socket.disconnect(true);
          return reject(e);
        };

        socketio.emit('start',{file:fileName});
        rec.start();
        setTimeout(()=>rec.stop(),5000);
      });


      
    });    
  });
  console.log('Stop simulator');
  process.exit(1);
 

})();