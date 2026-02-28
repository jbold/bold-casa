# Security Policy

## Supported Branches
- `main` receives active security updates.

## Reporting a Vulnerability
- Please do not open public issues for undisclosed vulnerabilities.
- Email the maintainer directly with:
  - Impact summary
  - Reproduction steps
  - Affected files/paths
  - Suggested remediation (if available)

## Security Baseline
- GitHub Actions security workflow runs:
  - `gitleaks` secret scanning with SARIF upload
  - CodeQL analysis for JavaScript and Rust
  - Dependency review on pull requests
  - Scheduled `cargo-audit` for Rust dependencies (when Rust module is present)
- Dependabot is enabled for GitHub Actions, npm, and Cargo ecosystems.
- Operations alert workflows open GitHub issues when CI/security/deploy automation fails.
- Native Cloudflare Pages deploy failures are monitored via GitHub check-run alerts.

## Operational Hardening Notes
- Keep least-privilege tokens for Cloudflare (`Pages:Edit` for deploy automation only).
- Rotate API tokens periodically and after maintainer device compromise.
- Prefer GitHub repository secrets/variables over committing env files.
