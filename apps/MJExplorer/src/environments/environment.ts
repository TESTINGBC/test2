// MJExplorer Environment Configuration - LOCAL DEVELOPMENT ONLY
// ==============================================================
// This file is ONLY used for local development (npm run start:explorer).
// CI/CD deployments auto-generate this file using GitHub variables provisioned by MJ Central.
//
// For local development, configure the authentication settings below:
//
// Azure AD (MSAL):
//   - CLIENT_ID: Your Azure AD app registration client ID
//   - TENANT_ID: Your Azure AD tenant ID
//   - CLIENT_AUTHORITY: https://login.microsoftonline.com/{TENANT_ID}
//
// Auth0 (alternative):
//   - AUTH_TYPE: "auth0"
//   - AUTH0_DOMAIN: Your Auth0 domain (e.g., "your-tenant.auth0.com")
//   - AUTH0_CLIENTID: Your Auth0 application client ID

export const environment = {
  // Local Development API URLs
  GRAPHQL_URI: "http://localhost:4000/",
  GRAPHQL_WS_URI: "ws://localhost:4000/",
  REDIRECT_URI: "http://localhost:4200/",

  // Authentication - Configure for local development
  AUTH_TYPE: "MSAL",
  CLIENT_ID: "",
  TENANT_ID: "",
  CLIENT_AUTHORITY: "",

  // Auth0 (if using instead of Azure AD)
  AUTH0_DOMAIN: "",
  AUTH0_CLIENTID: "",

  // MemberJunction Configuration
  MJ_CORE_SCHEMA_NAME: "__mj",
  APPLICATION_NAME: "MemberJunction",
  APPLICATION_INSTANCE: "LOCAL",

  // Runtime Configuration
  NODE_ENV: "development",
  production: false,

  // UI Configuration
  AUTOSAVE_DEBOUNCE_MS: 1200,
  SEARCH_DEBOUNCE_MS: 800,
  MIN_SEARCH_LENGTH: 3
};
