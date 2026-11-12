# Security review

Reviewed 12 November 2026. Scope: the static application, its repository files and live HTTP responses. This is a targeted source review and verification, not a guarantee or independent penetration test.

## Controls

- No third-party dependencies, remote assets, backend, login, analytics or application network requests.
- User-controlled values are inserted with textContent, not parsed as HTML.
- CSP denies resources by default. Only the hash-approved app script, same-origin stylesheet, icons and manifest are permitted. Inline code, eval, network connections, form submissions, embedded frames, workers, objects and base URL changes are blocked.
- JavaScript and CSS carry SHA-256 Subresource Integrity values. Keep the script CSP hash and both integrity values in index.html in sync when editing these files. Run `node tests/security.mjs` before publishing.
- Referrer metadata prevents sending this page's URL as a referrer.
- Saved JSON is size-limited before parsing and must contain exactly a bounded integer mileage and a real ISO date within the permitted recording period. Only those validated fields are copied. CSV export uses these validated fields.
- Live hosting was verified to redirect HTTP to HTTPS and send HSTS.

## Limits

The public repository and site expose the agreement dates and starting mileage by design. The app's readings remain in browser localStorage and are not encrypted. Any script running on the same origin, including another project under zqnhighe.github.io, can access that storage. Browser extensions and someone with access to the device may also read it. Do not use it for sensitive personal or financial records.

The GitHub Pages response does not currently send frame-ancestors, X-Frame-Options, X-Content-Type-Options or Permissions-Policy headers. A meta CSP cannot enforce frame-ancestors; it is deliberately not presented as clickjacking protection. Full control over those response headers requires a hosting layer that supports custom headers. See https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Content-Security-Policy/frame-ancestors .

Integrity hashes and CSP do not protect against someone who can modify the HTML and hashes together. GitHub account access remains the deployment trust boundary. This review did not inspect account MFA, recovery methods, collaborators or branch rules, or change account permissions.
