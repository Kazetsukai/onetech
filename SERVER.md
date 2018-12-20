# Server Setup for onetech

Here's how I setup a VPS to run onetech.info.

## Basic Setup

I first setup a $5/month droplet on [Digital Ocean](https://www.digitalocean.com) with Ubuntu 18.04 and followed these instructions.

1. [Initial Server Setup](https://www.digitalocean.com/community/tutorials/initial-server-setup-with-ubuntu-18-04)
2. [Install Nginx](https://www.digitalocean.com/community/tutorials/how-to-install-nginx-on-ubuntu-18-04)
3. [Secure Nginx with Let's Encrypt](https://www.digitalocean.com/community/tutorials/how-to-secure-nginx-with-let-s-encrypt-on-ubuntu-18-04)
4. [Setup Node.js for Production](https://www.digitalocean.com/community/tutorials/how-to-set-up-a-node-js-application-for-production-on-ubuntu-18-04)

## Site

Clone the onetech repo and build it:

```
git clone https://github.com/Kazetsukai/onetech.git
npm install
npm run build
```

Setup the server config:

```
server {
  root /path/to/onetech;
  index index.html;

  server_name onetech.info edge.onetech.info www.onetech.info;

  location / {
    try_files $uri $uri/ /index.html;
  }

  location ~* \.(ico|css|js|gif|jpe?g|png|json|svg)$ {
    # try the file directly
  }

  # ...
}
```

I also enabled gzip on `/etc/nginx/nginx.conf`:

```
gzip on;

gzip_vary on;
gzip_proxied any;
gzip_comp_level 6;
gzip_buffers 16 8k;
gzip_http_version 1.1;
gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;
gzip_min_length 256;
gzip_disable "MSIE [1-6].(?!.*SV1)";
```

Make sure to setup onetech.info domain to point to the droplet.


## Process Script

Run this to install [ImageMagick](https://www.imagemagick.org/script/index.php) and Cairo for the [node-canvas](https://github.com/Automattic/node-canvas/blob/v1.x/Readme.md).

```
sudo apt-get install imagemagick libcairo2-dev libjpeg-dev libpango1.0-dev libgif-dev build-essential g++
```

Then run it:

```
cd onetech
node process download
```

## Cron

Setup cron to run the update script every 5 minutes, this will watch both Git repos and update the site when they change.

```
*/5 * * * * /path/to/onetech/bin/update_onetech
```

That's it!
