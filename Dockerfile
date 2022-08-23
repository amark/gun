# install packages
FROM node:14-alpine as builder
RUN mkdir /work
WORKDIR /work
RUN apk add --no-cache alpine-sdk python3
COPY package*.json ./
RUN mkdir -p node_modules
RUN npm ci --only=production

# fresh image without dev packages
FROM node:14-alpine
# build-time metadata as defined at http://label-schema.org
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
ARG SHA
RUN mkdir /work
WORKDIR /work
COPY --from=builder /work/node_modules ./node_modules
RUN npm rebuild -q
ADD . .
RUN echo "{ \"sha\": \"$SHA\" }" > version.json
RUN cat version.json
EXPOSE 8080
EXPOSE 8765
CMD ["npm","start"]
