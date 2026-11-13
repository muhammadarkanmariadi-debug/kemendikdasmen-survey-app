<#
.SYNOPSIS
    CLI Pengelolaan Proyek Survei Kemendikbudristek (Google Forms Style)
.DESCRIPTION
    Skrip terpadu untuk menjalankan dev server, build, migrasi database, dan install dependensi.
#>

param (
    [Parameter(Position=0)]
    [string]$Command = "help",

    [Parameter(Position=1)]
    [string]$SubCommand = ""
)

$RootDir = Split-Path -Parent $MyInvocation.MyCommand.Definition
$BackendDir = Join-Path $RootDir "pro-backend-survei-main\pro-backend-survei-main"
$FrontendDir = Join-Path $RootDir "pro-frontend-survei-main\pro-frontend-survei-main"

function Show-Header {
    Write-Host ""
    Write-Host "=================================================================" -ForegroundColor Cyan
    Write-Host "  SISTEM SURVEI & INSTRUMEN DIGITAL DIREKTORAT SMK (KEMENDIKBUD) " -ForegroundColor Yellow
    Write-Host "=================================================================" -ForegroundColor Cyan
    Write-Host ""
}

function Show-Help {
    Show-Header
    Write-Host "Penggunaan: .\survei <perintah> [sub-perintah]" -ForegroundColor Green
    Write-Host ""
    Write-Host "Daftar Perintah:" -ForegroundColor White
    Write-Host "  dev | run              Menjalankan Backend (port 4800) & Frontend (port 3900) bersamaan" -ForegroundColor Gray
    Write-Host "  dev:backend | backend  Menjalankan Backend NestJS saja (port 4800)" -ForegroundColor Gray
    Write-Host "  dev:frontend | frontend Menjalankan Frontend Next.js 15 saja (port 3900)" -ForegroundColor Gray
    Write-Host ""
    Write-Host "  build                  Melakukan compile production untuk Backend & Frontend" -ForegroundColor Gray
    Write-Host "  build:backend          Melakukan compile Backend NestJS saja" -ForegroundColor Gray
    Write-Host "  build:frontend         Melakukan compile Frontend Next.js 15 saja" -ForegroundColor Gray
    Write-Host ""
    Write-Host "  db push                Sinkronisasi skema Prisma ke database MySQL (prisma db push)" -ForegroundColor Gray
    Write-Host "  db generate            Generate Prisma Client (prisma generate)" -ForegroundColor Gray
    Write-Host "  db migrate             Jalankan migrasi Prisma (prisma migrate dev)" -ForegroundColor Gray
    Write-Host "  db studio              Buka web UI Prisma Studio untuk mengelola data database" -ForegroundColor Gray
    Write-Host ""
    Write-Host "  install                Install semua dependensi di Root, Backend, dan Frontend" -ForegroundColor Gray
    Write-Host "  lint                   Jalankan linter untuk Backend dan Frontend" -ForegroundColor Gray
    Write-Host "  help                   Menampilkan panduan ini" -ForegroundColor Gray
    Write-Host ""
    Write-Host "Contoh:" -ForegroundColor Yellow
    Write-Host "  .\survei dev" -ForegroundColor Cyan
    Write-Host "  .\survei db push" -ForegroundColor Cyan
    Write-Host "  .\survei build" -ForegroundColor Cyan
    Write-Host ""
}

switch ($Command.ToLower()) {
    { $_ -in "dev", "run", "start" } {
        Show-Header
        Write-Host ">> Menjalankan Backend & Frontend secara bersamaan..." -ForegroundColor Green
        npm run dev
    }
    { $_ -in "dev:backend", "backend" } {
        Show-Header
        Write-Host ">> Menjalankan Backend NestJS di port 4800..." -ForegroundColor Green
        npm run dev:backend
    }
    { $_ -in "dev:frontend", "frontend" } {
        Show-Header
        Write-Host ">> Menjalankan Frontend Next.js di port 3900..." -ForegroundColor Green
        npm run dev:frontend
    }
    "build" {
        Show-Header
        Write-Host ">> Melakukan build Backend & Frontend..." -ForegroundColor Green
        npm run build
    }
    "build:backend" {
        Show-Header
        Write-Host ">> Melakukan build Backend..." -ForegroundColor Green
        npm run build:backend
    }
    "build:frontend" {
        Show-Header
        Write-Host ">> Melakukan build Frontend..." -ForegroundColor Green
        npm run build:frontend
    }
    "db" {
        Show-Header
        switch ($SubCommand.ToLower()) {
            "switch" {
                $Provider = if ($args.Length -gt 0) { $args[0] } else { "mysql" }
                Write-Host ">> Mengganti provider database ke $Provider..." -ForegroundColor Green
                npm run db:switch -- $Provider
            }
            "push" {
                Write-Host ">> Menjalankan prisma db push..." -ForegroundColor Green
                npm run db:push
            }
            "generate" {
                Write-Host ">> Menjalankan prisma generate..." -ForegroundColor Green
                npm run db:generate
            }
            "migrate" {
                Write-Host ">> Menjalankan prisma migrate dev..." -ForegroundColor Green
                npm run db:migrate
            }
            "studio" {
                Write-Host ">> Membuka Prisma Studio..." -ForegroundColor Green
                npm run db:studio
            }
            "seed" {
                Write-Host ">> Menjalankan seeder database proper..." -ForegroundColor Green
                npm run db:seed
            }
            default {
                Write-Host "Sub-perintah db tidak dikenal: $SubCommand" -ForegroundColor Red
                Write-Host "Gunakan: .\survei db [switch <mysql|postgresql|sqlite|sqlserver>|push|generate|migrate|seed|studio]" -ForegroundColor Yellow
            }
        }
    }
    "install" {
        Show-Header
        Write-Host ">> Menginstall seluruh dependensi (Root, Backend, Frontend)..." -ForegroundColor Green
        npm run install:all
    }
    "lint" {
        Show-Header
        Write-Host ">> Menjalankan linter..." -ForegroundColor Green
        npm run lint
    }
    default {
        Show-Help
    }
}

