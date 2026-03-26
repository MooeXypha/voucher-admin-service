# `load-generator/`

Continuously sends requests imitating realistic user transaction flows to API
routes.

> 💡 Ideally this should be running on the **replica** of production server, or staging
> server with throttler disabled.

## Prerequisites

- [k6](https://k6.io) installled on your machine
- Generate API key from [scripts/generate-api-key.js](../scripts/generate-api-key.js)
- Throttler disabled in [app.module.ts](../src/app.module.ts#L47-L54)

> Consider ignoring specific user agents for load generator.
> Read [here](https://github.com/nestjs/throttler#ignoring-specific-user-agents)
> for more information.

## Generate load test

```sh
$ k6 run -e X_API_KEY=your-generated-api-key ./script.js
```
