FROM node:4.4.4

ENV HOME=/home/hearts
RUN useradd --user-group --create-home --shell /bin/false hearts &&\
  mkdir -p $HOME/app

COPY package.json semantic.json $HOME/app/
RUN chown -R hearts:hearts $HOME/*
RUN npm install -g gulp --quiet

USER hearts
WORKDIR $HOME/app
RUN npm install gulp --quiet
RUN npm install --quiet \
  && cd $HOME/app/node_modules/semantic-ui && gulp build \
  && npm cache clean
