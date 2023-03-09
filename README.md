# SnapLu.cc

Gamble money for private content.

## Development

To run this project in developer mode you'll need to follow the steps below.

### Install

1. Follow the instructions defined at `src/server/services/embedding/README.md`

### Deploy

1. Build cog image for the embedding service at `src/server/services/embedding`

```console
cd src/server/services/embedding`
cog build -t embedding
```

2. If you want to populate images for development(check `src/utils/fake.ts/randomImage()`), please do:

```console
mkdir -p volumes/imgs
# Put whatever image you want inside there
```

3. Run docker compose to get the development environment setup

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
  - Following system
- [ ] Use Terraform to automate infrastructure deployment, still need to choose what provider I'll use
  - https://vercel.com/guides/integrating-terraform-with-vercel
- [ ] Enhance frontend design, check your colors man
- [ ] Integrate Sentry

### Study

- [ ] PM2
- [ ] OpenTelemetry
  - https://vercel.com/docs/concepts/observability/otel-overview/quickstart
  - https://signoz.io/docs/instrumentation/javascript/#using-the-all-in-one-auto-instrumentation-library

```

```
