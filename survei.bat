@echo off
setlocal

set "COMMAND=%~1"
set "SUBCOMMAND=%~2"

if "%COMMAND%"=="" goto help
if /i "%COMMAND%"=="help" goto help

if /i "%COMMAND%"=="dev" goto run_dev
if /i "%COMMAND%"=="run" goto run_dev
if /i "%COMMAND%"=="start" goto run_dev

if /i "%COMMAND%"=="dev:backend" goto run_backend
if /i "%COMMAND%"=="backend" goto run_backend

if /i "%COMMAND%"=="dev:frontend" goto run_frontend
if /i "%COMMAND%"=="frontend" goto run_frontend

if /i "%COMMAND%"=="build" goto run_build
if /i "%COMMAND%"=="build:backend" goto run_build_backend
if /i "%COMMAND%"=="build:frontend" goto run_build_frontend

if /i "%COMMAND%"=="db" goto run_db
if /i "%COMMAND%"=="install" goto run_install
if /i "%COMMAND%"=="lint" goto run_lint

echo [ERROR] Perintah tidak dikenal: %COMMAND%
goto help

:run_dev
echo [INFO] Menjalankan Backend & Frontend secara bersamaan...
call npm run dev
goto end

:run_backend
echo [INFO] Menjalankan Backend NestJS di port 4800...
call npm run dev:backend
goto end

:run_frontend
echo [INFO] Menjalankan Frontend Next.js di port 3900...
call npm run dev:frontend
goto end

:run_build
echo [INFO] Melakukan build Backend & Frontend...
call npm run build
goto end

:run_build_backend
echo [INFO] Melakukan build Backend...
call npm run build:backend
goto end

:run_build_frontend
echo [INFO] Melakukan build Frontend...
call npm run build:frontend
goto end

:run_db
if /i "%SUBCOMMAND%"=="switch" (
    echo [INFO] Mengganti provider database ke %~3...
    call npm run db:switch -- %~3
    goto end
)
if /i "%SUBCOMMAND%"=="push" (
    echo [INFO] Menjalankan prisma db push...
    call npm run db:push
    goto end
)
if /i "%SUBCOMMAND%"=="generate" (
    echo [INFO] Menjalankan prisma generate...
    call npm run db:generate
    goto end
)
if /i "%SUBCOMMAND%"=="migrate" (
    echo [INFO] Menjalankan prisma migrate dev...
    call npm run db:migrate
    goto end
)
if /i "%SUBCOMMAND%"=="studio" (
    echo [INFO] Membuka Prisma Studio...
    call npm run db:studio
    goto end
)
if /i "%SUBCOMMAND%"=="seed" (
    echo [INFO] Menjalankan seeder database proper...
    call npm run db:seed
    goto end
)
echo [ERROR] Sub-perintah db tidak dikenal: %SUBCOMMAND%
echo Gunakan: survei db [push^|generate^|migrate^|studio]
goto end

:run_install
echo [INFO] Menginstall seluruh dependensi...
call npm run install:all
goto end

:run_lint
echo [INFO] Menjalankan linter...
call npm run lint
goto end

:help
echo.
echo =================================================================
echo   SISTEM SURVEI ^& INSTRUMEN DIGITAL DIREKTORAT SMK (KEMENDIKBUD)
echo =================================================================
echo.
echo Penggunaan: survei ^<perintah^> [sub-perintah]
echo.
echo Daftar Perintah:
echo   dev ^| run              Menjalankan Backend (port 4800) ^& Frontend (port 3900)
echo   dev:backend ^| backend  Menjalankan Backend NestJS saja (port 4800)
echo   dev:frontend ^| frontend Menjalankan Frontend Next.js saja (port 3900)
echo.
echo   build                  Compile production Backend ^& Frontend
echo   build:backend          Compile Backend NestJS saja
echo   build:frontend         Compile Frontend Next.js saja
echo.
echo   db push                Sinkronisasi skema Prisma ke database MySQL
echo   db generate            Generate Prisma Client
echo   db migrate             Jalankan migrasi Prisma
echo   db studio              Buka web UI Prisma Studio
echo.
echo   install                Install dependensi (Root, Backend, Frontend)
echo   lint                   Jalankan linter
echo   help                   Menampilkan panduan ini
echo.
echo Contoh:
echo   survei dev
echo   survei db push
echo   survei build
echo.

:end
endlocal
