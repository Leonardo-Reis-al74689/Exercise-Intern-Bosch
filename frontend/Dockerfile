# ==========================================
# STAGE 1: Build - Compilar aplicação Angular
# ==========================================
FROM node:18-alpine as builder

# Metadados da imagem
LABEL maintainer="Task Manager Frontend"
LABEL description="Frontend Angular para Task Manager"

# Definir diretório de trabalho
WORKDIR /app

# Copiar ficheiros de dependências
COPY package*.json ./

# Instalar dependências (incluindo devDependencies para o build)
# Usar npm install porque package-lock.json pode não existir
RUN npm install --legacy-peer-deps

# Copiar código fonte
COPY . .

# Build de produção otimizado
# --configuration production: ativa otimizações (minificação, tree-shaking, AOT)
# --output-path dist: define pasta de saída
RUN npm run build -- --configuration production --output-path=dist

# ==========================================
# STAGE 2: Runtime - Nginx para servir ficheiros
# ==========================================
FROM nginx:1.25-alpine

# Copiar configuração customizada do Nginx
COPY nginx.conf /etc/nginx/nginx.conf

# Remover ficheiros padrão do Nginx
RUN rm -rf /usr/share/nginx/html/*

# Copiar build da aplicação do stage anterior
COPY --from=builder /app/dist /usr/share/nginx/html

# Criar utilizador não-root para segurança
RUN chown -R nginx:nginx /usr/share/nginx/html && \
    chmod -R 755 /usr/share/nginx/html

# Expor porta 80
EXPOSE 80

# Healthcheck
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD wget --quiet --tries=1 --spider http://localhost:80/ || exit 1

# Iniciar Nginx em modo foreground
CMD ["nginx", "-g", "daemon off;"]

