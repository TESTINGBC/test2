// tools/flyway/db-migrate.js
import { spawnSync } from "child_process";
import { platform } from "os";

const {
  DB_HOST,
  DB_PORT = '1433',  // Default to 1433 if not provided
  DB_DATABASE,
  CODEGEN_DB_USERNAME,
  CODEGEN_DB_PASSWORD
} = process.env;

if (!DB_HOST || !DB_DATABASE || !CODEGEN_DB_USERNAME || !CODEGEN_DB_PASSWORD) {
  console.error("❌ Missing one or more required environment variables:");
  console.error(`   DB_HOST: ${DB_HOST ? '✓' : '✗'}`);
  console.error(`   DB_PORT: ${DB_PORT ? `✓ (using ${DB_PORT})` : '✗'}`);
  console.error(`   DB_DATABASE: ${DB_DATABASE ? '✓' : '✗'}`);
  console.error(`   CODEGEN_DB_USERNAME: ${CODEGEN_DB_USERNAME ? '✓' : '✗'}`);
  console.error(`   CODEGEN_DB_PASSWORD: ${CODEGEN_DB_PASSWORD ? '✓' : '✗'}`);
  process.exit(1);
}

// Build Flyway-specific environment variables dynamically
const FLYWAY_ENV = {
  ...process.env,
  FLYWAY_URL: `jdbc:sqlserver://${DB_HOST}:${DB_PORT};databaseName=${DB_DATABASE};trustServerCertificate=true`,
  FLYWAY_USER: CODEGEN_DB_USERNAME,
  FLYWAY_PASSWORD: CODEGEN_DB_PASSWORD
};

console.log(`➡️ Running Flyway migrate for ${DB_DATABASE} with constructed environment vars`);

const flywayCmd = platform() === "win32" ? "flyway.cmd" : "flyway";

const FLYWAY_URL = `jdbc:sqlserver://${DB_HOST}:${DB_PORT};databaseName=${DB_DATABASE};trustServerCertificate=true`;

// Pass all config via command-line to avoid flyway.toml placeholder issues
const result = spawnSync(flywayCmd, [
  "migrate",
  `-url=${FLYWAY_URL}`,
  `-user=${CODEGEN_DB_USERNAME}`,
  `-password=${CODEGEN_DB_PASSWORD}`,
  "-locations=filesystem:./SQL Scripts/migrations",
  "-baselineOnMigrate=true",
  "-baselineVersion=0",
  "-configFiles="  // Ignore any config files
], {
  stdio: "inherit",
  env: FLYWAY_ENV,
  shell: platform() === "win32"
});

process.exit(result.status);
