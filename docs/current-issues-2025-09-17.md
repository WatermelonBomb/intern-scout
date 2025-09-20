# InternScout Current Issues Report (2025-09-17)

## 1. Investigation Summary
- Ran `npm run lint` / `npm run build` inside `frontend/` to validate the Next.js application.
- Attempted `bundle exec rails test` inside `backend/` to confirm the Rails API health.
- Collected configuration and environment details (`ruby -v`, `.ruby-version`, `Gemfile.lock`).

## 2. Frontend Findings

### 2.1 Next.js build is blocked by ESLint errors
- **Impact**: `npm run build` fails, so no production build can be generated.
- **Evidence**: Both `npm run lint` and `npm run build` exit with `@typescript-eslint/no-explicit-any` errors, e.g.:
  ```
  ./src/app/applications/page.tsx
  70:34  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
  75:21  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
  ```
  Similar errors exist in many screens (`frontend/src/app/jobs/page.tsx#L137`, `frontend/src/app/messages/page.tsx#L24`, `frontend/src/app/profile/page.tsx#L72`, `frontend/src/lib/api.ts#L162`, etc.).
- **Suggested actions**:
  1. Replace `any` with explicit interfaces or tighten generics for API shapes.
  2. If short-term unblock is required, adjust ESLint config to allow controlled `any` usage, but document the debt.

### 2.2 Invalid key in Next.js configuration
- **Impact**: `next build` reports `Invalid next.config.ts options detected: Unrecognized key(s) in object: 'turbo'`, so the config is not fully applied and future upgrades may break.
- **Location**: `frontend/next.config.ts:28` defines a `turbo` block that is no longer supported in Next.js 15.
- **Suggested fix**: Remove or migrate this block to the official Turbopack configuration format (`next.config.ts` >= 15 uses `experimental.turbo` flags instead).

### 2.3 Auth state is not restored after refresh
- **Impact**: Users are forced to re-login after a hard refresh because the client never rehydrates from the backend despite cookies being set.
- **Evidence**: `frontend/src/contexts/AuthContext.tsx:32` disables `checkAuthStatus()` in the initial `useEffect`, leaving `user` as `null` on reload.
- **Suggested fix**: Re-enable `checkAuthStatus()` and resolve the original redirect loop, or provide another persistence mechanism (e.g., SWR-based session fetcher).

### 2.4 Additional lint warnings worth addressing
- Missing hook dependencies (`frontend/src/app/bulk-scout/page.tsx:83`, `frontend/src/app/invitations/page.tsx:31`, etc.) could lead to stale UI state.
- CommonJS `require` usage in `frontend/tailwind.config.ts:163` trips `@typescript-eslint/no-require-imports`, preventing builds when linting is enforced.
- Cleaning these up alongside the `any` removals will produce clean CI builds and reduce runtime surprises.

## 3. Backend Findings

### 3.1 Ruby toolchain mismatch blocks server & tests
- **Expected**: `.ruby-version` specifies Ruby `3.2.2` and `Gemfile.lock` requires Bundler `2.6.8`.
- **Actual**: Shell reports `ruby 2.6.10p210` and Bundler `2.6.8` is missing:
  ```
  $ bundle exec rails test
  Could not find 'bundler' (2.6.8) required by .../Gemfile.lock.
  ```
- **Impact**: Rails commands (`bundle install`, `rails server`, tests) cannot run on this machine until the correct Ruby and Bundler versions are installed or the project is containerised (Docker).
- **Suggested fix**: Install Ruby 3.2.2 via `rbenv`/`asdf` (or use the provided Docker workflow), then install Bundler 2.6.8 (`gem install bundler:2.6.8`) before running `bundle install`.

### 3.2 Consequence: backend health is unverified
- Because of the toolchain issue, automated tests and the Rails server could not be exercised locally. Once the environment is aligned, re-run the API smoke tests to confirm endpoints still satisfy the updated frontend flows.

## 4. Environment Observations
- Every shell command emits `Error while loading conda entry point: anaconda-cloud-auth ...`. It does not break execution, but indicates a broken global Python/conda shim. Cleaning the conda installation (or bypassing it) will reduce noise.

## 5. Recommended Next Steps
1. **Frontend**: Decide whether to relax lint rules temporarily or fix the type gaps; then resolve the invalid `turbo` config and re-enable session hydration.
2. **Backend**: Align the Ruby toolchain (install Ruby 3.2.2 + Bundler 2.6.8 or use Docker) and re-run the API test suite.
3. **Dev Environment**: Address the conda shim warning to avoid masking future command failures.
4. After the above, rerun `npm run build` and backend smoke tests to confirm the platform is deployable end-to-end.

## 6. Remediation Summary (2025-09-17)
- Replaced all `any` usages with typed payloads and helper guards across the Next.js app, then introduced `src/lib/errors.ts` to centralize Axios error handling. `npm run lint` now completes without errors or warnings.
- Cleaned configuration issues by removing the deprecated `turbo` block from `next.config.ts`, dropping network-dependent Google font loading, and converting the Tailwind config to ESM imports. `npm run build` now succeeds locally.
- Restored auth rehydration by re-enabling the cookie-backed session check in `AuthContext` with unmount safety, and ensured client pages depending on query parameters (`/signup`) avoid the `useSearchParams` build-time restriction.
- Solidified Rails tooling by running Bundler through the rbenv shims (`~/.rbenv/shims/bundle`) so `bundle install` succeeds under Ruby 3.2.2. Test execution still requires a running PostgreSQL instance (connection to `/tmp/.s.PGSQL.5432` currently denied).
- Captured the persistent environment warning (`anaconda-cloud-auth` shim) for follow-up to prevent command noise, as it appears during every shell invocation.
