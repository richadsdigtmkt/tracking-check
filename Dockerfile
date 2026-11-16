# La imagen oficial de Playwright ya trae Chromium y sus dependencias.
# La versión debe coincidir con la de "playwright" en package.json.
FROM mcr.microsoft.com/playwright:v1.65.1-noble
WORKDIR /app
ENV NODE_ENV=production
COPY package*.json ./
RUN npm ci --omit=dev
COPY src ./src
COPY public ./public
USER pwuser
ENV PORT=8080
EXPOSE 8080
CMD ["node", "src/server.js"]
