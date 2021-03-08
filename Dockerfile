FROM node:14-alpine
WORKDIR app
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser

COPY package.json yarn.lock ./
RUN yarn install --prod

RUN apk update && apk upgrade && \
    echo @edge http://nl.alpinelinux.org/alpine/edge/community >> /etc/apk/repositories && \
    echo @edge http://nl.alpinelinux.org/alpine/edge/main >> /etc/apk/repositories && \
    echo @edge http://nl.alpinelinux.org/alpine/edge/testing >> /etc/apk/repositories && \
    apk add --no-cache \
    ca-certificates \
    ttf-freefont \
    chromium@edge \
    harfbuzz@edge \
    dcron libcap \
    wqy-zenhei@edge && \
    # /etc/fonts/conf.d/44-wqy-zenhei.conf overrides 'monospace' matching FreeMono.ttf in /etc/fonts/conf.d/69-unifont.conf
    mv /etc/fonts/conf.d/44-wqy-zenhei.conf /etc/fonts/conf.d/74-wqy-zenhei.conf && \
    rm -rf /var/cache/apk/*

    # Add user so we don't need --no-sandbox.
RUN addgroup -S pptruser && adduser -S -g pptruser pptruser \
    && mkdir -p /home/pptruser/Downloads /app \
    && mkdir -p /home/pptruser/crontabs

RUN echo "*/2 * * * * cd /app && node /app/src/calendar-cronjob.js >> /app/calendar-cronjob.log 2>&1" >> /home/pptruser/crontabs/pptruser

RUN chown -R pptruser:pptruser /home/pptruser \
    && chown -R pptruser:pptruser /app \
    && chown -R pptruser:pptruser /usr/sbin/crond \
    && setcap cap_setgid=ep /usr/sbin/crond
RUN mkdir /app/uploads && chown -R pptruser:pptruser /app/uploads

RUN crontab /home/pptruser/crontabs/pptruser

# Run everything after as non-privileged user.
USER pptruser

RUN crond -c /home/pptruser/crontabs

COPY . .

EXPOSE 3030

ENTRYPOINT yarn start
