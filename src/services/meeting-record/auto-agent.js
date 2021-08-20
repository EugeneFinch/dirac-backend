/* eslint-disable no-undef */
const feathers = require('@feathersjs/feathers');
const puppeteer = require('puppeteer-extra');
const express = require('@feathersjs/express');
const configuration = require('@feathersjs/configuration');
const services = require('../../services');
const sequelize = require('../../sequelize');
const appHooks = require('../../app.hooks');
const moment = require('moment');
const env = process.env.NODE_ENV || 'dev';

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
  console.log(process.argv);
  if (calendarEventId) {
    const calendarEvent = await app.service('cronjob-calendar-event').get(calendarEventId);
    // 1 meaning joining, 2 meaning joined

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
    console.log('start', moment().utc().toDate(), roomURL);
    await new Promise((res) => setTimeout(() => res(1), 2000));
    await page.goto('https://accounts.google.com/signin/v2/identifier');
    await new Promise((res) => setTimeout(() => res(1), 3000));
    // Wait for email input.
    await page.waitForSelector('#identifierId');
    // Keep trying email until user inputs email correctly.
    // This will error due to captcha if too many incorrect inputs.
    const email = env === 'dev' ? 'lex@diracnlp.com' : 'bot@diracnlp.com';

    await page.type('#identifierId', email);
    await page.keyboard.press('Enter');
    await new Promise((res) => setTimeout(() => res(1), 3000));
    const noCapcha = await page.evaluate(() => document.getElementsByClassName('Wzzww eLNT1d').length);
    console.log('capcha', noCapcha);
    if (!noCapcha) {
      console.log('Error! Capcha found.');
      throw new Error('Capcha on page');
    }

    // const data1 = await page.evaluate(() => document.querySelector('*').outerHTML);

    // console.log(data1);
    await page.waitForSelector('#password input[type="password"]', { visible: true });
    console.log('Enter email');
    const password = env === 'dev' ? 'dev2021!' : 'dirac2022';

    // Wait for password input
    await page.type('#password input[type="password"]', password);
    await page.keyboard.press('Enter');
    console.log('Enter password');
    await page.waitForNavigation();
    console.log('Logged in');

    await new Promise((res) => setTimeout(() => res(1), 3000));
    await page.goto(roomURL, { waitUntil: 'load' });
    console.log('Wait join Button');
    await new Promise((res) => setTimeout(() => res(1), 3000));
    const joinBtn = '//span[contains(.,"Ask to join") or contains(.,"Join now")]//parent::div';
    await page.waitForXPath(joinBtn, { visible: true, timeout: 10000 });
    await page.waitForTimeout(1000);
    const [button] = await page.$x(joinBtn);
    await button.click();
    console.log('click join Button');
    console.log(moment().utc().toDate(), roomURL);
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
    //
    await page.waitForSelector('[aria-label="Leave call"]', { visible: true, timeout: 30000 }).catch(() => {
      console.log('Not allow to join meeting');
      throw new Error('Not allow to join meeting');
    });

    console.log('JOIN!', page.url());
    // meaning joined
    if (calendarEventId) {
      // set flag joined = 2
      await app.service('cronjob-calendar-event').patch(calendarEventId, { joined: 2 });
      const calendarEvent = await app.service('cronjob-calendar-event').get(calendarEventId);
      const attendees = JSON.parse(calendarEvent.attendees);
      let orgDomain;
      let accountName;
      if(attendees && attendees.length > 1) {
        orgDomain = attendees.map(res => {
          if (res.organizer) return res.email;
        }).filter(el => el)[0].toString().split('@')[1];
        try {
          accountName = attendees.map(res => {
            if (!res.organizer && res.email.split('@')[1] !== orgDomain && res.email.split('@')[1] !== 'gmail.com') return res.email;
          }).filter(el => el)[0].toString().split('@')[1];
        } catch (e) {
          accountName = '';
        }

      }
      const record = await app.service('recording').create({
        user_id: userId,
        status: 'RECORDING',
        account_name: accountName ? accountName : '',
        deal_status: 'ip',
        subject: calendarEvent.summary ? calendarEvent.summary : 'Meeting Call',
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
    console.log('befo evaluate');

    const users = await page.evaluate(({ recordingId }) => {
      console.log('11111111111111111');
      return new Promise((resolve, reject) => {
        const TEN_SECOND = 10000;
        var socketio = io('http://localhost:3030');
        var d = new Date();
        const fileName = `${d.getMinutes()}-${d.getSeconds()}-${recordingId || 'from-gmail'}.weba`;
        const dataEvent = `data-${fileName}`;
        const endEvent = `end-${fileName}`;
        console.log('aaaaaaaaaa');
        let check;
        let interval;
        const users = {};
        const startTalkTime = +new Date();
        socketio.on('connect', function () {
          console.log('connect');
          clearInterval(check);
          clearInterval(interval);
          check = setInterval(() => {
            console.log('on check');
            const time = +new Date;
            console.time(time)
            // console.log('----------------------------------')
            Array.from(document.querySelectorAll('[aria-label=Participants] [role=listitem]')).map(elem => {
              const userName = elem.getElementsByClassName('ZjFb7c')[0].innerText;
              console.log('userName: ' + userName);

              if (userName === 'Dirac Notetaker') return;
              //const speakClassList = Array.from(elem.getElementsByClassName('IisKdb xD3Vrd BbJhmb YE1TS JeFzg MNVeFb kT2pkb')[0].classList);
              // const speakClassList = Array.from(elem.getElementsByClassName('IisKdb BbJhmb YE1TS')[0].classList);
              const speakClassList = Array.from(elem.getElementsByClassName('IisKdb u5mc1b BbJhmb YE1TS x9nQ6')[0].classList);

              if (!users[`${userName}`]) {
                console.log(`${userName}, ${speakClassList}`);
                users[`${userName}`] = {
                  name: userName,
                  silent: speakClassList.includes('gjg47c'),
                  speakTime: speakClassList.includes('gjg47c') ? [] : [{ start: +new Date - startTalkTime, end: 0 }],
                  // lastStatuses: []
                };
              }

              if (users[`${userName}`].silent !== speakClassList.includes('gjg47c')) {



                users[`${userName}`].silent = speakClassList.includes('gjg47c');
                console.log('users[`${userName}`].silent', users[`${userName}`].silent);
                if (users[`${userName}`].silent) {
                  const last = users[`${userName}`].speakTime.length;
                  if (last) users[`${userName}`].speakTime[last - 1].end = +new Date - startTalkTime;
                  console.timeEnd(time);
                  // stop
                } else {
                  users[`${userName}`].speakTime.push({ start: +new Date - startTalkTime, end: 0 });
                  console.timeEnd(time);
                  // start
                }
                // console.log(`${userName} ${users[`${userName}`].exists ? 'stop        talk' : 'start        talk'}`)
              }
              // } else {
              //   users[`${userName}`].lastStatuses.push(speakClassList.includes('gjg47c'))
              //   users[`${userName}`].lastStatuses = users[`${userName}`].lastStatuses.slice(Math.max(users[`${userName}`].lastStatuses.length - 20, 0))
              // }
              // console.timeEnd(time)
            });
          }, 300);
          setInterval(() => { console.log('users: ', users); }, 5000);
          const ctx = new AudioContext();
          const dest = ctx.createMediaStreamDestination();
          var audios = document.querySelectorAll('audio');
          let streams = [];
          audios.forEach(a => { streams.push(a.captureStream()); });
          streams.map(stream => {
            console.log('create strem');
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
              clearInterval(check);
              socketio.disconnect(true);
              resolve(users);
              return;
            });
          };

          rec.onerror = e => {
            console.log('e --->>', e);
            clearInterval(interval);
            clearInterval(check);
            socketio.disconnect(true);
            return reject(e);
          };

          socketio.emit('start', { file: fileName, recordingId });

          //document.querySelector('[data-tooltip="Show everyone"]').click();
          document.querySelector('[aria-label="Show everyone"]').click();
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
    console.log(users);
    await app.service('recording').patch(recordingId, { users_on_call: Object.keys(users).length, filename: JSON.stringify(users) });

    for (let name in users) {
      for(let time of users[name].speakTime){
        await app.service('speakers-data').create({
          user_name: users[name].name,
          recordingId,
          start: time.start / 1000,
          end: time.end / 1000
        });
      }
    }
    // users.map(res => {
    //   console.log('user: ', res);
    // })
    //await page.click('[data-tooltip="Leave call"]').catch(err => console.log('notfound [data-tooltip="Leave call"] button'));
    await page.click('[data-label="Leave call"]').catch(err => console.log('notfound [data-label="Leave call"] button'));
    await page.close();
    await browser.close();
    process.exit(1);
  } catch (err) {
    if (calendarEventId && err && err.message === 'Not allow to join meeting') {
      const deniedText = '//div[contains(.,"denied your request to join")]';
      await page.waitForXPath(deniedText,{visible:true,timeout:5000}).then(async () => {
        await app.service('cronjob-calendar-event').patch(calendarEventId, { joined: 3 });
      }).catch(async () => {
        console.log('user on call not response your bot request');
        await app.service('cronjob-calendar-event').patch(calendarEventId, { joined: 0 });
        await page.goto('https://google.com');
        await browser.close();
        return process.exit(1);
      });
    }
    // handle close browser but popup ask to join not hide
    await page.goto('https://google.com');
    await browser.close();
    console.log('after browser close');
    return process.exit(1);
  } finally {
    //await page.goto('https://google.com');
    await browser.close();
    return process.exit(1);
  }

})();
