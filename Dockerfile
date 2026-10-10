FROM node:24-alpine

WORKDIR /app

# instala só as dependências de produção (aproveita o cache de camadas)
COPY package*.json ./
RUN npm ci --omit=dev

COPY index.js ./

ENV NODE_ENV=production
ENV PORT=8080
EXPOSE 8080

USER node

CMD ["node", "index.js"]
