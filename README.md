# SnapLu.cc

Gamble money for private content.

## Development

To run this project in developer mode you'll need to follow the steps bellow.

### Install

1. Install [cog](https://github.com/replicate/cog) CLI.

### Deploy

1. Build cog image for the embedding service at `src/server/services/embedding`

```console
cd src/server/services/embedding`
cog build -t embedding
```

2. Run docker compose to get the development environment setup

```console
docker compose up -d
```

**🚀 After this you should be set to go 🚀**

## Roadmap

- [x] Backend tests
- [x] Generic interfaces for `payment` and `storage`
- [x] Move `ml` containers to root
- [x] Generic interface for `ml` features
- [ ] Integrate new backend into frontend
- [ ] Add missing features
  - Each card should have a rarity factor
- [ ] Use Terraform to automate infrastructure deployment(https://vercel.com/guides/integrating-terraform-with-vercel)
- [ ] Enhance frontend design, check your colors man
- [ ] Integrate Sentry

### Study

- [ ] PM2
- [ ] OpenTelemetry
  - https://vercel.com/docs/concepts/observability/otel-overview/quickstart
  - https://signoz.io/docs/instrumentation/javascript/#using-the-all-in-one-auto-instrumentation-library

```

```
