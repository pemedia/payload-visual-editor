FROM node:18-alpine

WORKDIR /usr/src/app/

# RUN apk add tini

# ENTRYPOINT ["/sbin/tini", "--"]

CMD ["sleep", "infinity"]
