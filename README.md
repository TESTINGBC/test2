# MemberJunction Template

A production-ready monorepo template for building applications with [MemberJunction](https://www.memberjunction.org/), an open-source metadata-driven development platform. This template provides a complete starting point with API server, admin UI, and monorepo infrastructure configured and ready to use.

## What's Included

This template includes:

- **MJ API** (`apps/MJAPI`) - GraphQL API server with MemberJunction core
- **MJ Explorer** (`apps/MJExplorer`) - Angular-based admin UI for data management
- **Generated Entities** (`packages/GeneratedEntities`) - Auto-generated TypeScript entity classes
- **Generated Actions** (`packages/GeneratedActions`) - Auto-generated business logic actions
- **Monorepo Infrastructure** - npm workspaces + Turbo for optimized builds
- **Database Migrations** - Flyway-compatible SQL migration structure
- **Multi-Provider Authentication** - Support for Azure AD, Auth0, and Okta

## Prerequisites

### Required Software

- **Node.js 22+** (specified in `.nvmrc`)
- **npm 11.2.0+** (specified in `packageManager`)
- **SQL Server** (Azure SQL Database or local SQL Server instance)
- **Git** for version control

### Database Setup

1. Create a SQL Server database for your application
2. Create two database users:
   - `MJ_Connect` - Runtime user for API connections (read/write)
   - `MJ_CodeGen` - CodeGen user for schema modifications (elevated permissions)
3. Grant appropriate permissions:
   ```sql
   -- MJ_Connect needs db_datareader and db_datawriter
   ALTER ROLE db_datareader ADD MEMBER MJ_Connect;
   ALTER ROLE db_datawriter ADD MEMBER MJ_Connect;

   -- MJ_CodeGen needs elevated permissions for schema changes
   ALTER ROLE db_owner ADD MEMBER MJ_CodeGen;
   ```

### Authentication Provider

Choose one authentication provider and set up credentials:

**Option 1: Azure AD / Entra ID** (Recommended for enterprise)
- Register an Azure AD application
- Note your Tenant ID and Client ID

**Option 2: Auth0**
- Create an Auth0 application
- Note your Domain, Client ID, and Client Secret

**Option 3: Okta**
- Create an Okta application
- Note your Domain, Client ID, and Client Secret

## Quick Start

### 1. Clone or Copy This Template

```bash
# If using as a GitHub template
git clone <your-repo-url>
cd <your-repo-name>

# Or if copied locally
cd <your-project-directory>
```

### 2. Install Dependencies

```bash
npm install
```

This will install all dependencies across all workspaces using npm workspaces and Turbo.

### 3. Configure Environment

This template uses **dotenvx** for secure environment configuration. Create a `.env.local` file for local development:

```bash
# 1. Copy the example file
cp .env.example .env.local

# 2. Edit with your credentials
# Get credentials from MJ Central dashboard, your team admin, or password manager
vim .env.local
```

**Required values to update:**
- `DB_HOST` - Your SQL Server hostname
- `DB_DATABASE` - Database name
- `DB_PASSWORD` - Runtime user password
- `CODEGEN_DB_PASSWORD` - CodeGen user password
- `TENANT_ID` / `WEB_CLIENT_ID` - Authentication config (or Auth0/Okta equivalents)

#### (Optional) Encrypt for Team Sharing

If you need to share credentials with your team securely:

```bash
# 1. Encrypt the file
npx dotenvx encrypt -f .env.local

# 2. Save the private key displayed
# dotenvx will show: DOTENV_PRIVATE_KEY_LOCAL="027..."
# Save this to your password manager

# 3. Set the key in your shell
export DOTENV_PRIVATE_KEY_LOCAL="your-key-here"
echo 'export DOTENV_PRIVATE_KEY_LOCAL="..."' >> ~/.zshrc

# 4. Commit the encrypted file (safe to commit)
git add .env.local
git commit -m "Add encrypted local environment config"
```

**Security Notes:**
- ✅ Encrypted `.env.*` files CAN be committed to git
- ❌ `.env.keys` file must NEVER be committed (contains private keys)
- 🔐 Share private keys via secure channel (password manager, NOT git/Slack)

### 4. Initialize MemberJunction

Run the MemberJunction setup to initialize the database schema:

```bash
npm run migrate
```

This will:
- Create the `__mj` core schema
- Set up all MemberJunction tables, views, and stored procedures
- Run any custom migrations in `SQL Scripts/migrations/`

### 5. Generate Code

Generate TypeScript entities and GraphQL resolvers from your database schema:

```bash
npm run codegen
```

This will:
- Scan your database schema
- Generate entity classes in `packages/GeneratedEntities/src/generated/`
- Generate action classes in `packages/GeneratedActions/src/generated/`
- Generate GraphQL resolvers in `apps/MJAPI/src/generated/`
- Generate Angular components in `apps/MJExplorer/src/app/generated/`

### 6. Build All Packages

Build all packages in dependency order using Turbo:

```bash
npm run build
```

This uses Turbo's intelligent caching - subsequent builds will be much faster!

### 7. Start the Applications

**Start the API server:**
```bash
npm run start:api
```

The GraphQL API will be available at `http://localhost:4000`

**Start the Explorer UI (in a new terminal):**
```bash
npm run start:explorer
```

The Angular UI will be available at `http://localhost:4200`

## Working with Multiple Environments

By default, all commands use `.env.local` for local development. If you need to work with multiple remote environments (e.g., connecting to staging or production databases locally), you can add additional environment files.

### Adding Additional Environments

1. **Create the environment file:**
   ```bash
   cp .env.example .env.staging
   # Edit .env.staging with staging credentials
   ```

2. **Add scripts to `package.json`:**
   ```json
   {
     "scripts": {
       "env:staging": "dotenvx run -f .env.staging --",
       "start:api:staging": "npm run env:staging -- npm run start --workspace=apps/MJAPI",
       "codegen:staging": "npm run env:staging -- mj codegen",
       "migrate:staging": "npm run env:staging -- mj migrate --tag=main"
     }
   }
   ```

3. **Run commands with that environment:**
   ```bash
   npm run start:api:staging   # Local API → staging database
   npm run codegen:staging     # Generate from staging database
   ```

### Example: Common Environment Patterns

**Two environments (staging + production):**
```json
{
  "scripts": {
    "env:staging": "dotenvx run -f .env.staging --",
    "env:production": "dotenvx run -f .env.production --",
    "start:api:staging": "npm run env:staging -- npm run start --workspace=apps/MJAPI",
    "start:api:production": "npm run env:production -- npm run start --workspace=apps/MJAPI"
  }
}
```

**Custom environment names:**
```json
{
  "scripts": {
    "env:preview": "dotenvx run -f .env.preview --",
    "env:live": "dotenvx run -f .env.live --",
    "start:api:preview": "npm run env:preview -- npm run start --workspace=apps/MJAPI",
    "start:api:live": "npm run env:live -- npm run start --workspace=apps/MJAPI"
  }
}
```

**Note:** The default commands (`npm run start:api`, `npm run migrate`, etc.) always use `.env.local`.

## Project Structure

```
.
├── apps/                           # Applications
│   ├── MJAPI/                     # GraphQL API Server
│   │   ├── src/
│   │   │   ├── generated/         # Auto-generated GraphQL resolvers
│   │   │   └── index.ts           # API entry point
│   │   ├── package.json
│   │   └── tsconfig.json
│   └── MJExplorer/                # Angular Admin UI
│       ├── src/
│       │   ├── app/
│       │   │   └── generated/     # Auto-generated Angular components
│       │   └── environments/      # Environment configs
│       └── package.json
│
├── packages/                       # Shared Packages
│   ├── GeneratedEntities/         # Auto-generated entity classes
│   │   ├── src/
│   │   │   ├── generated/         # Entity subclasses (auto-generated)
│   │   │   └── index.ts           # Package exports
│   │   └── package.json
│   └── GeneratedActions/          # Auto-generated action classes
│       ├── src/
│       │   ├── generated/         # Action subclasses (auto-generated)
│       │   └── index.ts           # Package exports
│       └── package.json
│
├── SQL Scripts/                    # SQL Scripts & Migrations
│   ├── migrations/                # Flyway migrations
│   ├── generated/                 # Auto-generated SQL (gitignored)
│   ├── MJ_BASE_BEFORE_SQL.sql    # Base schema setup
│   └── utilities/                 # Utility scripts
│
├── tools/                          # Build and migration tools
│   └── flyway/                    # Flyway wrapper scripts
│       └── db-migrate.js          # Environment-aware migration script
│
├── .env.example                    # Environment template (copy to .env.local)
├── .gitignore                     # Git ignore rules
├── .nvmrc                         # Node version specification
├── mj.config.cjs                  # MemberJunction configuration
├── package.json                   # Root workspace config
├── turbo.json                     # Turbo build config
└── README.md                      # This file
```

## Development Workflow

### Daily Development

1. **Make schema changes** - Modify your SQL Server database schema
2. **Run codegen** - `npm run codegen` to regenerate TypeScript classes
3. **Build** - `npm run build` (Turbo caches unchanged packages)
4. **Test** - Start API and Explorer to test changes

### Adding Custom Business Logic

#### Custom Entities (Server-Side)
Create custom entity subclasses with validation and business logic:

```typescript
// packages/GeneratedEntities/src/custom/MyCustomEntity.ts
import { MyCustomEntityBase } from '../generated/entity_subclasses';

export class MyCustomEntity extends MyCustomEntityBase {
  // Override Validate() for custom validation
  async Validate(): Promise<boolean> {
    const isValid = await super.Validate();

    // Add your custom validation
    if (!this.Get('Email')?.includes('@')) {
      this.Errors.push('Invalid email format');
      return false;
    }

    return isValid;
  }

  // Add custom methods
  async sendWelcomeEmail(): Promise<void> {
    // Your logic here
  }
}
```

#### Custom Actions
Create custom actions in `packages/GeneratedActions/src/custom/`:

```typescript
import { ActionBase } from '@memberjunction/actions-base';

export class SendReportAction extends ActionBase {
  async Execute(): Promise<void> {
    // Your action logic
  }
}
```

#### Custom GraphQL Resolvers
Add custom resolvers in `apps/MJAPI/src/custom/resolvers/`:

```typescript
// Future: Add custom GraphQL resolvers here
// These will extend the auto-generated schema
```

### Database Migrations

This template uses **two migration systems** for different purposes:

#### 1. Flyway Migrations (Custom Schema)

For YOUR custom application tables, use Flyway:

```bash
# Run custom schema migrations
npm run db
```

Create migration files in `SQL Scripts/migrations/`:

```sql
-- SQL Scripts/migrations/V001__add_customer_table.sql
CREATE TABLE myapp.Customer (
    ID UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWSEQUENTIALID(),
    Name NVARCHAR(255) NOT NULL,
    Email NVARCHAR(255),
    __mj_CreatedAt DATETIMEOFFSET NOT NULL DEFAULT(GETUTCDATE()),
    __mj_UpdatedAt DATETIMEOFFSET NOT NULL DEFAULT(GETUTCDATE())
);

-- Add extended properties for MemberJunction
EXEC sp_addextendedproperty
    @name = N'MS_Description',
    @value = N'Customer information',
    @level0type = N'SCHEMA', @level0name = N'myapp',
    @level1type = N'TABLE', @level1name = N'Customer';
```

**See [`SQL Scripts/migrations/README.md`](SQL%20Scripts/migrations/README.md) for complete guide.**

#### 2. MJ Core Migrations (MemberJunction Schema)

For MemberJunction core (`__mj` schema) updates:

```bash
# Update MJ core schema to match installed MJ version
npm run migrate
```

This updates MJ system tables when you upgrade `@memberjunction/*` packages.

**After any schema changes:**
```bash
npm run codegen   # Regenerate TypeScript entities
npm run build     # Rebuild applications
```

## Available Scripts

### Build Commands
- `npm run build` - Build all packages using Turbo
- `npm run build:packages` - Build only GeneratedEntities and GeneratedActions
- `npm run build:api` - Build only MJAPI
- `npm run build:explorer` - Build only MJExplorer

### Development Commands
- `npm run start:api` - Start the GraphQL API server (port 4000)
- `npm run start:explorer` - Start the Angular UI dev server (port 4200)

### MemberJunction Commands
- `npm run codegen` - Generate TypeScript entities from database schema
- `npm run migrate` - Run MJ core schema migrations (updates __mj tables)

### Database Migration Commands
- `npm run db` - Run Flyway migrations (custom schema)

### Environment Commands
- `npm run env` - Run any command with `.env.local` loaded (via dotenvx)
  ```bash
  # Example: run a custom command with environment loaded
  npm run env -- node my-script.js
  ```

### Code Quality Commands
- `npm run lint` - Run ESLint across all packages

### Utility Commands
- `npm run turbo` - Access Turbo CLI directly

## Configuration Files

### `mj.config.cjs`
Central configuration for MemberJunction code generation and API behavior.

**Key sections:**
- `output` - Where to generate code (entities, actions, GraphQL, Angular)
- `newEntityDefaults` - Default permissions and settings for new entities
- `authProviders` - Multi-provider authentication configuration
- `customSQLScripts` - SQL scripts to run before code generation

### `turbo.json`
Turbo build system configuration for monorepo optimization.

**Features:**
- Parallel builds across packages
- Intelligent caching (rebuilds only what changed)
- Dependency graph management

### `.env.local`
Your local environment configuration. Created by copying `.env.example`.

**Note:** Unencrypted `.env.*` files should NOT be committed. If sharing with team, encrypt first with `npx dotenvx encrypt`.

## Authentication Configuration

The template supports three authentication providers out of the box. The provider is determined by which environment variables you set:

### Azure AD / Entra ID
```bash
TENANT_ID=your-tenant-id
WEB_CLIENT_ID=your-client-id
```

### Auth0
```bash
AUTH0_DOMAIN=your-domain.auth0.com
AUTH0_CLIENT_ID=your-client-id
AUTH0_CLIENT_SECRET=your-client-secret
```

### Okta
```bash
OKTA_DOMAIN=your-domain.okta.com
OKTA_CLIENT_ID=your-client-id
OKTA_CLIENT_SECRET=your-client-secret
```

The `mj.config.cjs` automatically configures the correct provider based on which variables are present.

### Explorer Auth Configuration

> **⚠️ IMPORTANT: You must configure auth in TWO places for MJExplorer**

The Explorer UI needs authentication configured in environment files:

1. **For local development** - Edit `apps/MJExplorer/src/environments/environment.development.ts`:
   ```typescript
   CLIENT_ID: "your-azure-ad-client-id",
   TENANT_ID: "your-azure-ad-tenant-id",
   CLIENT_AUTHORITY: "https://login.microsoftonline.com/your-tenant-id"
   ```

2. **For CI/CD deployments** - Edit `apps/MJExplorer/src/environments/environment.ts`:
   ```typescript
   CLIENT_ID: "your-azure-ad-client-id",
   TENANT_ID: "your-azure-ad-tenant-id",
   CLIENT_AUTHORITY: "https://login.microsoftonline.com/your-tenant-id"
   ```

The `deploy-explorer.yml` workflow reads auth values from `environment.ts` and injects them into the production build. If these values are empty, authentication will fail in deployed environments.

## MemberJunction Concepts

### Metadata-Driven Development
MemberJunction scans your database schema and generates:
- TypeScript entity classes with strong typing
- GraphQL schema and resolvers
- Angular UI components
- SQL stored procedures

This means you design your data model in SQL, and MemberJunction generates all the application code.

### Entity System
All database tables become **Entities** with:
- Full CRUD operations
- Type-safe field access
- Validation rules
- Permission checking
- Audit trails

### RunView Pattern
Query entities using the RunView API:

```typescript
const rv = new RunView();
const result = await rv.RunView({
  EntityName: 'Customers',
  ExtraFilter: "Status = 'Active'",
  OrderBy: 'Name'
}, user);
```

### Actions Framework
Extend functionality with Actions:
- Scheduled tasks
- Event handlers
- Custom business logic
- Integration points

## Troubleshooting

### Build Fails with "Cannot find module './generated/...'"
This is expected before running `npm run codegen`. The generated files don't exist yet because they're created from your database schema.

**Solution:**
1. Set up your database
2. Configure `.env` with database credentials
3. Run `npm run migrate` to create the schema
4. Run `npm run codegen` to generate the files
5. Run `npm run build`

### "Authentication failed" when connecting to database
Check your `.env` configuration:
- Verify `DB_HOST`, `DB_USERNAME`, `DB_PASSWORD`
- Ensure `DB_TRUST_SERVER_CERTIFICATE=Y` for Azure SQL
- Confirm the database user has proper permissions

### "Cannot connect to SQL Server"
- Check firewall rules (especially for Azure SQL)
- Verify the SQL Server is running
- Test connection using SQL Server Management Studio or Azure Data Studio

### Codegen fails with permission errors
The `CODEGEN_DB_USERNAME` user needs elevated permissions:
```sql
ALTER ROLE db_owner ADD MEMBER MJ_CodeGen;
```

### Port already in use (4000 or 4200)
Stop the conflicting process or change the port:
- API: Set `GRAPHQL_PORT` in `.env`
- Explorer: Modify `angular.json` serve configuration

## Updating MemberJunction

To update to the latest MemberJunction version:

```bash
# Update MJ CLI
npm install @memberjunction/cli@latest

# Update MJAPI dependencies
cd apps/MJAPI
npm install @memberjunction/core@latest @memberjunction/server@latest
# ... update other @memberjunction packages

# Update MJExplorer dependencies
cd apps/MJExplorer
npm install @memberjunction/ng-explorer-core@latest
# ... update other @memberjunction/ng-* packages

# Regenerate code with new version
npm run codegen
npm run build
```

## Deployment

### Automated Deployment with MJ Central

This template works seamlessly with **MJ Central's environment provisioning**:

#### What MJ Central Provisions

When you create environments through MJ Central (e.g., "dev", "staging", "production", or custom names):

**For each environment:**
- GitHub branch (named after your environment, e.g., `dev`, `staging`, `prod-east`)
- Azure infrastructure (App Service, Static Web App, SQL Database)
- GitHub secrets with environment suffix (e.g., `AZURE_CREDENTIALS_DEV`)
- GitHub variables with environment suffix (e.g., `APP_SERVICE_NAME_DEV`)

> **⚠️ IMPORTANT: Environment Name Must Match Branch Name**
>
> When provisioning an environment in MJ Central, the **"Environment Name" must exactly match the branch name** you want to deploy from. The workflows derive the secret suffix from the branch name:
>
> - Branch `staging` → looks for `AZURE_CREDENTIALS_STAGING`
> - Branch `prod` → looks for `AZURE_CREDENTIALS_PROD`
>
> If names don't match (e.g., branch `stage` but environment name `staging`), deployments will fail because the secrets won't be found.

**Result:** Zero-config deployments! Push to any branch to deploy:
```bash
git push origin {your-branch}  # Auto-deploys to corresponding environment

# Examples:
git push origin dev          # Deploy to dev environment
git push origin staging      # Deploy to staging environment
git push origin production   # Deploy to production environment
git push origin preview      # Deploy to preview environment
git push origin prod-east    # Deploy to prod-east environment
```

#### How Workflows Adapt

The template includes four GitHub Actions workflows that automatically adapt to your environment naming:

1. **`deploy-api.yml`** - Deploys MJAPI to Azure App Service
   - Detects current branch and transforms to secret suffix
   - Builds and packages the API
   - Deploys using service principal authentication

2. **`deploy-explorer.yml`** - Deploys MJExplorer to Azure Static Web Apps
   - Detects current branch and environment
   - Builds Angular app with appropriate configuration
   - Fetches deployment token dynamically from Azure
   - Deploys to Static Web App

3. **`schema-migration.yml`** - Runs Flyway migrations for custom schema
   - Triggers on changes to `SQL Scripts/migrations/**`
   - Runs Flyway migrations (your custom schema)
   - Regenerates entities and commits to repository
   - Triggers redeployment of API and Explorer

4. **`mj-setup.yml`** - Initial DB setup and MJ version updates (manual trigger only)
   - Use for initial database setup (new provisioned empty DB)
   - Use after upgrading `@memberjunction/cli` version in package.json
   - Runs MJ core migrations (`__mj` schema)
   - Regenerates entities and optionally triggers deployment

**How Branch Names Map to Secrets:**

The workflows transform your branch name to match MJ Central's secret naming convention:

```
Branch "dev"       → Suffix "DEV"       → Secret AZURE_CREDENTIALS_DEV
Branch "staging"   → Suffix "STAGING"   → Secret AZURE_CREDENTIALS_STAGING
Branch "prod-east" → Suffix "PROD_EAST" → Secret AZURE_CREDENTIALS_PROD_EAST
```

This means the workflows automatically work with **any environment names** you configure in MJ Central.

**Customizing Workflow Triggers (Recommended):**

By default, workflows trigger on all branches (`branches: ["**"]`). After MJ Central provisions your environments, you should restrict triggers to only your environment branches:

1. Edit each workflow file (`.github/workflows/*.yml`)
2. Find line 16: `branches: ["**"]`
3. Replace with your branches: `branches: ["dev", "staging", "production"]`

This prevents accidental deployments from feature branches and saves CI/CD minutes.

See [`.github/workflows/README.md`](.github/workflows/README.md) for complete details on how the workflows integrate with MJ Central provisioning.

#### Connecting to Your Database Manually

After MJ Central provisions an environment, you may want to connect to the database directly (using SSMS, Azure Data Studio, etc.) for debugging or running queries.

**To find your database credentials:**
1. Go to **Azure Portal** → **App Services** → Select your MJAPI app service
2. Navigate to **Configuration** → **Application Settings**
3. Find these values:
   - `DB_HOST` - SQL Server hostname
   - `DB_DATABASE` - Database name
   - `DB_USERNAME` - Database username
   - `DB_PASSWORD` - Database password (click to reveal)

### Manual Deployment

If not using GitHub Actions, you can deploy manually:

#### Build for Production
```bash
# Build all packages
npm run build

# MJAPI is ready - deploy apps/MJAPI/dist/
# MJExplorer needs Angular production build:
cd apps/MJExplorer
npm run build  # or npm run build:stage for staging
```

#### Deployment Options
- **Azure App Service** - Recommended for MJAPI
- **Azure Static Web Apps** - Recommended for MJExplorer
- **Docker** - Container-based deployment
- **PM2** - Process manager for Node.js applications

#### Database Migrations
Always run migrations before deploying new code:
```bash
npm run migrate
npm run codegen  # If schema changed
```

## Resources

- [MemberJunction Documentation](https://docs.memberjunction.org/)
- [MemberJunction GitHub](https://github.com/MemberJunction/MJ)
- [Community Forum](https://community.memberjunction.org/)

## License

[Specify your license here]

## Support

For issues specific to this template, please open an issue in the repository.

For MemberJunction-related questions, visit the [MemberJunction community](https://community.memberjunction.org/).
