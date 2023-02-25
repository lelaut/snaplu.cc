# Similarity Vector Search

Efficient vector search by similarity factor(Euclidean distance or cosine similarity).

## Tutorial

To run [Milvus](https://milvus.io/docs/install_standalone-docker.md), first execute:

```console
docker-compose up -d
```

Now check if the containers are up and running.

```console
docker-compose ps
```

If you want to stop Milvus.

```console
docker-compose down

# To delete the data
rm -rf volumes
```

## Resources

- To know more about indexing in Milvus, check [this](https://milvus.io/docs/index.md) for in-memory or [this](https://milvus.io/docs/disk_index.md) for disk-memory indexing.
- https://github.com/facebookresearch/faiss

```console
CFLAGS="-I /opt/homebrew/opt/openssl/include" LDFLAGS="-L /opt/homebrew/opt/openssl/lib" GRPC_PYTHON_BUILD_SYSTEM_OPENSSL=1 GRPC_PYTHON_BUILD_SYSTEM_ZLIB=1 pip3 install -r requirements.txt
```
