@echo off
echo =======================================
echo     Starting VoyageAI Application
echo =======================================

echo.
echo [1/3] Checking backend dependencies...
cd voyageai-backend
if not exist node_modules\ (
    echo Installing backend dependencies...
    call npm install
)

echo.
echo [2/3] Starting Backend Server...
:: start /B runs the process in the same CMD terminal window without opening a new one
start /B "VoyageAI Backend" npm start

cd ..
echo.
echo [3/3] Starting Frontend Server...
start /B "VoyageAI Frontend" npx --yes http-server . -p 3000 -c-1

echo.
echo Waiting for servers to initialize...
timeout /t 5 /nobreak > nul

echo Opening application in browser...
start http://localhost:3000/voyageai.html

echo.
echo =======================================
echo Both Backend and Frontend are now running in this CMD terminal!
echo To stop the servers, press Ctrl + C
echo =======================================
pause
