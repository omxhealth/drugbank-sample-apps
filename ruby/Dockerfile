FROM ruby:2.7.1

RUN apt-get update -qq && apt-get install -y build-essential

WORKDIR /usr/src/app

COPY ./ruby/Gemfile* ./
RUN bundle install

COPY ./ruby/. ./
COPY ./resources /usr/src/resources/

EXPOSE 8080

CMD ["rackup", "--host", "0.0.0.0", "-p", "8080"]