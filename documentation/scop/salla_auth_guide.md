# Salla OAuth 2.0 Authentication and App Registration

To use Salla’s APIs on behalf of merchants, developers must first register an application on the **Salla Partners Portal**.

1. Create a verified Salla Partners account.
2. Log in at the portal and go to:
   **My Apps → Create App** ([docs.salla.dev](https://docs.salla.dev/421410m0))

On the **Create App** page you choose an **App type** (Public or Private), then enter details like:

* App name
* Icon
* Category
* Support URL or email

Once created, the portal shows your **App Keys**:

* `Client ID`
* `Client Secret` (can be regenerated)
* OAuth mode (Easy or Custom)

You also configure the **App Scope** on this portal page to restrict which API resources your app can request.

---

## Example

After creating the app, the `Client ID` and `Client Secret` appear in your app’s details (**App Keys** section), along with a **Callback/Redirect URI** field and the choice of Easy or Custom OAuth mode.

Developers can also use the **Salla CLI** tool:

```bash
salla app create
```

to register a new app via the terminal. But ultimately the app must be registered on the Partners portal to obtain the credentials and set scopes.

---

# OAuth 2.0 Authorization Flow

Salla follows standard **OAuth 2.0**. The merchant installs or authorizes your app via Salla’s authorization server.

### Key Endpoints

* **Authorization URL**:
  `https://accounts.salla.sa/oauth2/auth`
* **Token URL**:
  `https://accounts.salla.sa/oauth2/token`
* **Redirect URI**: Your app’s callback URL (must match the one in the Partners portal)
* **Refresh Token**: Also obtained from the token endpoint (if requested)
* **User Info**:
  `https://accounts.salla.sa/oauth2/user/info`

---

### Example Authorization Request

```text
https://accounts.salla.sa/oauth2/auth?client_id=YOUR_CLIENT_ID
  &response_type=code
  &redirect_uri=https://your-app.com/callback
  &scope=read write offline_access
  &state=RANDOM_STATE
```

* `offline_access` → tells Salla to issue a refresh token.
* `state` → random string to prevent CSRF attacks (returned unchanged).

If approved, Salla redirects to your callback URI:

```text
https://your-app.com/callback?code=AUTH_CODE&state=RANDOM_STATE
```

---

### Exchange Authorization Code for Tokens

```bash
curl -X POST https://accounts.salla.sa/oauth2/token \
  -d client_id=YOUR_CLIENT_ID \
  -d client_secret=YOUR_CLIENT_SECRET \
  -d grant_type=authorization_code \
  -d code=AUTH_CODE \
  -d redirect_uri=https://your-app.com/callback
```

**Response Example:**

```json
{
  "status":200,
  "success":true,
  "data":{
    "access_token":"abc123def456...",
    "refresh_token":"xyz789...",
    "token_type":"Bearer",
    "expires":1209600
  }
}
```

---

# Using the Access Token

Once you have the `access_token`, you can call Salla’s APIs:

```bash
curl --request GET \
  --url 'https://api.salla.dev/admin/v2/orders' \
  --header 'Accept: application/json' \
  --header 'Authorization: Bearer <ACCESS_TOKEN>'
```

---

# Access and Refresh Tokens

* **Access Tokens**: valid for **14 days**.
* **Refresh Tokens**: valid for **1 month**, but **single-use**.

Refreshing requires:

```bash
curl -X POST https://accounts.salla.sa/oauth2/token \
  -d client_id=YOUR_CLIENT_ID \
  -d client_secret=YOUR_CLIENT_SECRET \
  -d grant_type=refresh_token \
  -d refresh_token=OLD_REFRESH_TOKEN
```

Always replace old tokens with the new ones.

---

# Required API Request Headers

* `Authorization: Bearer <ACCESS_TOKEN>`
* `Accept: application/json`
* `Content-Type: application/json` (for JSON body requests)

Example:

```bash
curl --request GET \
  --url 'https://api.salla.dev/admin/v2/merchants/me' \
  --header 'Accept: application/json' \
  --header 'Authorization: Bearer <ACCESS_TOKEN>'
```

---

# SDKs and Tools

Salla provides open-source libraries:

* **JavaScript Client** (Passport Strategy)


Also available:

* **Salla CLI** (`salla app create`)
* **Postman collections**
* **Developer Blog**

---

# Security Considerations

* **HTTPS Only**: All OAuth endpoints use HTTPS.
* **Token Expiry**: Access tokens expire in 14 days, refresh tokens in 1 month (single-use).
* **Scopes and Least Privilege**: Only request necessary scopes.
* **State Parameter**: Protects against CSRF.
* **Revocation**: Merchants can revoke at any time.
* **IP Whitelisting**: Restrict allowed IP addresses in Partners portal.

---

# Sources

* [Create Your First App – Salla Docs](https://docs.salla.dev/421410m0)
* [Authorization – Salla Docs](https://docs.salla.dev/doc-421118)
* [User Information – Salla Merchants APIs](https://docs.salla.dev/9466620e0)
* [Create App – Salla Docs](https://docs.salla.dev/422768m0)

---
