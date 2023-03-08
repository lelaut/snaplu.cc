# SnapLu.cc

Gamble money for private content.

## Development

To run this project in developer mode you'll need to follow the steps bellow.

### Install

1. Follow the instructions defined at `src/server/services/embedding/README.md`

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

3. Create the s3 bucket inside the localstack container

```console
docker exec -it localstack_main \
  /bin/bash -c \
  'awslocal s3api create-bucket --bucket ${AWS_S3_BUCKET} --region ${AWS_DEFAULT_REGION}'
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
