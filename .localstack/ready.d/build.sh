#!/bin/bash

# Create main bucket
awslocal s3api create-bucket --bucket ${AWS_S3_BUCKET} --region ${AWS_DEFAULT_REGION}

# Create bucket for fetching fake images
awslocal s3api create-bucket --bucket fake-images --region ${AWS_DEFAULT_REGION}

# Upload fake images to bucket
k=0
for file in /home/localstack/imgs/*
do
    echo "uploading $file with key $k.jpg"
    awslocal s3api put-object --bucket fake-images --key "$k.jpg" --body "$file"
    k=$((k+1))
done

echo "done"