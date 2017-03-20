pm2 stop ./bin/check.js
pm2 stop ./bin/www
pm2 start ./bin/www
pm2 start ./bin/check.js