# Azure Vibesite

A full‑stack, terminal‑styled discussion board. React + TypeScript SPA, Node/Express API with JWT auth, Azure SQL for data, and Azure Blob Storage for media. CI/CD via GitHub Actions to Azure App Service (API) and Azure Storage Static Website (frontend).


---

## Features

* Role‑based forum: users, posts, comments, replies, basic moderation
* JWT authentication (Bearer token), password hashing (bcrypt), strict CORS
* Image uploads to Azure Blob via server‑validated `multer`
* Production builds: SPA → Azure Storage `$web`; API → Azure App Service
* Environment‑driven configuration

---


**Ports & Paths**

* SPA served from Azure Storage Static Website (`$web`) as a single‑page app
* API mounted under `/api/*` on Azure App Service

---

## Tech Stack

* **Frontend:** React 18, TypeScript, React Router, Axios
* **Backend:** Node.js 20, Express 4, `jsonwebtoken`, `bcrypt`, `multer`, `mssql`
* **Azure:** Azure SQL, Azure Blob Storage, Azure App Service (Linux, Node), Azure Storage Static Website
* **CI/CD:** GitHub Actions (`azure/login`, `webapps-deploy`, `az storage blob upload-batch`)

---

## Repository Layout

```
frontend/    # React + TS SPA (terminal theme)
backend/     # Express API (JWT, SQL, Blob)
.github/     # CI/CD workflows
```

---

## Prerequisites

* Node.js 20+
* Azure subscription with:

  * Azure SQL database & login
  * Azure Storage account with **Static website** enabled
  * Blob container for images (e.g. `post-images`)
  * Azure App Service (Linux, Node 20) for the API
* Azure CLI authenticated: `az login`

---

## Configuration — Environment Variables

Create **`backend/.env`** (never commit this file):

```ini
# Server
PORT=5000
FRONTEND_URL=https://<your-static-site>.z*.web.core.windows.net

# Azure SQL
DB_SERVER=<server>.database.windows.net
DB_PORT=1433
DB_USER=<sql-admin>
DB_PASSWORD=<password>
DB_DATABASE=<db-name>
DB_ENCRYPT=true
DB_TRUST_SERVER_CERTIFICATE=false

# Azure Blob
AZURE_STORAGE_CONNECTION_STRING=<storage-connection-string>
AZURE_IMAGE_CONTAINER=post-images

# Auth
JWT_SECRET=<long-random-secret>
JWT_EXPIRES_IN=1h
NODE_ENV=production
```

Create **`frontend/.env.development`** and **`frontend/.env.production`**:

```ini
REACT_APP_API_URL=https://<your-api>.azurewebsites.net/api
```

> Update `frontend/src/setupAxios.ts` to read from `process.env.REACT_APP_API_URL` instead of a hardcoded URL.

---

## Database Initialization

Run schema on your Azure SQL database (Azure Data Studio or `sqlcmd`):

```bash
sqlcmd -S <server>.database.windows.net -d <db> -U <user> -P "<password>" -i backend/combined_schema.sql
```

Optional: promote your user to admin:

```sql
UPDATE dbo.Users SET role = 'admin' WHERE username = '<your_admin_username>';
```

---

## Local Development

**Backend**

```bash
cd backend
npm ci
npm start   # or: npm run dev
```

**Frontend**

```bash
cd frontend
npm ci
npm start
```

