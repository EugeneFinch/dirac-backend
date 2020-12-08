/* eslint-disable no-undef */
const puppeteer = require('puppeteer-extra');
 
// add stealth plugin and use defaults (all evasion techniques)
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(StealthPlugin());
(async() => {
  // const roomURL = 'https://meet.google.com/pcd-tpqw-drr?pli=1&authuser=1';
  // const recordingId = 43;

  const roomURL = process.argv[2].split('=')[1];
  const recordingId = process.argv[3].split('=')[1];
  const browser = await puppeteer.launch({
    args: [ ],
  });
  const page = await browser.newPage();
  try{
   
    await page.goto(roomURL, {waitUntil: 'load'});
    await page.waitForSelector('input',{visible:true,timeout:10000});
    await page.waitForTimeout(1000);
    // Type our query into the search bar
    await page.type('input','Dirac Agent', {delay: 100});
  
    // Submit form
    await page.keyboard.press('Enter');
  
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
  
    await page.evaluate(({recordingId}) => {
      return new Promise((resolve,reject)=>{
        const TEN_SECOND = 10000;
        var socketio = io('http://localhost:3030');
        var d = new Date();
        const fileName = `${d.getMinutes()}-${d.getSeconds()}.weba`;
        const dataEvent = `data-${fileName}`;
        const endEvent = `end-${fileName}`;
        socketio.on('connect', function() {
          var interval = null;
          const ctx = new AudioContext();
          const dest = ctx.createMediaStreamDestination();
          var audios = document.querySelectorAll('audio');
          let streams = [];
          audios.forEach(a=>{streams.push( a.captureStream() );});
          streams.map(stream => {
            ctx.createMediaStreamSource(stream).connect(dest);
          });

          const stream = new MediaStream(dest.stream.getTracks());

          var rec = new MediaRecorder(stream,{mimeType:'audio/webm'});
          rec.start(TEN_SECOND);

          rec.ondataavailable = e => {
            socketio.emit(dataEvent,e.data);
          };

          rec.onstop = e => {
            console.log('stop');
            socketio.emit(endEvent,{file:fileName},()=>{
              console.log('clear');
              clearInterval(interval);
              socketio.disconnect(true);
              resolve('stop');
              return;
            });
          };
  
          rec.onerror = e => {
            console.log('e --->>',e);
            clearInterval(interval);
            socketio.disconnect(true);
            return reject(e);
          };
  
          socketio.emit('start',{file:fileName,recordingId});
  
          document.querySelector('[data-tooltip="Show everyone"]').click();
          interval = setInterval(()=>{
            const totalPeopleNode = document.querySelectorAll('[aria-label=Participants] [role=listitem]');
            console.log('totalPeopleNode', totalPeopleNode.length);
            if(totalPeopleNode.length <=1){
              rec.stop();
            }
  
          },TEN_SECOND);
        });
  
  
        
      });    
    },{recordingId});
    console.log('Stop simulator');
    await page.click('[data-tooltip="Leave call"]').catch(err=>console.log('notfound [data-tooltip="Leave call"] button'));
    await browser.close();
    process.exit(1);
  }catch(err){
    console.log('err', err);
    await page.screenshot({path: 'error.png'});
    await browser.close();
    process.exit(1);
  }
  
})();