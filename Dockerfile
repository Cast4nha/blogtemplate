FROM node:18-alpine

WORKDIR /app

# Copiar arquivos do backend
COPY backend/package*.json ./

# Instalar dependências do backend
RUN npm install

# Criar diretório public e copiar frontend para ele
RUN mkdir -p public/uploads
COPY frontend/public ./public

# Copiar resto dos arquivos do backend
COPY backend .

# Garantir permissões corretas
RUN chown -R node:node /app/public/uploads

EXPOSE 3000

CMD ["npm", "start"]