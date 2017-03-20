pm2 stop ./check.js
pm2 stop ./www
pm2 start ./www
pm2 start ./check.js