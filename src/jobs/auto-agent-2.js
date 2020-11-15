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

  await page.exposeFunction('RecordRTC', require('recordrtc/RecordRTC'));
  await page.exposeFunction('io', require('socket.io-client/dist/socket.io'));
  await page.exposeFunction('ss', require('socket.io-stream'));


  await page.evaluate(() => {
    return new Promise((resolve,reject)=>{
      let chunks = [];
      var audio = document.querySelector('audio');
      // here we will save all the chunks of our record
      // wait for the original media is ready
      audio.volume = 0.5; // just for your example
      // FF still does prefix this unstable method
      var stream = audio.captureStream ? audio.captureStream() : audio.mozCaptureStream();
      // create a MediaRecorder from our stream
      var rec = new MediaRecorder(stream,{mimeType:'audio/webm'});
      // every time we've got a bit of data, store it
      rec.ondataavailable = e => chunks.push(e.data);
      // once everything is done
      rec.onstop = e => {
        // audio.pause();
        // concatenate our chunks into one file
        console.log('stop');
        final = new Blob(chunks, { type: 'audio/webm'});
        file = new File([final],'a.weba',{
          type: 'audio/webm',
        });
        var formData = new FormData();
        formData.append('file', file,'a.weba');
        var request = new XMLHttpRequest();
        request.open('POST', 'http://localhost:3030/upload');
        request.send(formData);

      };
      rec.onerror = e => {
        console.log('e --->>',e);
      };
      rec.start();
      // record for 6 seconds
      setTimeout(() => rec.stop(), 6000);
    });    
  });
  await page.screenshot({path: 'join.png'});

 

})();