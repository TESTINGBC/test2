-- Create database users for MemberJunction
-- Run via sqlcmd against target database: sqlcmd -d <dbname> -i create_db_users.sql
--
-- Creates:
--   mjapp: Runtime user for MJAPI (mapped to login, db_owner role)
--   MJ_CodeGen, MJ_CodeGen_Dev, MJ_Connect, MJ_Connect_Dev: Users for MJ migration compatibility

-- mjapp: Runtime user for MJAPI (mapped to server login)
IF NOT EXISTS (SELECT 1 FROM sys.database_principals WHERE name = 'mjapp')
BEGIN
    PRINT 'Creating mjapp user for login...'
    CREATE USER [mjapp] FOR LOGIN [mjapp]
    ALTER ROLE db_owner ADD MEMBER [mjapp]
    PRINT 'mjapp user created with db_owner role'
END
ELSE
    PRINT 'mjapp user already exists'
GO

-- MJ_CodeGen: Required by MJ migration for role membership
IF NOT EXISTS (SELECT 1 FROM sys.database_principals WHERE name = 'MJ_CodeGen')
BEGIN
    PRINT 'Creating MJ_CodeGen user without login...'
    CREATE USER [MJ_CodeGen] WITHOUT LOGIN
END
GO

-- MJ_CodeGen_Dev
IF NOT EXISTS (SELECT 1 FROM sys.database_principals WHERE name = 'MJ_CodeGen_Dev')
BEGIN
    PRINT 'Creating MJ_CodeGen_Dev user without login...'
    CREATE USER [MJ_CodeGen_Dev] WITHOUT LOGIN
END
GO

-- MJ_Connect
IF NOT EXISTS (SELECT 1 FROM sys.database_principals WHERE name = 'MJ_Connect')
BEGIN
    PRINT 'Creating MJ_Connect user without login...'
    CREATE USER [MJ_Connect] WITHOUT LOGIN
END
GO

-- MJ_Connect_Dev
IF NOT EXISTS (SELECT 1 FROM sys.database_principals WHERE name = 'MJ_Connect_Dev')
BEGIN
    PRINT 'Creating MJ_Connect_Dev user without login...'
    CREATE USER [MJ_Connect_Dev] WITHOUT LOGIN
END
GO

PRINT 'Database user creation complete'
GO
