FROM node:18-alpine
WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .
RUN npx prisma migrate dev
RUN npx prisma generate

EXPOSE 3001

CMD ["npm", "run", "dev"]
