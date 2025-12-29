/**
 * Configuração de ambiente para PRODUÇÃO
 * 
 * IMPORTANTE: Atualizar apiUrl com o URL do backend após deploy
 * Exemplo: https://seu-backend.onrender.com/api
 */
export const environment = {
  production: true,
  
  // URL da API backend em produção
  // Substituir após deploy do backend no Render
  apiUrl: 'https://taskmanager-backend.onrender.com/api',
  
  // Timeout para requests HTTP (em milissegundos)
  httpTimeout: 30000,
  
  // Configurações de logging
  enableLogging: false,
  logLevel: 'error',
  
  // Versão da aplicação
  version: '1.0.0'
};

