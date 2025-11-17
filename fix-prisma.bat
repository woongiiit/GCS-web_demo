@echo off
echo Prisma Client 재생성 중...

REM .prisma 폴더 삭제
if exist "node_modules\.prisma" (
    echo 기존 Prisma Client 폴더 삭제 중...
    rmdir /s /q "node_modules\.prisma"
    timeout /t 2 /nobreak >nul
)

REM Prisma Client 재생성
echo Prisma Client 생성 중...
call npx prisma generate

if %ERRORLEVEL% EQU 0 (
    echo Prisma Client 생성 완료!
    echo.
    echo 빌드를 실행합니다...
    call npm run build
) else (
    echo Prisma Client 생성 실패.
    echo 개발 서버를 종료한 후 다시 시도하세요.
    pause
)

