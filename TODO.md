# Migration Fix Plan

## Problem
TypeORM CLI error: Cannot find module 'src/entities/user' when running migration

## Root Cause
1. The data-source.ts has a browser check that may interfere with CLI
2. TypeORM CLI needs proper TypeScript/module resolution

## Solution
1. Modify src/db/data-source.ts to work with both Next.js and TypeORM CLI
2. Ensure proper exports and remove browser-specific guards for CLI
3. Test migration run

## Tasks
- [ ] Fix src/db/data-source.ts for CLI compatibility
- [ ] Test migration run
