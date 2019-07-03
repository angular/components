FROM node:10-alpine

RUN apk add git jq

ADD entrypoint.sh /entrypoint.sh
ADD containsLabel /containsLabel

ENTRYPOINT ["/entrypoint.sh"]
