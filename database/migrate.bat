@echo off
REM SkillSwap Database Migration Tool (Windows)
REM Usage: migrate.bat [up|down|status] [migration_number]

cd migrations
node run-migration.js %*
cd ..
