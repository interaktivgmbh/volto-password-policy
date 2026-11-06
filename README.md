# volto-password-policy

Volto support for the password change at login of [interaktiv.passwordpolicy](https://github.com/interaktivgmbh/interaktiv.passwordpolicy).

[![npm](https://img.shields.io/npm/v/@interaktivgmbh/volto-password-policy)](https://www.npmjs.com/package/@interaktivgmbh/volto-password-policy)
[![CI](https://github.com/interaktivgmbh/volto-password-policy/actions/workflows/main.yml/badge.svg)](https://github.com/interaktivgmbh/volto-password-policy/actions/workflows/main.yml)

## Features

When a user logs in with a correct password that does not meet the password policy anymore, the backend refuses the login.
This add-on tells the user why, instead of Volto's generic "Login failed" message.

- Users with an email address receive a password reset email, and a warning toast tells them so.
- Users who cannot receive the email are sent to Volto's password reset form directly.
- The new password must meet the policy.
- Wrong passwords show the usual "Login failed" message.
- No Volto component is overridden.

## Requirements

- Volto 18 or later.
- [interaktiv.passwordpolicy](https://github.com/interaktivgmbh/interaktiv.passwordpolicy) installed in the Plone site.
- **Require a password change at login** turned on in the password policy control panel.

## Installation

Add `@interaktivgmbh/volto-password-policy` to the dependencies and add-ons of your project, for example in the `package.json` of your project's policy add-on:

```json
"addons": [
    "@interaktivgmbh/volto-password-policy"
],
"dependencies": {
    "@interaktivgmbh/volto-password-policy": "*"
}
```

Alternatively, add it to `volto.config.js`:

```javascript
const addons = ['@interaktivgmbh/volto-password-policy'];
```

### From npm

Your package manager installs the add-on from [npm](https://www.npmjs.com/package/@interaktivgmbh/volto-password-policy), no further configuration is needed.

### From GitHub with mrs-developer

If your project uses [mrs-developer](https://www.npmjs.com/package/mrs-developer), add the repository to your `mrs.developer.json`:

```json
"volto-password-policy": {
    "output": "./packages/",
    "url": "git@github.com:interaktivgmbh/volto-password-policy.git",
    "package": "@interaktivgmbh/volto-password-policy",
    "branch": "main"
}
```

The package lives in `packages/volto-password-policy` of the repository, so your `pnpm-workspace.yaml` must include `packages/**/packages/*`, as projects created with Cookieplone do.
Use `"@interaktivgmbh/volto-password-policy": "workspace:*"` as the dependency version in this case.

## How it works

The add-on adds two Redux middlewares through `config.settings.storeExtenders`.

- Before Volto's API middleware, it adds the header `X-Password-Change: reset-token` to the `@login` request.
  The header tells the backend that the client offers the password reset form itself, for users who cannot receive the reset email.
- After Volto's API middleware, it catches a failed login with the error type `Password change required`.
  It resets the login state, so the login form shows no "Login failed" message, and shows the message of the backend in a toast.
  If the response contains a `reset_token`, it navigates to `/passwordreset/<reset_token>`.

Without this add-on, Volto shows "Login failed", users with an email address still receive the reset email, and the backend allows the login of users without email.

## CORS

The `X-Password-Change` header is a custom header.
If the browser calls the Plone REST API on another origin than Volto, for example `https://api.example.com` from `https://www.example.com`, the browser sends a CORS preflight request first.
The backend must allow the header in its CORS policy, otherwise the browser blocks the login request.

Allow the header in the `plone.rest` CORS policy of your backend, next to the headers Volto needs anyway:

```xml
<plone:CORSPolicy
    allow_origin="https://www.example.com"
    allow_methods="DELETE,GET,OPTIONS,PATCH,POST,PUT"
    allow_credentials="true"
    allow_headers="Accept,Authorization,Content-Type,X-Password-Change"
    />
```

No CORS configuration is needed if Volto and the REST API share the same origin.
This is the case with Volto's development proxy and with the seamless mode, where a reverse proxy serves Volto and the REST API on the same domain.

## Development

The add-on is developed in isolation, with pnpm workspaces and [mrs-developer](https://www.npmjs.com/package/mrs-developer), which checks out Volto into `core/`.

### Prerequisites

-   [Node.js and pnpm](https://6.docs.plone.org/install/create-project.html#node-js) 22
-   [Make](https://6.docs.plone.org/install/create-project-cookieplone.html#make)
-   [Git](https://6.docs.plone.org/install/create-project-cookieplone.html#git)
-   A Plone backend with [interaktiv.passwordpolicy](https://github.com/interaktivgmbh/interaktiv.passwordpolicy) on port 8080

### Set up

```shell
git clone git@github.com:interaktivgmbh/volto-password-policy.git
cd volto-password-policy
make install
```

### Start

Start the backend with interaktiv.passwordpolicy on port 8080.
`make backend-docker-start` starts a plain Plone backend without interaktiv.passwordpolicy, which is not enough to try the password change at login.

Then start Volto with the add-on:

```shell
make start
```

### Commands

| Command | Description |
|---|---|
| `make install` | Install the add-on in a development environment |
| `make start` | Start Volto with the add-on, reloading on changes |
| `make build` | Build a production bundle |
| `make lint` | Lint the code |
| `make format` | Format the code |
| `make i18n` | Sync the translations |
| `make test` | Run the unit tests |
| `make release` | Release the add-on on npm |

Run `make help` for all commands.

## License

The project is licensed under the MIT license.
