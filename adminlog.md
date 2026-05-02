# Admin Auth and Security Prompt (1-2 Admin Users)

Use this prompt to implement a secure and simple admin authentication system for this project.

## Core Rule

If any task in this prompt is already implemented in the project, do not implement it again.

Before coding:
1. Audit current behavior.
2. Mark each item as Already Done or Needs Work.
3. Implement only missing items.

## Admin Account Setup

- Primary admin email: anwarmdnoor@gmail.com
- Starter strong password option 1: S9!vQ2#nL7@tR4$p
- Starter strong password option 2: K3^mZ8&xP1!dW6@q

Use one of the passwords only for initial bootstrap, then force a password change on first login.

## Main Objective

Keep admin auth low-complexity but production-safe for a tiny team.

## Required Features

### 1. Login and Session
- Keep email + password login for admin only.
- Block public admin signup.
- Use secure cookie-based auth for admin session if not already done.
- Access token should be short-lived.
- Add logout endpoint and clear session cookie on logout.

### 2. Change Password Flow
- Add a new admin panel page at /admin/user for account security settings.
- This page must include a Change Password using gmail form with:
	- Current password
	- New password
	- Confirm new password
- Validate password strength server-side and client-side.
- Prevent reuse of current password.
- Require exact current password before updating.
- Invalidate old sessions/tokens after successful password change.
- Show success and error feedback clearly.

### 3. Admin Navigation Update
- Add a User menu entry in admin navigation that points to /admin/user.
- Page should be protected by admin auth middleware/guard.

### 4. Backend API for Password Change
- Add a protected endpoint for password update (example: PATCH /admin/me/password).
- Request body:
	- currentPassword
	- newPassword
	- confirmPassword
- Enforce:
	- minimum length and complexity
	- confirmPassword match
	- current password verification
- Save with bcrypt/argon2 hash.
- Return generic security-safe errors.

## Security Requirements

### 1. Brute Force Protection
- Rate limit /admin/login.
- Add temporary lockout or exponential backoff after repeated failed attempts.
- Log failed login attempts with IP and timestamp.

### 2. Token and Cookie Security
- Cookie flags: HttpOnly, Secure, SameSite=Lax (or Strict if compatible).
- Enforce HTTPS in production.
- Keep JWT secret strong and rotate when necessary.

### 3. Input Validation and Error Safety
- Validate all auth payloads with schema validation.
- Do not leak whether email exists.
- Keep error messages generic for auth failures.

### 4. CSRF and XSS Controls
- If cookie auth is used, add CSRF protection for state-changing admin routes.
- Never store admin auth token in localStorage.
- Sanitize user-controlled data shown in admin UI.

### 5. Authorization
- Protect all /admin/* endpoints with auth middleware.
- Confirm admin role before granting access.

## Audit Logging Requirements

Log these events:
- login_success
- login_failed
- logout
- password_change_success
- password_change_failed

Each log should include:
- admin id/email
- event type
- timestamp
- IP address
- user-agent

Do not log passwords or tokens.

## Implementation Targets (Project Files)

- Frontend page: frontend/src/app/admin/user/page.tsx
- Admin layout/nav: frontend/src/app/admin/layout.tsx
- Backend controller logic: backend/src/controllers/adminController.ts
- Backend routes: backend/src/routes/adminRoutes.ts
- Auth middleware: backend/src/middleware/auth.ts

Only modify files that need work after audit.

## Suggested Environment Variables

- JWT_SECRET
- JWT_EXPIRES_IN
- ADMIN_ALLOWED_ORIGINS
- COOKIE_SECURE
- ADMIN_LOGIN_MAX_ATTEMPTS
- ADMIN_LOGIN_LOCK_MINUTES

## Acceptance Criteria

- Admin can log in with Anwarmdnoor@gmail.com and bootstrap password.
- Admin can open /admin/user and change password securely.
- Old password no longer works after change.
- Previous sessions are invalidated after password update.
- Login endpoint is rate-limited and logs security events.
- No duplicate implementation of already completed tasks.
