# ConvertMe Deployment Guide

Everything you need to operate the production deployment of convertme.co.uk.

---

## What's running where

```
                 https://convertme.co.uk
                          │
                          ▼
  ┌────────────────────────────────────────────────┐
  │  Digital Ocean droplet  46.101.76.57           │
  │  Ubuntu 24.04, 1 vCPU, 1 GB RAM                │
  │                                                │
  │  nginx (host, port 80/443) ──┐                 │
  │    ├── /api/*  ──────────────┼──► backend  :8000 (FastAPI, Docker)
  │    └── /*      ──────────────┘──► frontend :3000 (Next.js, Docker)
  │                                                │
  │                              postgres :5432 (Docker, internal only)
  └────────────────────────────────────────────────┘
```

- **DNS**: A records for `@` and `www` → `46.101.76.57` (managed at Fasthosts)
- **SSL**: Let's Encrypt cert via certbot, auto-renews every ~60 days
- **Source of truth**: `main` branch on github.com/caileighsmith/convertme
- **Working dir on droplet**: `/home/deploy/convertme`

---

## Getting onto the droplet

You log in via the Digital Ocean web console (Droplets → your droplet → Console).

The console opens as `root`. For anything operational, switch to the `deploy` user (which owns the repo and has Docker access):

```bash
su - deploy
cd ~/convertme
```

`deploy` has passwordless sudo, so anything requiring root (`sudo nginx -t`, `sudo certbot ...`) just works.

---

## Deploying code changes

The standard flow once you've merged changes to `main`:

```bash
su - deploy
cd ~/convertme
git pull
docker compose -f docker-compose.prod.yml up -d --build
```

That's the whole deploy. Three things happen:

1. `git pull` fetches the latest `main`
2. `--build` rebuilds any container whose source changed
3. `-d` runs detached; containers replace themselves with the new image

The frontend build takes ~3–5 min on this droplet (small CPU). The backend rebuild is ~30s. The database container won't restart unless its image changed — your data is safe.

### Verifying the deploy

```bash
docker compose -f docker-compose.prod.yml ps
curl -s http://127.0.0.1:8000/health
curl -sI http://127.0.0.1:3000 | head -1
```

All three services should be `Up`. Backend returns `{"status":"ok"}`. Frontend returns `HTTP/1.1 200 OK`.

Then load `https://convertme.co.uk` in a browser as a final check.

### Rolling back

If a deploy breaks the site:

```bash
cd ~/convertme
git log --oneline -5                       # find the last good commit
git checkout <commit-hash>
docker compose -f docker-compose.prod.yml up -d --build
```

When you've fixed the issue, `git checkout main && git pull` and redeploy.

---

## Credentials & secrets

All secrets live in `/home/deploy/convertme/.env` on the droplet. The file is `chmod 600` and gitignored.

Contains:
- `POSTGRES_USER` / `POSTGRES_PASSWORD` / `POSTGRES_DB` — DB connection
- `JWT_SECRET_KEY` — signs user session tokens
- `JWT_EXPIRE_MINUTES` — session length
- `FRONTEND_URL` — used for CORS
- `NEXT_PUBLIC_API_URL` — baked into the frontend at build time
- `ENVIRONMENT=production`

**If you lose `.env`:** the DB password lockout means you'd need to wipe the postgres volume and start fresh (loses all user data). Back up `.env` somewhere safe (password manager, encrypted note).

### Rotating secrets

If a secret leaks:

```bash
su - deploy
cd ~/convertme
nano .env                                  # change the values
docker compose -f docker-compose.prod.yml up -d --force-recreate backend frontend
```

Caveats:
- Changing `JWT_SECRET_KEY` logs everyone out (existing tokens become invalid). Acceptable.
- Changing `POSTGRES_PASSWORD` in `.env` doesn't update the password inside the running postgres container. To rotate the DB password you also need to update it via `psql` — or, if you can afford downtime, wipe the volume and let it re-init with the new password (loses data, so back up first).

---

## Common operations

### View logs

```bash
# All services, follow live
docker compose -f docker-compose.prod.yml logs -f

# One service
docker compose -f docker-compose.prod.yml logs -f backend
docker compose -f docker-compose.prod.yml logs -f frontend
docker compose -f docker-compose.prod.yml logs -f db

# Last 200 lines without following
docker compose -f docker-compose.prod.yml logs --tail=200 backend
```

Press Ctrl+C to stop following.

### Restart a service

```bash
docker compose -f docker-compose.prod.yml restart backend
docker compose -f docker-compose.prod.yml restart frontend
```

### Stop / start everything

```bash
docker compose -f docker-compose.prod.yml down       # stop and remove containers (volumes preserved)
docker compose -f docker-compose.prod.yml up -d      # bring back up
```

### Get a shell inside a container

```bash
docker compose -f docker-compose.prod.yml exec backend bash
docker compose -f docker-compose.prod.yml exec frontend sh
docker compose -f docker-compose.prod.yml exec db psql -U convertme -d convertme
```

### Check disk / memory

```bash
df -h                                      # disk usage
free -h                                    # RAM usage
docker system df                           # docker disk usage
```