Visit [http://localhost:3000](http://localhost:3000) (API at [http://localhost:5000](http://localhost:5000)).

---

## Deployment — Azure

### Frontend → Azure Storage (Static Website)

1. Build SPA:

```bash
cd frontend && npm run build
```

2. Enable **Static website** on Storage (`index.html` / `404.html`).
3. Upload build to `$web`:

```bash
az storage blob upload-batch \
  --account-name <storageAccount> \
  --source frontend/build \
  --destination '$web' \
  --overwrite
```

### API → Azure App Service (Linux, Node 20)

1. Create App Service; add all **backend/.env** keys in **Configuration → Application settings**.
2. Deploy via GitHub Actions or:

```bash
cd backend
zip -r release.zip .
az webapp deploy --name <appName> --resource-group <rg> --src-path release.zip
```

### CORS

Allow `FRONTEND_URL` and `http://localhost:3000`. Keep the allow‑list tight.

---

## CI/CD — GitHub Actions (example)

**`.github/workflows/deploy.yml`**

```yaml
name: deploy
on:
  push:
    branches: [ main ]

jobs:
  api:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: '20' }
      - name: Package API
        run: |
          cd backend
          npm ci
          zip -r release.zip .
      - uses: azure/login@v2
        with:
          client-id: ${{ secrets.AZUREAPPSERVICE_CLIENTID }}
          tenant-id: ${{ secrets.TENANTID }}
          subscription-id: ${{ secrets.SUBSCRIPTIONID }}
      - name: Deploy API
        uses: azure/webapps-deploy@v3
        with:
          app-name: <your-app-service-name>
          package: backend/release.zip

  frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: '20' }
      - name: Build SPA
        run: |
          cd frontend
          npm ci
          npm run build
      - name: Upload to $web
        uses: azure/CLI@v2
        with:
          inlineScript: |
            az storage blob upload-batch \
              --account-name ${{ secrets.AZURE_STORAGE_ACCOUNT }} \
              --source frontend/build \
              --destination '$web' \
              --overwrite
```

Store secrets in **Repo → Settings → Secrets and variables → Actions**.

---

## API Endpoints (from code)

**Auth & Session**

* `POST /api/register` — create user
* `POST /api/login` — authenticate and issue JWT
* `POST /api/logout` — stateless; client clears token
* `GET /api/me` — current user (JWT required)
* `PUT /api/update-password` — change password (JWT required)

**Images**

* `POST /api/upload-image` — upload to Azure Blob (JWT required)

**Posts**

* `GET /api/posts` — list posts (supports `?community=...`)
* `GET /api/posts/:id` — get post by id
* `POST /api/posts` — create post (JWT)
* `PUT /api/posts/:postId` — update post (owner/admin)
* `DELETE /api/posts/:postId` — delete post (owner/admin)

> Note: code also registers `DELETE /api/posts/:id`. Prefer the `:postId` variant and remove the duplicate route.

**Comments**

* `GET /api/posts/:postId/comments` — list comments
* `POST /api/posts/:postId/comments` — add comment (JWT)
* `PUT /api/comments/:commentId` — update comment (owner/admin)
* `DELETE /api/comments/:commentId` — delete comment (owner/admin)

**Replies**

* `GET /api/comments/:commentId/replies` — list replies
* `POST /api/comments/:commentId/replies` — add reply (JWT)
* `PUT /api/replies/:replyId` — update reply (owner/admin)
* `DELETE /api/replies/:replyId` — delete reply (owner/admin)

**Admin (JWT + admin role)**

* `GET /api/users` — list users (excludes password)
* `GET /api/users/:userId` — fetch user
* `PUT /api/users/:userId` — update user (role/email)
* `DELETE /api/users/:userId` — delete user (self‑delete prevented)

---

## Database Model (from `backend/combined_schema.sql`)

* **Users**: `id`, `username`, `email`, `password_hash`, `role` (`user|admin`), `created_at`, `updated_at`
* **Posts**: `id`, `user_id`, `title`, `content`, `image_url`, `community`, `created_at`
* **Comments**: `id`, `post_id`, `user_id`, `comment_text`, `created_at`
* **Replies**: `id`, `comment_id`, `user_id`, `reply_text`, `created_at`

---

## Configuration Notes & Hardening

* **TLS to SQL:** `DB_ENCRYPT=true`, `DB_TRUST_SERVER_CERTIFICATE=false`

  * In code, ensure you do **not invert** `trustServerCertificate`.
* **Axios baseURL:** `frontend/src/setupAxios.ts` currently hardcodes an Azure URL. Replace with `process.env.REACT_APP_API_URL`.
* **Uploads:** Enforce MIME allow‑list and size limits in `multer` and validate before writing to Blob.
* **CORS:** Tight allow‑list using `FRONTEND_URL`; include `http://localhost:3000` for dev only.
* **Secrets:** No secrets in Git; rotate any previous leaks. Use App Service settings + Actions Secrets.
