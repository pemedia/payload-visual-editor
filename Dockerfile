FROM node:18-alpine

WORKDIR /usr/src/app/

# RUN apk add tini
RUN apk add git

# ENTRYPOINT ["/sbin/tini", "--"]

CMD ["sleep", "infinity"]
