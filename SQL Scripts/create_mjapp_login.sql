-- Create mjapp server login in master database
-- Run via sqlcmd against master: sqlcmd -d master -v RUNTIME_DB_PASSWORD="xxx" -i create_mjapp_login.sql

IF NOT EXISTS (SELECT 1 FROM sys.sql_logins WHERE name = 'mjapp')
BEGIN
    PRINT 'Creating mjapp login...'
    CREATE LOGIN [mjapp] WITH PASSWORD = '$(RUNTIME_DB_PASSWORD)'
    PRINT 'mjapp login created'
END
ELSE
    PRINT 'mjapp login already exists'
GO
