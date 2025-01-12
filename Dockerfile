FROM node:18-alpine

WORKDIR /app

# Argumentos do build
ARG MONGODB_URI
ARG JWT_SECRET
ARG PORT

# Define as variáveis de ambiente
ENV MONGODB_URI=$MONGODB_URI
ENV JWT_SECRET=$JWT_SECRET
ENV PORT=$PORT
ENV NODE_ENV=production

# Copiar arquivos do backend
COPY backend/package*.json ./

# Instalar dependências do backend
RUN npm install

# Copiar arquivos estáticos do frontend para a pasta public
COPY frontend/public ./public

# Copiar resto dos arquivos do backend
COPY backend .

EXPOSE 8080

CMD ["npm", "start"]