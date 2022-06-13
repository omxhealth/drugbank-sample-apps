FROM php:7.4-cli

RUN apt-get update && apt-get install -y git

WORKDIR /usr/src/app

COPY ./php/. ./

RUN ./install-composer.sh
RUN php composer.phar install

EXPOSE 8080

CMD ["php", "-S", "0.0.0.0:8080", "-t", "public"]