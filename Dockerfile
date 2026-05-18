FROM node:22-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat git build-base cairo-dev pango-dev giflib-dev libjpeg-turbo-dev libpng-dev python3 make g++ pkgconfig
WORKDIR /app

COPY package.json pnpm-lock.yaml* ./
ENV PNPM_ALLOW_NEW_BUILDS=true
ENV HUSKY=0
ENV CI=true
# Approve build scripts non-interactively and install dependencies.
# First install attempt populates pending builds (may exit non-zero),
# then approve all and install again to run build scripts.
RUN yarn global add pnpm \
    && (pnpm i --no-frozen-lockfile || true) \
    && pnpm approve-builds --all \
    && pnpm i --no-frozen-lockfile

# Rebuild the source code only when needed
FROM base AS builder
RUN apk add --no-cache git
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

ENV NEXT_TELEMETRY_DISABLED 1
ARG NEXT_PUBLIC_BACKEND_URL="/graphql"
ARG NEXT_PUBLIC_OAUTH_REDIRECT_URL="https://orange.informatik.uni-stuttgart.de"
ARG NEXT_PUBLIC_OAUTH_CLIENT_ID="frontend"
ARG NEXT_PUBLIC_OAUTH_AUTHORITY="https://orange.informatik.uni-stuttgart.de/keycloak/realms/GITS"

RUN yarn global add pnpm@latest-8 \
    && mkdir -p ./__generated__ \
    && rm -rf ./mockserver \
    && pnpm run build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public

# Automatically leverage output traces to reduce image size
# https://nextjs.org/docs/advanced-features/output-file-tracing
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs
EXPOSE 3000
ENV PORT 3000

CMD ["node", "server.js"]
