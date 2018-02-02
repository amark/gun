FROM alpine:edge
# Build-time metadata as defined at http://label-schema.org
ARG BUILD_DATE
ARG VCS_REF
ARG VCS_URL
ARG VERSION
LABEL org.label-schema.build-date=$BUILD_DATE \
  org.label-schema.name="Gun - Offline First, Javascript Graph Database" \
  org.label-schema.url="http://gun.js.org" \
  org.label-schema.vcs-ref=$VCS_REF \
  org.label-schema.vcs-url=$VCS_URL \
  org.label-schema.vendor="The Gun Database Team" \
  org.label-schema.version=$VERSION \
  org.label-schema.schema-version="1.0"
#  org.label-schema.description="Let it be pulled from Readme.md..." \
WORKDIR /app
ADD . .
ENV NPM_CONFIG_LOGLEVEL warn
RUN apk update && apk upgrade \
  && apk add  --no-cache ca-certificates nodejs-npm \
  && apk add --no-cache --virtual .build-dependencies python make g++ \
  && npm install \
  && apk del .build-dependencies && rm -rf /var/cache/* /tmp/npm*
EXPOSE 8080
CMD ["npm","start"]
