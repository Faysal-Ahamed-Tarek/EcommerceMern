# DrSkinC — VPS Deployment Guide

**VPS IP:** 147.93.28.244  
**Store:** https://drskinc.com  
**Admin:** https://admin.drskinc.com  

---

## Before You Start — Do These 3 Things First

**1. MongoDB Atlas — Allow VPS IP**

Log in to [cloud.mongodb.com](https://cloud.mongodb.com) → your cluster → Network Access → Add IP Address → type `147.93.28.244` → Confirm.

**2. Gmail App Password for Password Reset Emails**

Go to [myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords) → Select app: Mail → Generate → copy the 16-character password. You will need it in Step 4.

**3. DNS Check — Make Sure Both Domains Point to Your VPS**

Run this on your local machine:
```bash
nslookup drskinc.com
nslookup admin.drskinc.com
```
Both should return `147.93.28.244`. If not, wait 10–30 minutes for DNS to propagate before continuing.

---

## PART A — On Your Local Machine

### Step 1 — Push Your Code to the VPS

First, create the target folder on the VPS (only needed once):

```bash
ssh root@147.93.28.244 "mkdir -p /var/www/drskinc"
```

Then copy the entire project, skipping `node_modules`, build folders, and local-only env files:

```bash
rsync -avz --progress \
  --exclude 'node_modules' \
  --exclude '.next' \
  --exclude 'dist' \
  --exclude '.git' \
  --exclude '.env.local' \
  --exclude 'backend/.env' \
  /home/faysal/Desktop/Ecommerce/ \
  root@147.93.28.244:/var/www/drskinc/
```

> **Why exclude `.env.local` and `backend/.env`?**
> `.env.local` is your local dev config (points to `localhost:5000`). If it reaches the VPS, Next.js loads it with highest priority and bakes `localhost:5000` into the production JS bundle — breaking every API call in the browser.
> `backend/.env` is your local dev config (`NODE_ENV=development`, `ADMIN_ALLOWED_ORIGINS=http://localhost:3000`). The VPS has its own production `.env` created in Step 4 — never overwrite it.

Both commands will ask for your VPS root password from Hostinger.

---

## PART B — On the VPS

SSH into your VPS:
```bash
ssh root@147.93.28.244
```

---

### Step 2 — Install System Packages

Run each block one at a time:

```bash
# Update system
apt update && apt upgrade -y
```

```bash
# Install Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs
node -v   
# should show v20.x
```

```bash
# Install PM2, Nginx, Certbot, UFW
npm install -g pm2
apt install -y nginx certbot python3-certbot-nginx ufw
```

```bash
# Set correct permissions on project folder
mkdir -p /var/www/drskinc
chown -R root:root /var/www/drskinc
```

---

### Step 3 — Verify Files Are Uploaded

```bash
ls /var/www/drskinc
```

You should see: `backend  frontend  ecosystem.config.js  CONTEXT.md  ...`

If the folder is empty, go back and re-run the rsync command from Step 1.

---

### Step 4 — Create Production Environment Files

**Backend env** — copy and paste this entire block into your terminal:

```bash
cat > /var/www/drskinc/backend/.env << 'EOF'
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb+srv://faysalahamedtarek1_db_user:P2cdX1HzdSb7uHTM@cluster0.z46oscg.mongodb.net/ecommerce?retryWrites=true&w=majority&appName=Cluster0
JWT_SECRET=a60bc4995501745a4d5b9f21996ac785404c61f3b04126e5ec90c262cf4dc461b8ab10d478fbef10f64b6591d2fa281c48a39b94e824a33a04f2580bed472954
JWT_EXPIRES_IN=7d
ADMIN_ALLOWED_ORIGINS=https://drskinc.com,https://admin.drskinc.com
ADMIN_LOGIN_MAX_ATTEMPTS=5
ADMIN_LOGIN_LOCK_MINUTES=15
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=anwarmdnoor@gmail.com
SMTP_PASS=PASTE_YOUR_GMAIL_APP_PASSWORD_HERE
EOF
```

> Replace `PASTE_YOUR_GMAIL_APP_PASSWORD_HERE` with the App Password you generated in "Before You Start". To edit it after creating: `nano /var/www/drskinc/backend/.env`

**Frontend env** — copy and paste this entire block:

```bash
cat > /var/www/drskinc/frontend/.env.production << 'EOF'
NEXT_PUBLIC_API_URL=https://drskinc.com/api
NEXT_PUBLIC_SITE_URL=https://drskinc.com
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=dxfexhh0y
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=my_app_preset
EOF
```

Secure the backend env file:
```bash
chmod 600 /var/www/drskinc/backend/.env
```

---

### Step 5 — Install Dependencies and Build

```bash
cd /var/www/drskinc
```

**Build the backend:**
```bash
cd backend
npm install
npm run build
mkdir -p logs
cd ..
```

You should see a `dist/` folder created. If there are TypeScript errors, stop and fix them locally first.

**Build the frontend:**
```bash
cd frontend
npm install
npm run build
```

This takes 2–5 minutes. When it finishes:

```bash
mkdir -p logs
cd ..
```

Verify both builds succeeded:
```bash
ls backend/dist/index.js          # must exist
ls frontend/.next/BUILD_ID        # must exist
```

---

### Step 6 — Configure Nginx

Create the Nginx config:

```bash
nano /etc/nginx/sites-available/drskinc
```

Paste this entire config (Ctrl+Shift+V to paste in terminal, then Ctrl+O to save, Ctrl+X to exit):

```nginx
map $http_upgrade $connection_upgrade {
    default upgrade;
    ''      close;
}

# ── Main store: drskinc.com ───────────────────────────────────────────────────
server {
    listen 80;
    server_name drskinc.com www.drskinc.com;

    # Redirect www to non-www
    if ($host = www.drskinc.com) {
        return 301 https://drskinc.com$request_uri;
    }

    gzip on;
    gzip_vary on;
    gzip_proxied any;
    gzip_comp_level 5;
    gzip_types text/plain text/css application/json application/javascript
               text/xml application/xml text/javascript;
    gzip_min_length 1000;

    # Next.js static files — cache forever (filenames are content-hashed)
    location /_next/static/ {
        proxy_pass http://127.0.0.1:3000;
        proxy_set_header Host $host;
        add_header Cache-Control "public, max-age=31536000, immutable";
    }

    # Health check — no logs needed
    location = /health {
        proxy_pass http://127.0.0.1:5000;
        proxy_set_header Host $host;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        access_log off;
    }

    # Backend API
    location /api/ {
        proxy_pass         http://127.0.0.1:5000;
        proxy_http_version 1.1;
        proxy_set_header   Host              $host;
        proxy_set_header   X-Real-IP         $remote_addr;
        proxy_set_header   X-Forwarded-For   $proxy_add_x_forwarded_for;
        proxy_set_header   X-Forwarded-Proto $scheme;
        proxy_read_timeout 30s;
        client_max_body_size 10m;
    }

    # Next.js frontend
    location / {
        proxy_pass         http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header   Upgrade           $http_upgrade;
        proxy_set_header   Connection        $connection_upgrade;
        proxy_set_header   Host              $host;
        proxy_set_header   X-Real-IP         $remote_addr;
        proxy_set_header   X-Forwarded-For   $proxy_add_x_forwarded_for;
        proxy_set_header   X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}

# ── Admin panel: admin.drskinc.com ────────────────────────────────────────────
server {
    listen 80;
    server_name admin.drskinc.com;

    gzip on;
    gzip_vary on;
    gzip_proxied any;
    gzip_comp_level 5;
    gzip_types text/plain text/css application/json application/javascript
               text/xml application/xml text/javascript;
    gzip_min_length 1000;

    location /_next/static/ {
        proxy_pass http://127.0.0.1:3000;
        proxy_set_header Host $host;
        add_header Cache-Control "public, max-age=31536000, immutable";
    }

    location /api/ {
        proxy_pass         http://127.0.0.1:5000;
        proxy_http_version 1.1;
        proxy_set_header   Host              $host;
        proxy_set_header   X-Real-IP         $remote_addr;
        proxy_set_header   X-Forwarded-For   $proxy_add_x_forwarded_for;
        proxy_set_header   X-Forwarded-Proto $scheme;
        proxy_read_timeout 30s;
        client_max_body_size 10m;
    }

    # IMPORTANT: Host header must be passed so Next.js middleware
    # detects admin.drskinc.com and routes to /admin/* pages
    location / {
        proxy_pass         http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header   Upgrade           $http_upgrade;
        proxy_set_header   Connection        $connection_upgrade;
        proxy_set_header   Host              $host;
        proxy_set_header   X-Real-IP         $remote_addr;
        proxy_set_header   X-Forwarded-For   $proxy_add_x_forwarded_for;
        proxy_set_header   X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Enable the config and test it:

```bash
ln -s /etc/nginx/sites-available/drskinc /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default
nginx -t
```

You must see `syntax is ok` and `test is successful`. If not, recheck what you pasted.

```bash
systemctl reload nginx
```

---

### Step 7 — Get SSL Certificates

```bash
certbot --nginx \
  -d drskinc.com \
  -d www.drskinc.com \
  -d admin.drskinc.com \
  --non-interactive \
  --agree-tos \
  -m anwarmdnoor@gmail.com
```

This takes about 30 seconds. Certbot automatically updates your Nginx config to handle HTTPS and redirect HTTP → HTTPS.

Verify auto-renewal will work in future:
```bash
certbot renew --dry-run
```

Should say `Congratulations, all simulated renewals succeeded`.

---

### Step 8 — Start Both Apps with PM2

```bash
cd /var/www/drskinc

# Start backend and frontend
pm2 start ecosystem.config.js --env production

# Check they are both running
pm2 status
```

Both `drskinc-backend` and `drskinc-frontend` should show `online`. If either shows `errored`, check its logs:
```bash
pm2 logs drskinc-backend --lines 30
pm2 logs drskinc-frontend --lines 30
```

**Save PM2 state so apps restart automatically after a VPS reboot:**
```bash
pm2 save

pm2 startup systemd -u root --hp /root
```

The second command prints a line starting with `sudo env PATH=...`. Copy and paste that exact line and run it.

**Set up log rotation so logs don't fill up your disk:**
```bash
pm2 install pm2-logrotate
pm2 set pm2-logrotate:max_size 20M
pm2 set pm2-logrotate:retain 7
pm2 set pm2-logrotate:compress true
```

---

### Step 9 — Firewall

```bash
ufw allow OpenSSH
ufw allow 'Nginx Full'
ufw --force enable
ufw status
```

You should see ports 22, 80, 443 open. Ports 3000 and 5000 stay closed to the internet — only Nginx reaches them internally.

---

### Step 10 — Smoke Test

Run each check and make sure it returns the expected result:

```bash
# 1. Backend health check — should return: {"status":"ok","db":"connected",...}
curl https://drskinc.com/health

# 2. Homepage — should return: 200
curl -s -o /dev/null -w "%{http_code}" https://drskinc.com

# 3. Admin panel — should return: 200 (and redirect to /admin/login in browser)
curl -s -o /dev/null -w "%{http_code}" https://admin.drskinc.com

# 4. API working — should return categories list
curl https://drskinc.com/api/categories

# 5. Both processes running
pm2 status
```

Now open in your browser:
- `https://drskinc.com` — should show your store homepage
- `https://admin.drskinc.com` — should show your admin login page

---

## PART C — Every Time You Update Code (Future Deploys)

Whenever you make changes in VS Code, follow these 3 steps:

### Step 1 — Push from your local machine

```bash
# Run from your local machine
rsync -avz --progress \
  --exclude 'node_modules' \
  --exclude '.next' \
  --exclude 'dist' \
  --exclude '.git' \
  --exclude '.env.local' \
  --exclude 'backend/.env' \
  /home/faysal/Desktop/Ecommerce/ \
  root@147.93.28.244:/var/www/drskinc/
```

### Step 2 — SSH and rebuild on VPS

```bash
ssh root@147.93.28.244
cd /var/www/drskinc
```

If you changed **backend** files:
```bash
cd backend && npm run build && cd ..
pm2 restart drskinc-backend
```

If you changed **frontend** files:
```bash
cd frontend && npm run build && cd ..
pm2 restart drskinc-frontend
```

If you changed **both**:
```bash
cd backend && npm run build && cd ..
cd frontend && npm run build && cd ..
pm2 restart all
```

### Step 3 — Check it worked

```bash
pm2 status
curl https://drskinc.com/health
```

Then refresh your browser to verify the changes are live.

---

## Useful Commands (Reference)

```bash
# See live CPU and RAM usage
pm2 monit

# See recent logs
pm2 logs drskinc-backend --lines 30
pm2 logs drskinc-frontend --lines 30

# Restart a specific app
pm2 restart drskinc-backend
pm2 restart drskinc-frontend

# Restart everything
pm2 restart all

# Check Nginx config after any changes
nginx -t && systemctl reload nginx

# Edit backend env
nano /var/www/drskinc/backend/.env

# Edit frontend env
nano /var/www/drskinc/frontend/.env.production

# Renew SSL manually if needed (runs automatically via cron)
certbot renew

# Check disk space
df -h

# Check RAM usage
free -h
```

---

## Set Up Free Uptime Monitoring (Do This After Launch)

1. Go to [uptimerobot.com](https://uptimerobot.com) → sign up free
2. Add Monitor → HTTP(S) → URL: `https://drskinc.com/health`
3. Check interval: 5 minutes
4. Alert email: your email
5. Add a second monitor for `https://admin.drskinc.com`

You will get an email within 5 minutes if the site goes down.
