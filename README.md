# Create T3 App

This is a [T3 Stack](https://create.t3.gg/) project bootstrapped with `create-t3-app`.

## What's next? How do I make an app with this?

We try to keep this project as simple as possible, so you can start with just the scaffolding we set up for you, and add additional things later when they become necessary.

If you are not familiar with the different technologies used in this project, please refer to the respective docs. If you still are in the wind, please join our [Discord](https://t3.gg/discord) and ask for help.

- [Next.js](https://nextjs.org)
- [NextAuth.js](https://next-auth.js.org)
- [Prisma](https://prisma.io)
- [Tailwind CSS](https://tailwindcss.com)
- [tRPC](https://trpc.io)

## Learn More

To learn more about the [T3 Stack](https://create.t3.gg/), take a look at the following resources:

- [Documentation](https://create.t3.gg/)
- [Learn the T3 Stack](https://create.t3.gg/en/faq#what-learning-resources-are-currently-available) — Check out these awesome tutorials

You can check out the [create-t3-app GitHub repository](https://github.com/t3-oss/create-t3-app) — your feedback and contributions are welcome!

## How do I deploy this?

Follow our deployment guides for [Vercel](https://create.t3.gg/en/deployment/vercel), [Netlify](https://create.t3.gg/en/deployment/netlify) and [Docker](https://create.t3.gg/en/deployment/docker) for more information.

### First deployment.

1. To configure s3 to enable CORS

```console
awslocal s3api put-bucket-cors --bucket snaplucc-dev --cors-configuration file://s3.cors.config.json
```

### Roadmap

- [x] Backend tests
- [ ] Generic interface for `payment` and `storage`
- [ ] Integrate new backend into frontend
- [ ] Use Terraform to automate infrastructure deployment(https://vercel.com/guides/integrating-terraform-with-vercel)
- [ ] Add CI with GitHub Actions
- [ ] Add CD(for the non-vercel code) with GitHub Actions
- [ ] Enhance frontend design
- [ ] Integrate Sentry only

### Study

- [ ] PM2
- [ ] OpenTelemetry
  - https://vercel.com/docs/concepts/observability/otel-overview/quickstart
  - https://signoz.io/docs/instrumentation/javascript/#using-the-all-in-one-auto-instrumentation-library
