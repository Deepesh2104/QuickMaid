# How to open QuickMaid schema in dbdiagram.io

## Errors you may see

| Error | Cause |
|-------|-------|
| `mismatched input '/'` | DBML pasted into **MySQL** or **PostgreSQL** import modal |
| `mismatched input '//'` | Same — import modals expect **SQL**, not DBML |

**Import modals are only for `mysqldump` / `pg_dump` SQL files.**

---

## Option A — Recommended (DBML editor)

1. Open **https://dbdiagram.io/d**
2. **New Diagram** → language: **DBML**
3. Copy all of `quickmaid.schema.dbml`
4. Paste into the **main left editor** (not Import modal)
5. Diagram renders on the right

**Do not open:** Import → MySQL / Import → PostgreSQL

---

## Option B — PostgreSQL import modal

If you want to use **Import from PostgreSQL**:

1. Open `quickmaid.schema.postgresql.sql` (generated SQL, not DBML)
2. Copy all contents
3. dbdiagram → **Import** → **PostgreSQL**
4. Paste the SQL file
5. Click import

---

## Files in this folder

| File | Use with |
|------|----------|
| `quickmaid.schema.v1.2.final.sql` | **Production deploy** — full v1.2 DDL + seeds (PostgreSQL 14+) |
| `quickmaid.schema.dbml` | Main DBML editor (Option A) — **v1.2 FINAL** |
| `quickmaid.schema.postgresql.sql` | PostgreSQL import modal (Option B) — v1.0 full DDL (legacy) |
| `SCHEMA_FINAL.md` | **Complete v1.2 specification, migration guide, architecture** |
| `SCHEMA_REVISION_v1.1.md` | v1.1 changelog and status mappings |
| `quickmaid.schema.v1.1.migration.sql` | ALTER script v1.0 → v1.1 |
| `quickmaid.schema.v1.2.migration.sql` | ALTER script v1.1 → v1.2 FINAL |

## After import

Export PNG/PDF from toolbar, or export SQL from dbdiagram for migrations.
