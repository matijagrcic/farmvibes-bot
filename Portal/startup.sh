#!/bin/bash

echo "Running start-up tasks"
echo "running schema update command"
php bin/console doctrine:schema:update --force --dump-sql --env=prod
echo "running lexic jwt pairs command"
php bin/console lexik:jwt:generate-keypair --overwrite
echo "updating nginx default conf file"
cp /home/site/wwwroot/azure-nginx.conf /etc/nginx/sites-available/default
echo "restarting nginx"
service nginx reload
