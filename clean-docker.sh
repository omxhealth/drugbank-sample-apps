#!/bin/sh

docker-compose rm -f java
docker image rm drugbank-sample-apps/java

docker-compose rm -f nodejs
docker image rm drugbank-sample-apps/nodejs

docker-compose rm -f nodejs-jwt
docker image rm drugbank-sample-apps/nodejs-jwt

docker-compose rm -f php
docker image rm drugbank-sample-apps/php

docker-compose rm -f python
docker image rm drugbank-sample-apps/python

docker-compose rm -f ruby
docker image rm drugbank-sample-apps/ruby
