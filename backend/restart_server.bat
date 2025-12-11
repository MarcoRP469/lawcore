@echo off
echo ========================================
echo Reiniciando Servidor Backend LawCore
echo ========================================
echo.

REM Buscar y matar el proceso de uvicorn/python en el puerto 8000
echo [1/3] Deteniendo servidor actual...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :8000') do (
    taskkill /F /PID %%a >nul 2>&1
)
timeout /t 2 /nobreak >nul

echo [2/3] Limpiando cache de Python...
cd /d "%~dp0"
if exist __pycache__ rmdir /s /q __pycache__
if exist routers\__pycache__ rmdir /s /q routers\__pycache__

echo [3/3] Iniciando servidor...
echo.
echo Servidor corriendo en: http://localhost:8000
echo Documentacion API: http://localhost:8000/docs
echo.
echo Presiona Ctrl+C para detener el servidor
echo ========================================
echo.

uvicorn main:app --reload --host 0.0.0.0 --port 8000
