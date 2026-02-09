# Instalar dependencias del frontend (soluciona ENOTCACHED / only-if-cached)
$ErrorActionPreference = "Stop"
$env:npm_config_prefer_offline = "false"
$env:npm_config_offline = "false"
Write-Host "Instalando dependencias en frontend..." -ForegroundColor Cyan
npm install --cache ./.npm-cache --prefer-online
Write-Host "Listo. Ejecuta: npm run dev" -ForegroundColor Green
