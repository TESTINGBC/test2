# GitHub Actions Workflows

Automated CI/CD workflows for MemberJunction applications. All workflows are auto-configured by MJ Central.

## Workflows

### `mj-setup.yml` - Initial MJ Setup
**Trigger:** Manual dispatch only

Initializes or updates the MemberJunction core schema (`__mj`). Run this:
- After initial provisioning (new empty database)
- After MJ version upgrades (updating `@memberjunction/cli` in package.json)

**What it does:**
1. Runs MJ Core migrations (`npx mj migrate`)
2. Installs SQL Server tools
3. Runs CodeGen (`npx mj codegen`)
4. Commits generated code
5. Triggers deploy workflows

---

### `schema-migration.yml` - Database Migrations
**Trigger:** Push to `SQL Scripts/migrations/**` or manual dispatch

Runs your custom Flyway migrations and regenerates entities.

**What it does:**
1. Runs Flyway migrations (custom schema changes)
2. Installs SQL Server tools
3. Runs CodeGen to update generated entities
4. Commits generated code
5. Triggers deploy workflows

---

### `deploy-api.yml` - Deploy MJAPI
**Trigger:** Push to `apps/MJAPI/**` or `packages/Generated*/**`

Builds and deploys the GraphQL API to Azure App Service.

**What it does:**
1. Builds GeneratedEntities/Actions packages
2. Builds MJAPI
3. Creates deployment zip
4. Deploys to Azure App Service

---

### `deploy-explorer.yml` - Deploy MJExplorer
**Trigger:** Push to `apps/MJExplorer/**` or `packages/GeneratedEntities/**`

Builds and deploys the Angular admin UI to Azure Static Web Apps.

**What it does:**
1. Builds GeneratedEntities package
2. Generates `environment.ts` with API URLs from GitHub variables
3. Builds Angular app (production mode)
4. Deploys to Azure Static Web Apps

---

## Environment Configuration

Workflows use dynamic secret/variable resolution based on branch name:

| Branch | Secret Suffix | Example Secrets |
|--------|---------------|-----------------|
| `dev` | `DEV` | `AZURE_CREDENTIALS_DEV`, `DB_HOST_DEV`, `DB_DATABASE_DEV` |
| `stage` | `STAGE` | `AZURE_CREDENTIALS_STAGE`, `DB_HOST_STAGE`, `DB_DATABASE_STAGE` |
| `prod-east` | `PROD_EAST` | `AZURE_CREDENTIALS_PROD_EAST`, `DB_HOST_PROD_EAST`, `DB_DATABASE_PROD_EAST` |

**Secrets (per environment):**
- `AZURE_CREDENTIALS_{ENV}` - Service principal JSON
- `DB_HOST_{ENV}` - SQL Server hostname
- `DB_DATABASE_{ENV}` - Database name
- `DB_USERNAME_{ENV}` - Database admin username
- `DB_PASSWORD_{ENV}` - Database admin password

**Variables (per environment):**
- `RESOURCE_GROUP_{ENV}` - Azure resource group
- `APP_SERVICE_NAME_{ENV}` - API App Service name
- `EXPLORER_APP_NAME_{ENV}` - Static Web App name
- `API_URL_{ENV}` - API public URL
- `EXPLORER_URL_{ENV}` - Explorer public URL

---

## Customizing Branch Triggers

By default, workflows trigger on all branches (`["**"]`). After setup, restrict to your environment branches:

```yaml
# .github/workflows/deploy-api.yml (line 16)
branches: ["dev", "stage", "main"]  # Replace ["**"]
```

---

## Manual Workflow Dispatch

1. Go to **Actions** tab
2. Select workflow
3. Click **Run workflow**
4. Select branch and fill inputs
5. Click **Run workflow**

---

## Troubleshooting

| Issue | Cause | Solution |
|-------|-------|----------|
| Azure login fails | Missing/invalid credentials | Check `AZURE_CREDENTIALS_{ENV}` secret |
| SWA deploy fails | Can't fetch token | Verify `EXPLORER_APP_NAME_{ENV}` matches Azure resource |
| DB connection fails | Firewall blocking | Enable "Allow Azure services" on SQL Server |
| CodeGen fails | Missing SQL tools | Workflows now install `mssql-tools18` automatically |
| API won't start | Wrong port | Set `GRAPHQL_PORT=8080` in App Service config |