If docker is eating disk, prune unused images/builds:

```bash
docker system prune -af                    # removes unused images, networks, build cache
```

---

## Database

### Connect to Postgres

```bash
docker compose -f docker-compose.prod.yml exec db psql -U convertme -d convertme
```

Common psql commands:
- `\dt` — list tables
- `\d users` — describe a table
- `\q` — quit
- `SELECT count(*) FROM users;`

### Backups

There's no automated backup yet. To take one manually:

```bash
mkdir -p ~/backups
docker compose -f docker-compose.prod.yml exec -T db pg_dump -U convertme convertme > ~/backups/convertme-$(date +%Y%m%d-%H%M%S).sql
```

The `.sql` file is plain text — copy it off the droplet via `scp` or DO's web console download.

**Recommended next step**: add a daily cron job that runs `pg_dump` and rotates files older than 14 days. Ask Claude to set this up when you're ready.

### Restoring from a backup

```bash
docker compose -f docker-compose.prod.yml exec -T db psql -U convertme -d convertme < ~/backups/convertme-YYYYMMDD-HHMMSS.sql
```

---

## SSL

Cert auto-renews via the certbot package's systemd timer. No action needed unless renewal fails.

### Check cert status

```bash
sudo certbot certificates
```

Shows expiry date and which domains are covered.

### Check renewal timer

```bash
sudo systemctl list-timers | grep certbot
```

You should see `certbot.timer` listed and scheduled to run twice daily.

### Force a renewal (testing only)

```bash
sudo certbot renew --dry-run
```

This simulates the renewal without actually requesting a new cert. Useful for confirming the renewal path is healthy.

---

## Troubleshooting

### Site is down — 502 Bad Gateway

nginx is up but can't reach the backend or frontend container.

```bash
docker compose -f docker-compose.prod.yml ps          # are containers running?
docker compose -f docker-compose.prod.yml logs --tail=50 backend
docker compose -f docker-compose.prod.yml logs --tail=50 frontend
```

If a container is stuck restarting, the logs will say why. Common causes:
- Bad `.env` value (e.g., malformed `DATABASE_URL`)
- Missing dependency in a fresh build
- DB container not healthy yet — backend should retry, but if it gave up, `docker compose ... restart backend`

### Site is down — connection refused / timeout

nginx itself is down or the firewall is blocking.

```bash
sudo systemctl status nginx
sudo nginx -t                              # check config syntax
sudo systemctl reload nginx                # apply config changes
sudo ufw status                            # firewall should allow OpenSSH + Nginx Full
```

### "Cannot connect to the Docker daemon"

You're probably running as root or a user not in the `docker` group. Use `su - deploy` first.

### Out of disk

```bash
df -h
docker system prune -af
```

If still tight, the next biggest culprits are usually Docker image layers and old logs:

```bash
sudo journalctl --vacuum-time=7d
```

### Out of memory during `next build`

The 1 GB droplet is tight for Next.js builds. If `docker compose up --build` gets OOM-killed, add a swap file:

```bash
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
```

This gives the build ~2 GB of swap to lean on. One-time setup, persists across reboots.

### DNS not resolving

```bash
dig +short convertme.co.uk @1.1.1.1
dig +short convertme.co.uk @8.8.8.8
```

Both should return `46.101.76.57`. If they don't, check the Fasthosts Advanced DNS panel — the two A records (`@` and `www`) should both point to `46.101.76.57`.

---

## Security todo (worth doing soon)

These are recommended hardening steps you haven't done yet:

1. **Disable root SSH login**. Once you're confident logging in as `deploy` works, edit `/etc/ssh/sshd_config`: set `PermitRootLogin no` and `PasswordAuthentication no` (after the SSH key step below). Then `sudo systemctl reload ssh`.

2. **Set up SSH keys** for the `deploy` user. On your Mac: `ssh-keygen -t ed25519` then `ssh-copy-id deploy@46.101.76.57`. After that you'll log in without a password. (You can keep using the DO web console too — these aren't exclusive.)

3. **Automate database backups** with a daily cron job that rotates old files.

4. **Add fail2ban** to auto-ban IPs that fail SSH login repeatedly.

5. **Monitoring**: a free UptimeRobot or Better Stack account can ping convertme.co.uk every 5 min and email you if it goes down.

---

## Quick reference card

```bash
# Deploy latest main
ssh deploy@46.101.76.57 'cd ~/convertme && git pull && docker compose -f docker-compose.prod.yml up -d --build'

# Status
docker compose -f docker-compose.prod.yml ps

# Logs
docker compose -f docker-compose.prod.yml logs -f backend

# Restart backend
docker compose -f docker-compose.prod.yml restart backend

# DB shell
docker compose -f docker-compose.prod.yml exec db psql -U convertme -d convertme

# Backup
docker compose -f docker-compose.prod.yml exec -T db pg_dump -U convertme convertme > ~/backups/convertme-$(date +%Y%m%d-%H%M%S).sql

# Cert status
sudo certbot certificates

# nginx reload
sudo nginx -t && sudo systemctl reload nginx
```
