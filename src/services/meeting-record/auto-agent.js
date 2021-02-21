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
    headless:true,
    args: [ '--use-fake-ui-for-media-stream' ],
  });
  const page = await browser.newPage();
  try{
    await page.goto('https://accounts.google.com/signin/v2/identifier', { waitUntil: 'networkidle2' });
    // Wait for email input.
    await page.waitForSelector('#identifierId');
    
    // Keep trying email until user inputs email correctly.
    // This will error due to captcha if too many incorrect inputs.
    const email = 'ai@diracnlp.com';
    await page.type('#identifierId', email);
    await page.keyboard.press('Enter');
    await page.waitForSelector('#password input[type="password"]',{visible:true});
    console.log('Enter email');
    const password = 'nhan2021!';
    // Wait for password input
    await page.type('#password input[type="password"]', password);
    await page.keyboard.press('Enter');
    console.log('Enter password');
    await page.waitForNavigation();
    console.log('Logged in');

    await page.goto(roomURL, {waitUntil: 'load'});
    console.log('Wait join Button');
    const joinBtn = '//span[contains(.,"Ask to join") or contains(.,"Join now")]//parent::div';
    await page.waitForXPath(joinBtn,{visible:true,timeout:10000});
    await page.waitForTimeout(1000);
    const [button] = await page.$x(joinBtn);
    await button.click();
    console.log('click join Button');
  
    page.on('console', msg => {
      for (let i = 0; i < msg.args().length; ++i)
        console.log(`${i}: ${msg.args()[i]}`);
    });
    page.on('error', msg => {
      for (let i = 0; i < msg.args().length; ++i)
        console.log(`Error: ${msg.args()[i]}`);
    });
    page.on('response', req => {
      if(req.url()==='https://meet.google.com/$rpc/google.rtc.meetings.v1.MeetingDeviceService/CreateMeetingDevice'){
        console.log('req',req.url());
        console.log('status',req._status);
      }
    });
    
  
    // Wait for search results page to load
    await page.waitForSelector('[data-loadingmessage]',{visible:true,timeout:30000});
    await page.waitForSelector('[data-loadingmessage]',{hidden:true,timeout:30000});
    const rejectXpath = '//div[text()[contains(.,"Someone in the call denied your request to join")] ]';
    const ele = await page.$x(rejectXpath);
    if(ele && ele.length >0 ){
      throw new Error('Reject to join meeting');
    }

    console.log('JOIN!', page.url());
  
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
    await browser.close();
    process.exit(1);
  }
  
})();