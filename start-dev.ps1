#!/usr/bin/env pwsh
# start-dev.ps1
# Starts backend and frontend in separate PowerShell windows and opens the browser.

$root = Split-Path -Parent $MyInvocation.MyCommand.Definition
$backend = Join-Path $root 'backend'
$frontend = Join-Path $root 'frontend\webapp'

Write-Host "Starting backend from $backend"
if (-not (Test-Path (Join-Path $backend 'node_modules'))) {
    Write-Host "Installing backend dependencies..."
    Start-Process powershell -ArgumentList "-NoExit","-Command","cd '$backend'; npm install" -Verb runAs
} else {
    Start-Process powershell -ArgumentList "-NoExit","-Command","cd '$backend'; npm start"
}

Start-Sleep -Seconds 1
Write-Host "Starting frontend from $frontend"
if (-not (Test-Path (Join-Path $frontend 'node_modules'))) {
    Write-Host "Installing frontend dependencies..."
    Start-Process powershell -ArgumentList "-NoExit","-Command","cd '$frontend'; npm install; npm run dev" -Verb runAs
} else {
    Start-Process powershell -ArgumentList "-NoExit","-Command","cd '$frontend'; npm run dev" -Verb runAs
}

Start-Sleep -Seconds 2
Write-Host "Opening browser to http://localhost:5173/"
Start-Process "http://localhost:5173/"

Write-Host "Done. Use the opened PowerShell windows to view logs or stop servers." 
