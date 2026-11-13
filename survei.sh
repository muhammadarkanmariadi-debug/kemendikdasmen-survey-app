#!/usr/bin/env bash

COMMAND="${1:-help}"
SUBCOMMAND="${2:-}"

show_header() {
  echo ""
  echo "================================================================="
  echo "  SISTEM SURVEI & INSTRUMEN DIGITAL DIREKTORAT SMK (KEMENDIKBUD) "
  echo "================================================================="
  echo ""
}

show_help() {
  show_header
  echo "Penggunaan: ./survei.sh <perintah> [sub-perintah]"
  echo ""
  echo "Daftar Perintah:"
  echo "  dev | run              Menjalankan Backend (port 4800) & Frontend (port 3900)"
  echo "  dev:backend | backend  Menjalankan Backend NestJS saja (port 4800)"
  echo "  dev:frontend | frontend Menjalankan Frontend Next.js saja (port 3900)"
  echo ""
  echo "  build                  Compile production Backend & Frontend"
  echo "  build:backend          Compile Backend NestJS saja"
  echo "  build:frontend         Compile Frontend Next.js saja"
  echo ""
  echo "  db push                Sinkronisasi skema Prisma ke database MySQL"
  echo "  db generate            Generate Prisma Client"
  echo "  db migrate             Jalankan migrasi Prisma"
  echo "  db studio              Buka web UI Prisma Studio"
  echo ""
  echo "  install                Install dependensi (Root, Backend, Frontend)"
  echo "  lint                   Jalankan linter"
  echo "  help                   Menampilkan panduan ini"
  echo ""
}

case "$COMMAND" in
  dev|run|start)
    show_header
    echo ">> Menjalankan Backend & Frontend secara bersamaan..."
    npm run dev
    ;;
  dev:backend|backend)
    show_header
    echo ">> Menjalankan Backend NestJS di port 4800..."
    npm run dev:backend
    ;;
  dev:frontend|frontend)
    show_header
    echo ">> Menjalankan Frontend Next.js di port 3900..."
    npm run dev:frontend
    ;;
  build)
    show_header
    echo ">> Melakukan build Backend & Frontend..."
    npm run build
    ;;
  build:backend)
    show_header
    echo ">> Melakukan build Backend..."
    npm run build:backend
    ;;
  build:frontend)
    show_header
    echo ">> Melakukan build Frontend..."
    npm run build:frontend
    ;;
  db)
    show_header
    case "$SUBCOMMAND" in
      push)
        npm run db:push
        ;;
      generate)
        npm run db:generate
        ;;
      migrate)
        npm run db:migrate
        ;;
      studio)
        npm run db:studio
        ;;
      *)
        echo "Sub-perintah db tidak dikenal: $SUBCOMMAND"
        echo "Gunakan: ./survei.sh db [push|generate|migrate|studio]"
        ;;
    esac
    ;;
  install)
    show_header
    echo ">> Menginstall seluruh dependensi..."
    npm run install:all
    ;;
  lint)
    show_header
    echo ">> Menjalankan linter..."
    npm run lint
    ;;
  help|*)
    show_help
    ;;
esac

