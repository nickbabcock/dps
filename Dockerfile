FROM node:8

RUN apt-get update && apt-get install -y \
    python2.7 \
    python-pip \
    zopfli \
 && rm -rf /var/lib/apt/lists/*
COPY . /site
WORKDIR /site
RUN npm install \
	&& pip install -r requirements.txt \
	&& npx grunt \
	&& mv bin/templates/about-generated.html bin/about.html \
	&& mv bin/templates/home-generated.html bin/index.html \
	&& mv bin/templates/statistics-generated.html bin/statistics.html

FROM nginx:stable-alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=0 /site/bin /usr/share/nginx/html
VOLUME /usr/share/nginx/html/data
