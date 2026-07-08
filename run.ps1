$scriptPath = $PSScriptRoot

Write-Host "Starting VoyageAI Backend..." -ForegroundColor Cyan
Set-Location -Path "$scriptPath\voyageai-backend"
if (-not (Test-Path "node_modules")) {
    Write-Host "Installing backend dependencies. This may take a minute..." -ForegroundColor Yellow
    npm install
}
# Start backend in a new command window
Start-Process -FilePath "cmd.exe" -ArgumentList "/c title VoyageAI Backend & npm start"

Set-Location -Path "$scriptPath"
Write-Host "Starting VoyageAI Frontend Server..." -ForegroundColor Cyan
# Start frontend in a new command window
Start-Process -FilePath "cmd.exe" -ArgumentList "/c title VoyageAI Frontend & npx --yes http-server . -p 3000 -c-1"

Write-Host "Waiting for servers to initialize..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

Write-Host "Opening application in browser..." -ForegroundColor Green
Start-Process "http://localhost:3000/voyageai.html"
