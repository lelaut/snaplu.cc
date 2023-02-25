#!/usr/bin/python3

from sys import argv
from os import listdir
from os.path import isfile, join

from PIL import Image
from torch.jit import load
from torchvision import transforms

from uuid import uuid4

TEMPLATE = """
{
  "collection_name": "card",
  "fields_data": [
    {
      "field_name": "id",
      "type": 21,
      "field": %s
    },
    {
      "field_name": "descriptor",
      "type": 101,
      "field": %s
    }
  ],
  "num_rows": %d
}
"""

path = argv[1]

model = load("../../embeddings/model.torchscript.pt")
normalize = transforms.Normalize(
    mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225],
)
transform = transforms.Compose([
    transforms.Resize(288),
    transforms.ToTensor(),
    normalize,
])

descriptors = []

images = [f for f in listdir(path) if isfile(join(path, f))]
count = 0
for image in images:
  processed_image = transform(Image.open(join(path, image)).convert('RGB')).unsqueeze(0)
  output = model(processed_image)
  descriptors.append(output.tolist()[0])
  count += 1
  print("computed %d/%d" % (count, len(images)))
  
print("writing file...")
with open("output.json", "w") as f:
  f.write(TEMPLATE % (str([uuid4().hex for _ in range(len(descriptors))]).replace("'", '"'),str(descriptors),len(descriptors)))
print("done!")
print("result written in 'output.json'")