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
  await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 11_2_0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/88.0.4324.182 Safari/537.36');
  await page.setExtraHTTPHeaders({
    // 'Accept-Language' : '"en-US,en;q=0.9",',
    // 'x-goog-meeting-rtcclient': 'CAEQqgMYASABKAg=',
    'x-goog-meeting-botguardid': '!LyylLGDNAAXRs2QT0ULCf1YPwGz5PzsAKQAjCPxGvtf51gTLViaQkyTLXLyjD9hLJdqO_U1nev7rGLwWgV44bdNqAgAAAFpSAAAAUA8AAxYRmWgBB5kINGzxLVJsnmN3uu1kIHD2iH8JiOrBXUzmpCPMaXLbDBCOdDHSZcd-s0UMa-kPx3Zx8V0uCe_xMZ75gMOWC8EP2MPUqUe1TNog_XBWzhDa89TpvAaKOjegQZ6_3WO-QgrT07NZzSffIoJX3uyM_hYgALCSNOltfRE9mBXZXAUoxdRpHt1sr0EzqckDKTAVyk2It7zyaETUQZNYZIAF9Stfhr_7RcdZqZakyL_qJBcAlUxPQhNIekl6qmO6Ux9QUEyo7wLXopUKk-u3bSdd1Y45aAJBQKQh_Z1JWhfltFUxzw8Lr9nTf4VDsI8syxV2e44xBxQBlVGs9QGdGoJLgLZDBF1X6EmLeU2qeXjxB_6EHL0CMIzur1BH6N47Tk2i309jxZ_vRMeM6dddPuE17WOydmWXGHAP5kCd13AE-xtsiiDG3upi9h5P_IANV2x2i5uC0TuqWPmT2g8CMPnsQhifanjEcHqtwTmfSezFI9SdFr9Rmf1Ws5kcQHl27pJlCtpjNfF3THJhf1tGnj9FpZVdkzkdxA1LIDV1lhmOTKv-BeEPs3Zs-YAG1ptrYsrkccl6Mkw9gFh4VRpS1ogxjp4S0yHp5MMjaqDSFZr39bAZYQ21c4GvlACdPQ0yyNTZrTTinowSMENgLqU8nSEMXO6VXyoBi0tGpsl2N78b4vkurBjcJmVauw2X_hBlnMcSoTYmjYT02-Aal4tlOe1D4-Euhs2e9GSFyBJ3_dI3e4hn7JX6G4L2cEYvJpofBQ-68FFZa_aTt7zMGN3iQhnbWhik4EBL-Sa_6SZkmuXjCrSU11TRe_rGcofJL-4Xzij9IUkwUFTvTAHPwMQcXH8bly8M1bR9Dc_2lFtZslQBAF4P-HnMPQVqHBmD0E1FUcKaAsGrD9EFykoy5AUTgbURq66sTT4DVRbAVeL7fUHjKhEaNJsRNMElbZosHyDRm2QNlCzAesL-vUD-ZZi52v3uIw77fhpjuZp7KDPXo-6fM-ldX3VpIUqobcDJKxMzhaCpc9vRk6B44ajDJzSWm-PC322FlkCJLHDwufDWRURuHseSF8kKdq8Jt1FJFYqZf2eEtACRBX8GR_ZBbYo2ty0B5DZBZrJb81liPYCwXFPsFwSC2V8alcFV8IrI2dEkM0BYgRc0TKsHRyRGT7j2BCR96dE5owrVdkyx2EBzINaisUVrb6B2TMKZpZqVlbqpBctRa0pwiJxhRzNr2do3jg4quiDFPN8nv3d6Vy3AI8m5EqLNr1aadHLQhY7QyWJ-8cClhVzzsUPR0W38dfqeM7jJddD4wF18AWjh7VZV8NuRQRovrhv3F90DUGanT38K9_04eLxWNabRe-rOSqkNF1KycgjOsTod-ampQjvNMp24CJPcfE5r1aQlgAFj0ccEmiD_-Wc6rDaXsqLsSTDRIMXeusBbhnx_0d4lYHlP6p8K_rs6-mqvPe2cdGBtE7pVFJUkFrtfIdZZ5pAN32M85INtrnKkd8WedA9CfRI9BGtC2xqqPQRufci-3wqVzbmG32yBNZ4h2LBimvtFgQ5XdqpOH5Fhn5t_ZLQrdxGRD89DrRXqXtp4Ue-ssOVb_QMDhWn0UPmeZbhCCPTKdbOblkVTiL4JF2AXstqlLBuxdtR-qxTXGV1HSZTZe3uigwYYo8nKSYEGIHFY8o0WiAA1vkpsMQWjq4dNlFyiQXEd28TVZdgSLReosru7JRhtgm9-Kg5SAj1m3F6WD1DjfAd4p9dyoGVRlzEk_yiNQ-sxaF6NVULg0kXi_nYib2NQ2-NQz7xuomAe0JfAU5naSH8gwOhuRh8hCXbv-2N5MDKS7M2jBo0ZxZe8s7FVm2pGucr9LDIFDUCYS9CwjzX5jM9bVPJ3CkfWEWjxqFUisKLXQAK2zqABeLNKtyjti8BWz_BwvcOgGmU3gf5Djej-px-vjPeQWcURUn3nWFZxtK9inckgCj816dk2uZQ1LTOD34G19lfBGQDzNpZMPj7XpuB9NnHfY8X1wjRXVZi7SI0NYnDHDzyNX4ElS1rcdI2s3yehgvCdzKuyB1aDESt65_NAuoo4RRbHwC013mVryYwK_jwP2trug-jJmMYBz9Rrf5I09fsXJvSCpGO1kha0ECeqW79DLScSLUQgXaGoMps-LYOwYz69c2AM-K66c9ICbaSkGW5hrqOvk12OJfiAqVAyb0eSO31F6kIpVOS0UJRRfSAb8pJ9hJceweQ3IZ_OIqrko7QM_jkuw5aMVwu_l-CDFo6WuwVAua2ijUet195u9OETIGK4-mT_IObFDA-9WmqVaHUMaNsNfTf1EZMjpcMrGG_fHf0AncRO70xClPXEtSXuGFFDwfYSRaarwdpVcyOAuFsIEuhCn-F5sjTu4xFAVRa2Eptd4jyV2Mb5yUhDRFVVhTqW1Lbxl_ZLXuEmEeO3Fmz9XOF8G2wo6MxGcFjvtTLGuHW3UmHZU4rbZSekjQ3YKI4593ZU4bfcegte4RK-rQkuvRMjWQPV0kCc-VlCADqUV1exRpatmPKeAP7tV2hOn9H3kES4Fz7-1SEHWf-n8muaNjcY73B0CBgjfrNOREuNOuNEMaZSUSciigzfpg99imb32zoX4pAZ-fwv69qhl72i7QYg4siq_Bo-QUuvNdTUOkIbVF9kFLVljqsjrtph5JrBrQ8OHBr-IzTx4wf9FXtkXhPiE0rivh78AJ-ABxHc-Fgh3wqP3Y1vMt7iTAHj0bglq0AbSqK3f_ejqKnXOj_nPRPjSLI8FVhuTV6DfwCuLH62QsIwhkNLS359Fobrqf77p4ZXeGJQmw'
  });
  try{
   
    await page.goto(roomURL, {waitUntil: 'load'});
    await page.waitForSelector('input',{visible:true,timeout:10000});
    await page.waitForTimeout(1000);
    // Type our query into the search bar
    await page.type('input','Dirac Agent', {delay: 100});
  
    // Submit form
    await page.keyboard.press('Enter');
  
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
    
    await page.screenshot({path: '2.png'});
  
    // Wait for search results page to load
    await page.waitForSelector('[data-loadingmessage]',{visible:true,timeout:30000});
    await page.waitForSelector('[data-loadingmessage]',{hidden:true,timeout:30000});
    console.log('JOIN!', page.url());
    await page.screenshot({path: 'join.png'});
  
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