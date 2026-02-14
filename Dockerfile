FROM node:22-bookworm-slim

WORKDIR /app

COPY ./src ./src
COPY ./*.json ./

RUN npm install
RUN npm run build

CMD ["npm", "run", "prod"]
