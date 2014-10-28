#!/bin/bash -e

brunch build --env production
rsync --progress -Calpr deploy/ gnmerritt.net:/usr/share/nginx/www/fantasy
