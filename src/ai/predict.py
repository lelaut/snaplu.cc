from typing import List
from cog import BasePredictor, Input, Path
from PIL import Image
from torch.jit import load
from torchvision import transforms

class Predictor(BasePredictor):
    def setup(self):
        """Load the model into memory to make running multiple predictions efficient"""
        self.model = load("./model.torchscript.pt")
        normalize = transforms.Normalize(
            mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225],
        )
        self.transform = transforms.Compose([
            transforms.Resize(288),
            transforms.ToTensor(),
            normalize,
        ])
        
    def predict(self,
          image: Path = Input(description="Grayscale input image")
    ) -> List[float]:
        """Run a single prediction on the model"""
        processed_image = self.transform(Image.open(image).convert('RGB')).unsqueeze(0)
        output = self.model(processed_image)
        return output.tolist()[0]
