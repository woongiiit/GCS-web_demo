# Prisma Client 재생성을 위한 스크립트

Write-Host "Prisma Client 재생성 중..." -ForegroundColor Yellow

# .prisma 폴더 삭제
$prismaPath = "node_modules\.prisma"
if (Test-Path $prismaPath) {
    Write-Host "기존 Prisma Client 폴더 삭제 중..." -ForegroundColor Yellow
    Remove-Item -Path $prismaPath -Recurse -Force -ErrorAction SilentlyContinue
    Start-Sleep -Seconds 2
}

# Prisma Client 재생성
Write-Host "Prisma Client 생성 중..." -ForegroundColor Green
npx prisma generate

if ($LASTEXITCODE -eq 0) {
    Write-Host "Prisma Client 생성 완료!" -ForegroundColor Green
} else {
    Write-Host "Prisma Client 생성 실패. 관리자 권한으로 실행하거나 개발 서버를 종료한 후 다시 시도하세요." -ForegroundColor Red
}

