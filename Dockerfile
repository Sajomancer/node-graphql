FROM node:23-alpine

WORKDIR /app

COPY package.json tsconfig.json ./
RUN npm install

COPY backend ./backend

RUN npm run build

CMD ["node", "dist/index.js"]
