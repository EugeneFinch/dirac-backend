/* eslint-disable no-undef */
const feathers = require('@feathersjs/feathers');
const puppeteer = require('puppeteer-extra');
const express = require('@feathersjs/express');
const configuration = require('@feathersjs/configuration');
const services = require('../../services');
const sequelize = require('../../sequelize');
const appHooks = require('../../app.hooks');
const moment = require('moment');

const app = express(feathers());

app.configure(configuration());
app.configure(sequelize);
app.configure(services);
app.hooks(appHooks);

// add stealth plugin and use defaults (all evasion techniques)
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(StealthPlugin());

const getRecordingName = (roomURL) => {
  if (roomURL.includes('meet.google.com')) {
    return 'Gmeet meeting';
  }
};

(async () => {
  // const roomURL = 'https://meet.google.com/pcd-tpqw-drr?pli=1&authuser=1';
  // const recordingId = 43;
  const roomURL = process.argv[2].split('=')[1];
  let recordingId = process.argv[3].split('=')[1];
  const calendarEventId = process.argv[4] ? process.argv[4].split('=')[1] : null;
  const userId = process.argv[5] ? process.argv[5].split('=')[1] : null;
  console.log(process.argv)
  if (calendarEventId) {
    const calendarEvent = await app.service('cronjob-calendar-event').get(calendarEventId)
    // 1 meaning joining, 2 meaning joined, 3 meaning denied
    // When joining or joined exit process
    if (calendarEvent.joined === 1 || calendarEvent.joined === 2 || calendarEvent.joined === 3) {
      return process.exit(1);
    }

    // meaning it's join first time -> set joined is 1 (1 meaning joining)
    await app.service('cronjob-calendar-event').patch(calendarEventId, { joined: 1 });
  }

  const browser = await puppeteer.launch({
    // headless: false,
    // executablePath: '/usr/bin/google-chrome',
    args: ['--use-fake-ui-for-media-stream'],
  });
  const page = await browser.newPage();
  try {
    console.log('start', moment().utc().toDate(), roomURL)
    await new Promise((res) => setTimeout(() => res(1), 2000))
    await page.goto('https://accounts.google.com/signin/v2/identifier');
    await new Promise((res) => setTimeout(() => res(1), 3000))
    // Wait for email input.
    await page.waitForSelector('#identifierId');
    // Keep trying email until user inputs email correctly.
    // This will error due to captcha if too many incorrect inputs.
    const email = 'alex@diracnlp.com';
    await page.type('#identifierId', email);
    await page.keyboard.press('Enter');
    await new Promise((res) => setTimeout(() => res(1), 3000))
    const noCapcha = await page.evaluate(() => document.getElementsByClassName('Wzzww eLNT1d').length);
    console.log('capcha', noCapcha)
    if (!noCapcha) {
      console.log('Error! Capcha found.');
      throw new Error('Capcha on page')
    }

    // const data1 = await page.evaluate(() => document.querySelector('*').outerHTML);

    // console.log(data1);
    await page.waitForSelector('#password input[type="password"]', { visible: true });
    console.log('Enter email');
    const password = 'alex2021!!';

    // Wait for password input
    await page.type('#password input[type="password"]', password);
    await page.keyboard.press('Enter');
    console.log('Enter password');
    await page.waitForNavigation();
    console.log('Logged in');
    await new Promise((res) => setTimeout(() => res(1), 3000))
    await page.goto(roomURL, { waitUntil: 'load' });
    console.log('Wait join Button');
    await new Promise((res) => setTimeout(() => res(1), 3000))
    const joinBtn = '//span[contains(.,"Ask to join") or contains(.,"Join now")]//parent::div';
    await page.waitForXPath(joinBtn, { visible: true, timeout: 10000 });
    await page.waitForTimeout(1000);
    const [button] = await page.$x(joinBtn);
    await button.click();
    console.log('click join Button');
    console.log(moment().utc().toDate(), roomURL)
    page.on('console', msg => {
      for (let i = 0; i < msg.args().length; ++i)
        console.log(`${i}: ${msg.args()[i]}`);
    });
    page.on('error', msg => {
      for (let i = 0; i < msg.args().length; ++i)
        console.log(`Error: ${msg.args()[i]}`);
    });
    page.on('response', req => {
      if (req.url() === 'https://meet.google.com/$rpc/google.rtc.meetings.v1.MeetingDeviceService/CreateMeetingDevice') {
        console.log('req', req.url());
        console.log('status', req._status);
      }
    });

    //Wait to allow join
    await page.waitForSelector('[data-self-name="You"]', { visible: true, timeout: 30000 }).catch(() => {
      throw new Error('Not allow to join meeting');
    });

    console.log('JOIN!', page.url());
    // meaning joined
    if (calendarEventId) {
      // set flag joined = 2
      await app.service('cronjob-calendar-event').patch(calendarEventId, { joined: 2 });
      const calendarEvent = await app.service('cronjob-calendar-event').get(calendarEventId)
      const attendees = JSON.parse(calendarEvent.attendees)
      const record = await app.service('recording').create({
        user_id: userId,
        status: 'RECORDING',
        account_name: attendees && attendees.length > 1 ? attendees.map(res => {
          if(!res.organizer) return res.email;
        }).filter(el => el)[0].toString().split('@')[1].split('.')[0] : '',
        deal_status: 'ip',
        subject: calendarEvent.summary,
        calendar_event_id: calendarEvent.id,
        filename: getRecordingName(roomURL),
        url: '',
      });
      recordingId = record.id;
    }

    var jquery_ev_fn = await page.evaluate(function () {
      return window.fetch('https://cdn.jsdelivr.net/npm/socket.io-client@2/dist/socket.io.js').then(function (res) {
        return res.text();
      });
    });
    await page.evaluate(jquery_ev_fn);
    console.log('befo evaluate')
    await page.evaluate(({ recordingId }) => {
      console.log('11111111111111111')
      return new Promise((resolve, reject) => {
        const TEN_SECOND = 10000;
        var socketio = io('http://localhost:3030');
        var d = new Date();
        const fileName = `${d.getMinutes()}-${d.getSeconds()}.weba`;
        const dataEvent = `data-${fileName}`;
        const endEvent = `end-${fileName}`;
        console.log('aaaaaaaaaa')
        socketio.on('connect', function () {
          console.log('connect')
          var interval = null;
          const ctx = new AudioContext();
          const dest = ctx.createMediaStreamDestination();
          var audios = document.querySelectorAll('audio');
          let streams = [];
          audios.forEach(a => { streams.push(a.captureStream()); });
          streams.map(stream => {
            console.log('create strem')
            ctx.createMediaStreamSource(stream).connect(dest);
          });
          const stream = new MediaStream(dest.stream.getTracks());
          
          var rec = new MediaRecorder(stream, { mimeType: 'audio/webm' });
          rec.start(TEN_SECOND);

          rec.ondataavailable = e => {
            socketio.emit(dataEvent, e.data);
          };

          rec.onstop = e => {
            console.log('stop');
            socketio.emit(endEvent, { file: fileName }, () => {
              console.log('clear');
              clearInterval(interval);
              socketio.disconnect(true);
              resolve('stop');
              return;
            });
          };

          rec.onerror = e => {
            console.log('e --->>', e);
            clearInterval(interval);
            socketio.disconnect(true);
            return reject(e);
          };

          socketio.emit('start', { file: fileName, recordingId });

          document.querySelector('[data-tooltip="Show everyone"]').click();
          interval = setInterval(() => {
            const totalPeopleNode = document.querySelectorAll('[aria-label=Participants] [role=listitem]');
            console.log('totalPeopleNode', totalPeopleNode.length);
            if (totalPeopleNode.length <= 1) {
              rec.stop();
            }

          }, TEN_SECOND);
        });



      });
    }, { recordingId });
    console.log('Stop simulator');
    await page.click('[data-tooltip="Leave call"]').catch(err => console.log('notfound [data-tooltip="Leave call"] button'));
    await page.close();
    await browser.close();
    process.exit(1);
  } catch (err) {
    if (calendarEventId) {
      const deniedText = '//div[contains(.,"denied your request to join")]';
      await page.waitForXPath(deniedText,{visible:true,timeout:5000}).then(async () => {
        console.log('denied by user');
        await app.service('cronjob-calendar-event').patch(calendarEventId, { joined: 3 });
      }).catch(async () => {
        console.log('user on call not response your bot request');
        await app.service('cronjob-calendar-event').patch(calendarEventId, { joined: 0 });
        console.log(calendarEventId);
      });
    }
    // handle close browser but popup ask to join not hide
    await page.goto('https://google.com');
    await browser.close();

    console.log('after browser close', err);
    return process.exit(1);
  } finally {
    await page.goto('https://google.com');
    await browser.close();
    return process.exit(1);
  }

})();
