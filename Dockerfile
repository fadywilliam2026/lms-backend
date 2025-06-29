FROM node:20 AS builder
RUN apt-get update -y && apt-get install -y openssl
RUN npm install -g pnpm
# Create app directory
WORKDIR /app
# A wildcard is used to ensure both package.json AND package-lock.json are copied
COPY package*.json pnpm-lock.yaml ./
COPY prisma ./prisma/
# Install app dependencies
RUN pnpm install
# Generate prisma client, leave out if generating in `postinstall` script
RUN pnpm dlx prisma generate

COPY . .

RUN pnpm run build

FROM builder
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/*.pdf ./
COPY --from=builder /app/fonts ./fonts
COPY --from=builder /app/markdown-files ./markdown-files

EXPOSE 3000
CMD ["pnpm", "run", "start:prod"]