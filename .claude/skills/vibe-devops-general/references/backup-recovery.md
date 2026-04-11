# Backup and Recovery

## Backup Strategy

### What Gets Backed Up

| Data | Frequency | Method | Retention |
|------|-----------|--------|----------|
| PostgreSQL main DB | Daily at 02:00 AM | `pg_dump` | 30 days |
| PostgreSQL test DB | Not backed up | — | — |
| Redis data | Only if persistence enabled | RDB snapshot | 7 days |
| Wiki JSON files | Git-tracked | Git history | Indefinitely |
| Uploaded files (if any) | Daily | rsync/S3 | 30 days |

### PostgreSQL Backup Command

```bash
#!/bin/bash
# scripts/backup.sh
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR=/backups/postgres

pg_dump \
  -h $DATABASE_HOST \
  -U $DATABASE_USER \
  -d $DATABASE_NAME \
  -F c \
  -f "$BACKUP_DIR/eam_${DATE}.dump"

# Remove backups older than 30 days
find $BACKUP_DIR -name "*.dump" -mtime +30 -delete

echo "Backup complete: eam_${DATE}.dump"
```

---

## Recovery Procedure

### Restore from Backup

```bash
# Stop backend service first
docker-compose stop backend

# Restore
pg_restore \
  -h $DATABASE_HOST \
  -U $DATABASE_USER \
  -d $DATABASE_NAME \
  --clean \
  /backups/postgres/eam_{timestamp}.dump

# Restart backend
docker-compose start backend
```

### Verify After Restore

1. Connect to DB and count key tables: `SELECT COUNT(*) FROM orders;`
2. Check that most recent known order/transaction exists
3. Run health check on backend
4. Check logs for errors

---

## Pre-Production Deploy Backup

**ALWAYS take a backup before every production deploy:**

```bash
./scripts/backup.sh
echo "Pre-deploy backup: $(date)" >> /backups/deploy-log.txt
```

Tag the backup file with the deploy tag:
```bash
cp eam_{latest}.dump eam_pre-deploy-{release-tag}.dump
```

---

## Backup Verification (Monthly)

Once a month, test restore to a temporary DB:
1. Spin up a temp PostgreSQL container with a different port
2. Restore latest backup to it
3. Spot-check 5 random records across 3 tables
4. Confirm data integrity
5. Destroy temp container
6. Write verification log to `wiki/history/{date}.json`

---

## Redis Persistence

By default this project uses Redis as a cache (no persistence required).

If Redis persistence is enabled in the future:
- Enable RDB snapshot: `save 900 1` (every 15 min if ≥1 change)
- Mount `/data` volume in docker-compose for Redis
- Back up RDB file daily alongside PostgreSQL
