# Script khởi động BE + FE cùng lúc
# Chạy: .\start-dev.ps1

Write-Host "=== RecruitAI Dev Server ===" -ForegroundColor Cyan

# Khởi động BE trong cửa sổ mới
Write-Host "[BE] Khởi động Spring Boot tại localhost:8080..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot\BE'; Write-Host 'BE Starting...' -ForegroundColor Yellow; .\mvnw.cmd spring-boot:run"

# Đợi 3 giây rồi khởi động FE
Start-Sleep -Seconds 3

# Khởi động FE trong cửa sổ mới
Write-Host "[FE] Khởi động Next.js tại localhost:3001..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot\FE'; Write-Host 'FE Starting...' -ForegroundColor Green; npm run dev"

Write-Host ""
Write-Host "Đang khởi động..." -ForegroundColor Cyan
Write-Host "  BE: http://localhost:8080" -ForegroundColor Yellow
Write-Host "  FE: http://localhost:3001" -ForegroundColor Green
