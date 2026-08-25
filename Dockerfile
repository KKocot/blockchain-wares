# UWAGA: utrzymywane jako alternatywa dla VPS, ale NIEAKTUALNE wobec obecnej konfiguracji.
# Z adapterem @astrojs/vercel build tworzy .vercel/output/, a nie dist/server/entry.mjs,
# na ktory wskazuja CMD i HEALTHCHECK ponizej - kontener wstanie i od razu padnie.
# Powrot na VPS wymaga najpierw cofniecia adaptera na @astrojs/node w astro.config.mjs.
FROM node:24-alpine AS builder
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:24-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production \
    HOST=0.0.0.0 \
    PORT=4321

# pelne node_modules, nie --omit=dev: sharp jest w devDependencies, a SSR potrzebuje go w runtime dla /_image
COPY --from=builder --chown=node:node /app/node_modules ./node_modules
COPY --from=builder --chown=node:node /app/dist ./dist
COPY --chown=node:node package.json ./

# named volume bw-data dziedziczy wlasciciela z tego katalogu przy pierwszym utworzeniu
RUN mkdir -p /app/data && chown node:node /app/data

USER node
EXPOSE 4321
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://127.0.0.1:4321/ || exit 1
CMD ["node", "./dist/server/entry.mjs"]
