# Lexiphanic Security

> Responsible vulnerability disclosure, security advisories, and research from the Lexiphanic team.

## Overview

This website is the public home for [Lexiphanic Security](https://lexiphanic.github.io/security/) disclosures and advisories. It is built with [11ty (Eleventy)](https://www.11ty.dev/) using the [LibDoc theme](https://eleventy-libdoc.netlify.app/).

## Architecture

Disclosure data is intentionally stored in a **separate private repository** and consumed at build time. This allows:

- This repository to remain **fully public** and open for community contributions
- Sensitive vulnerability details to stay **hidden until responsible disclosure timelines are met**
- A clean separation between **site infrastructure** and **advisory content**
  @lexiphanic/security-website (this repo) <-- public
  └── @lexiphanic/disclosures <-- private package (disclosure data)


## Getting Started

### Prerequisites

- [Bun](https://bun.com/) v1.3+ (other Javascript runtimes properly work too)
- Either;
  - Access to the private `@lexiphanic/disclosures` package (internal team only)
  - Use dummy data, just populate the `disclosures` directory.

### Installation

```bash
git clone https://github.com/Lexiphanic/security-blog.git
cd security-blog
bun install
```

### Development Server
```bash
bun run dev
```

### Build
```bash
bun run build
```

## Disclosure Policy
We follow a responsible disclosure process. Vulnerabilities are kept private until:
1) The vendor has been notified
2) A fix has been released or the disclosure window has elapsed
3) The advisory is published publicly on this site

If you have a vulnerability to report, please contact us.

## Contributing
Contributions to the site structure, theme, and tooling are welcome. Please open an issue or pull request. Note that advisory content is managed separately and not accepted via this repository.