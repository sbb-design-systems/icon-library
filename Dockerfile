# This Dockerfile creates the icon CDN, which is be hosted on icons.app.sbb.ch (AWS Cluster).
# It flattens all svg icons into a respective "namespace" folder.
# (e.g.
#   icons/svg/FPL/Attribut/sa-1.svg => fpl/sa-1.svg
#   icons/svg/KOM/responsive/large/010-Basic/calendar-large.svg => kom/calendar-large.svg)
# It also creates the following:
#  - Compressed variants of the icons (brotli, gzip), which will be served to compatible browsers.
#  - An index.html with all icons
#  - An index.json with all icons and additional information

FROM nginx:1.18.0-alpine AS nginx-builder

# Compiling NGINX module: https://gist.github.com/hermanbanken/96f0ff298c162a522ddbba44cad31081
# nginx:alpine contains NGINX_VERSION environment variable, like so:
# ENV NGINX_VERSION 1.15.0

# Our BROTLI version
ENV BROTLI_VERSION 1.0.0rc

# Download sources
RUN wget "http://nginx.org/download/nginx-${NGINX_VERSION}.tar.gz" -O nginx.tar.gz

# For latest build deps, see https://github.com/nginxinc/docker-nginx/blob/master/mainline/alpine/Dockerfile
RUN apk add --no-cache --virtual .build-deps \
  gcc \
  libc-dev \
  make \
  openssl-dev \
  pcre-dev \
  zlib-dev \
  linux-headers \
  libxslt-dev \
  gd-dev \
  geoip-dev \
  perl-dev \
  libedit-dev \
  mercurial \
  bash \
  alpine-sdk \
  findutils \
  git

# Reuse same cli arguments as the nginx:alpine image used to build
RUN CONFARGS=$(nginx -V 2>&1 | sed -n -e 's/^.*arguments: //p') \
  CONFARGS=${CONFARGS/-Os -fomit-frame-pointer/-Os} && \
  mkdir /usr/src && \
	tar -zxC /usr/src -f nginx.tar.gz && \
  git clone https://github.com/eustas/ngx_brotli.git && \
  BROTLIDIR="$(pwd)/ngx_brotli" && \
  cd ngx_brotli && \
  git submodule update --init && \
  cd /usr/src/nginx-$NGINX_VERSION && \
  ./configure --with-compat $CONFARGS --add-dynamic-module=$BROTLIDIR && \
  make modules && \
  mv ./objs/*.so /

FROM alpine:latest AS icons-builder

ARG CDN_VERSION_ARG
ENV CDN_VERSION=$CDN_VERSION_ARG

WORKDIR /usr/icons

RUN apk add --no-cache brotli gzip nodejs

# Copy js script to create namespace index json
COPY ./.github/prepare-icons.js prepare-icons.js

# Copy FPL icons
COPY ./icons/svg/FPL fpl
COPY ./icons/svg/KOM/responsive kom

# Flatten icons and create index
RUN node ./prepare-icons.js

# Create compressed variants of the icons
RUN brotli -k --best */*.svg
RUN gzip -k --best */*.svg

FROM nginxinc/nginx-unprivileged:1.18.0-alpine

# Extract the dynamic module BROTLI from the nginx-builder image
COPY --from=nginx-builder /ngx_http_brotli_static_module.so /etc/nginx/modules/ngx_http_brotli_static_module.so
# Extract the icons from the icons-builder image
COPY --from=icons-builder /usr/icons /usr/share/nginx/html

# Copy nginx configuration
COPY ./.github/default.conf /etc/nginx/conf.d/default.conf

RUN sed -i 's,events {,load_module modules/ngx_http_brotli_static_module.so;\n\nevents {,' /etc/nginx/nginx.conf
