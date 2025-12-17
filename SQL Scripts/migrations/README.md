# Database Migrations

## Overview

This directory contains **Flyway migrations** for your **custom application schema**. This is separate from MemberJunction's core schema updates.

## Two Migration Systems

Your MemberJunction application uses **two different migration systems** for different purposes:

### 1. Flyway Migrations (This Directory) 📁

**Purpose:** Custom application schema - YOUR tables, views, and stored procedures

**Command:** `npm run db`

**Location:** `SQL Scripts/migrations/`

**Examples:**
- Custom business tables (myapp.Customer, myapp.Order, etc.)
- Application-specific views
- Custom stored procedures
- Seed data for your entities

**When to use:** When you need to add or modify YOUR application's database schema

### 2. MJ Core Migrations ⚙️

**Purpose:** MemberJunction core schema - `__mj` tables and system infrastructure

**Command:** `npm run migrate`

**Managed by:** `@memberjunction/cli` package

**Examples:**
- `__mj.Entity`, `__mj.User`, `__mj.Role`
- MJ system tables and views
- Core MJ functionality

**When to use:** When upgrading MemberJunction to a new version

## Migration File Naming Conventions

Flyway uses a specific naming pattern for migration files:

### Versioned Migrations (Run Once)
**Pattern:** `V<VERSION>__<DESCRIPTION>.sql`

**Examples:**
- `V001__create_customer_table.sql`
- `V002__add_order_status_column.sql`
- `V003.5__add_shipping_address.sql` (sub-version)

**Behavior:** Runs exactly once, tracked in `flyway_schema_history` table

### Repeatable Migrations (Re-run When Changed)
**Pattern:** `R<NUMBER>__<DESCRIPTION>.sql`

**Examples:**
- `R001__seed_customer_data.sql`
- `R002__update_reference_data.sql`

**Behavior:** Runs whenever the file's checksum changes (useful for seed data)

### Baseline Migrations (Initial State)
**Pattern:** `B<VERSION>__<DESCRIPTION>.sql`

**Examples:**
- `B001__initial_schema.sql`

**Behavior:** Represents the baseline state of the database

## Environment Setup

Before running migrations, ensure your `.env` file is configured:

```bash
# Copy the example file
cp .env.example .env

# Edit .env with your database credentials
# DB_HOST=your-sql-server.database.windows.net
# DB_DATABASE=your-database-name
# CODEGEN_DB_USERNAME=MJ_CodeGen
# CODEGEN_DB_PASSWORD=your-password
```

**How it works:**
- `npm run db` uses **dotenvx** to load your `.env` file
- A wrapper script (`tools/flyway/db-migrate.js`) constructs the JDBC URL
- Database port is hardcoded to **1433** (Azure SQL default)
- Flyway CLI receives all necessary environment variables

## Workflow

### Adding a New Custom Table

1. **Create migration file** in this directory:
   ```bash
   # Create V002__add_my_table.sql
   ```

2. **Write your SQL**:
   ```sql
   CREATE TABLE myapp.MyTable (
       ID UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWSEQUENTIALID(),
       Name NVARCHAR(255) NOT NULL,
       __mj_CreatedAt DATETIMEOFFSET NOT NULL DEFAULT(GETUTCDATE()),
       __mj_UpdatedAt DATETIMEOFFSET NOT NULL DEFAULT(GETUTCDATE())
   );

   EXEC sp_addextendedproperty
       @name = N'MS_Description',
       @value = N'My custom table description',
       @level0type = N'SCHEMA', @level0name = N'myapp',
       @level1type = N'TABLE', @level1name = N'MyTable';
   ```

3. **Run Flyway migration**:
   ```bash
   npm run db
   ```

4. **Register in MemberJunction**:
   ```bash
   npm run codegen
   ```
   This scans the database and generates TypeScript entity classes

5. **Rebuild and restart**:
   ```bash
   npm run build
   npm run start:api
   ```

Your new table is now available in MemberJunction!

## Best Practices

### Always Include MJ Audit Fields

MemberJunction automatically manages these fields:

```sql
__mj_CreatedAt DATETIMEOFFSET NOT NULL DEFAULT(GETUTCDATE()),
__mj_UpdatedAt DATETIMEOFFSET NOT NULL DEFAULT(GETUTCDATE())
```

**DO NOT** manually set these fields - MJ handles them automatically.

### Add Extended Properties

Help MemberJunction understand your schema:

```sql
-- Table description
EXEC sp_addextendedproperty
    @name = N'MS_Description',
    @value = N'Customer information',
    @level0type = N'SCHEMA', @level0name = N'myapp',
    @level1type = N'TABLE', @level1name = N'Customer';

-- Column description
EXEC sp_addextendedproperty
    @name = N'MS_Description',
    @value = N'Customer email address',
    @level0type = N'SCHEMA', @level0name = N'myapp',
    @level1type = N'TABLE', @level1name = N'Customer',
    @level2type = N'COLUMN', @level2name = N'Email';
```

### Use UUIDs for Primary Keys

```sql
ID UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWSEQUENTIALID()
```

MemberJunction works best with GUID primary keys.

### Test Migrations Locally First

```bash
# Check migration status
flyway info

# Run migrations
npm run db

# Verify
flyway info
```

## Common Commands

```bash
# Run Flyway migrations
npm run db

# Run MJ core migrations
npm run migrate

# Run CodeGen to register entities
npm run codegen

# Check migration status (requires Flyway CLI)
flyway info

# Validate migrations (requires Flyway CLI)
flyway validate
```

## Example Migrations

Example migration files are located in the `examples/` subdirectory:

- `examples/V001__create_custom_table.sql.example` - Complete example with best practices

**To use an example:**
1. Copy the file to the migrations directory
2. Remove the `.example` extension
3. Modify for your needs
4. Run `npm run db`

```bash
# Example: Using the custom table example
cp "examples/V001__create_custom_table.sql.example" "V001__my_first_migration.sql"
# Edit V001__my_first_migration.sql
npm run db
```

The `examples/` folder is ignored by Flyway - only files directly in `migrations/` are executed.

## Troubleshooting

### Migration fails with "checksum mismatch"

**Cause:** You modified a migration file after it was applied

**Solution:**
- Don't modify applied migrations
- Create a new migration with fixes instead
- Or use `flyway repair` to recalculate checksums (use carefully!)

### CodeGen doesn't see my new table

**Cause:** Migration applied but CodeGen not run

**Solution:**
```bash
npm run codegen
npm run build
```

### "flyway_schema_history" table doesn't exist

**Cause:** First time running Flyway

**Solution:** This is normal - Flyway creates it automatically on first run

## Environment-Specific Migrations

The template supports multiple environments. Configure in GitHub:

```bash
# Development
npm run db

# With environment variables
DB_HOST=myserver.database.windows.net npm run db
```

## More Information

- [Flyway Documentation](https://flywaydb.org/documentation/)
- [MemberJunction Documentation](https://docs.memberjunction.org/)
- [Main README](../../README.md)
- [Workflow Documentation](../../.github/workflows/README.md)
