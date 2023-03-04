# Vector embeddings for image similarity

To run [this](https://github.com/facebookresearch/sscd-copy-detection) model on [Cog](https://github.com/replicate/cog) containers.

## Step by step

First you need to download the model:

```console
# It can be the large but slower one(1024):
curl https://dl.fbaipublicfiles.com/sscd-copy-detection/sscd_disc_large.torchscript.pt -o model.torchscript.pt

# Or the smaller but faster(512):
curl https://dl.fbaipublicfiles.com/sscd-copy-detection/sscd_disc_mixup.torchscript.pt -o model.torchscript.pt
```

After that you need to install `cog`, if you are using MacOS with Intel, then execute:

```console
brew install cog
```

> If is Apple Silicon you'll probably need to prefix with `arch -x86_64`.

You'll also need docker:

```console
brew install --cask docker
```

You should be able to run the model locally by executing:

```console
cog predict -i image@cat.jpeg
```

If you want to build a Docker image for deployment do:

```console
cog build -t my-model
```

Then run Docker:

```console
docker run -d -p 3033:5000 my-model

# If your model uses a GPU:
docker run -d -p 5000:5000 --gpus all my-model
```

Now you can access the server from:

```console
curl http://localhost:3033/

curl http://localhost:3033/predictions -X POST \
    -H 'Content-Type: application/json' \
    -d '{"input": {"image": "https://.../input.jpg"}}'
```

## Useful links

- https://replicate.com/docs/guides/push-a-model
- https://github.com/Nutlope/restorePhotos/blob/main/pages/api/generate.ts
- https://github.com/facebookresearch/sscd-copy-detection
