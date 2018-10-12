FROM node:8
WORKDIR /
COPY unsvizu/package*.json /
RUN npm install

FROM tiangolo/uwsgi-nginx-flask:python3.6
RUN apt-get update && apt-get install -y --no-install-recommends apt-utils
RUN apt-get -y install libsndfile1
RUN apt-get -y install libsndfile1-dev
RUN pip install tensorflow numpy matplotlib wavefile sklearn
#ENV STATIC_INDEX 1
ENV LISTEN_PORT 80
COPY ./unspeech /app
RUN touch /app/__init__.py
COPY ./uwsgi.ini /app/uwsgi.ini
COPY ./unsvizu /app/static
COPY --from=0 / /app/static
COPY ./nginx.conf /etc/nginx/conf.d/nginx.conf

