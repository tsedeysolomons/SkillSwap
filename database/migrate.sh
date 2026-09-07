#!/bin/bash
# SkillSwap Database Migration Tool (Linux/Mac)
# Usage: ./migrate.sh [up|down|status] [migration_number]

cd migrations
node run-migration.js "$@"
cd ..
