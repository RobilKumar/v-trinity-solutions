FROM node:18-alpine AS builder

ARG REACT_APP_API_URL=/api
ENV REACT_APP_API_URL=$REACT_APP_API_URL
ENV GENERATE_SOURCEMAP=false
ENV CI=false
ENV NODE_OPTIONS=--openssl-legacy-provider

WORKDIR /app
COPY package*.json ./
RUN npm install --legacy-peer-deps
# Fix ajv peer dep conflict (react-scripts 5 + Node 18)
RUN npm install ajv@^8.11.0 --legacy-peer-deps
COPY . .
RUN npm run build

FROM nginx:1.25-alpine
COPY --from=builder /app/build /usr/share/nginx/html
COPY nginx-spa.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
