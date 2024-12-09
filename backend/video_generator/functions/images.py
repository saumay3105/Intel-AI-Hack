import os
from typing import List, Optional, Tuple, Union
import numpy as np
from pathlib import Path
import torch
from diffusers import StableDiffusionPipeline
from openvino.runtime import Core
from PIL import Image
import time

class StableDiffusionOpenVINO:
    def __init__(
        self,
        model_path: str = "runwayml/stable-diffusion-v1-5",
        device: str = "CPU",
        output_dir: str = "generated_images"
    ):
        """
        Initialize Stable Diffusion with OpenVINO optimization.
        
        Args:
            model_path: Path to the Stable Diffusion model or model ID from HuggingFace
            device: Device to run inference on ("CPU", "GPU", or "AUTO")
            output_dir: Directory to save generated images
        """
        # Initialize OpenVINO Core
        self.core = Core()
        
        # Create output directory if it doesn't exist
        self.output_dir = Path(output_dir)
        self.output_dir.mkdir(parents=True, exist_ok=True)
        
        # Load and convert the model to OpenVINO format
        print("Loading and optimizing Stable Diffusion model...")
        self.model = self._load_and_optimize_model(model_path, device)
        
        # Set default generation parameters
        self.default_params = {
            "height": 512,
            "width": 512,
            "num_inference_steps": 30,
            "guidance_scale": 7.5,
            "negative_prompt": "blurry, bad quality, worst quality, jpeg artifacts"
        }

    def _load_and_optimize_model(self, model_path: str, device: str) -> StableDiffusionPipeline:
        """
        Load the Stable Diffusion model and optimize it with OpenVINO.
        
        Args:
            model_path: Path to model or model ID
            device: Target device for optimization
            
        Returns:
            Optimized StableDiffusionPipeline
        """
        # First load the original pipeline
        pipe = StableDiffusionPipeline.from_pretrained(
            model_path,
            torch_dtype=torch.float32
        )
        
        # Convert to OpenVINO IR format
        pipe = pipe.to_openvino(device=device)
        
        # Optimize the model for the target device
        if device == "CPU":
            # Apply CPU-specific optimizations
            pipe.compile_model("CPU")
            # Enable threading optimizations
            pipe.set_config({"NUM_STREAMS": os.cpu_count()})
        elif device == "GPU":
            # Apply GPU-specific optimizations
            pipe.compile_model("GPU")
            pipe.set_config({"GPU_THROUGHPUT_STREAMS": "AUTO"})
            
        return pipe

    def generate_images(
        self,
        prompt: str,
        num_images: int = 1,
        seed: Optional[int] = None,
        **kwargs
    ) -> List[Image.Image]:
        """
        Generate images from a text prompt using Stable Diffusion.
        
        Args:
            prompt: Text description of the desired image
            num_images: Number of images to generate
            seed: Random seed for reproducibility
            **kwargs: Additional generation parameters that override defaults
            
        Returns:
            List of generated PIL Images
        """
        try:
            # Start timing
            start_time = time.time()
            
            # Set random seed if provided
            if seed is not None:
                np.random.seed(seed)
                torch.manual_seed(seed)
            
            # Merge default parameters with any provided overrides
            generation_params = self.default_params.copy()
            generation_params.update(kwargs)
            
            # Generate images in batches
            generated_images = []
            batch_size = min(num_images, 4)  # Process up to 4 images at once
            
            for i in range(0, num_images, batch_size):
                current_batch_size = min(batch_size, num_images - i)
                
                # Generate the batch
                result = self.model(
                    prompt=[prompt] * current_batch_size,
                    negative_prompt=[generation_params["negative_prompt"]] * current_batch_size,
                    num_images_per_prompt=1,
                    height=generation_params["height"],
                    width=generation_params["width"],
                    num_inference_steps=generation_params["num_inference_steps"],
                    guidance_scale=generation_params["guidance_scale"]
                )
                
                # Add generated images to our list
                generated_images.extend(result.images)
                
                # Save images if requested
                if self.output_dir:
                    for idx, image in enumerate(result.images):
                        image_path = self.output_dir / f"generated_{int(time.time())}_{i + idx}.png"
                        image.save(image_path)
            
            # Calculate and print generation statistics
            total_time = time.time() - start_time
            avg_time_per_image = total_time / num_images
            print(f"Generated {num_images} images in {total_time:.2f}s "
                  f"(average {avg_time_per_image:.2f}s per image)")
            
            return generated_images
            
        except Exception as e:
            print(f"Error generating images: {str(e)}")
            return []

    def adjust_model_settings(self, **kwargs):
        """
        Adjust default generation parameters.
        
        Args:
            **kwargs: Parameters to update (height, width, num_inference_steps, etc.)
        """
        self.default_params.update(kwargs)
        print("Updated default parameters:", self.default_params)

def generate_images_from_prompt(
    prompt: str,
    num_images: int = 1,
    output_dir: str = "generated_images",
    device: str = "CPU",
    **kwargs
) -> List[str]:
    """
    Convenience function to generate images from a prompt.
    
    Args:
        prompt: Text description of the desired image
        num_images: Number of images to generate
        output_dir: Directory to save generated images
        device: Device to run inference on
        **kwargs: Additional generation parameters
        
    Returns:
        List of paths to generated images
    """
    # Initialize the generator
    generator = StableDiffusionOpenVINO(
        output_dir=output_dir,
        device=device
    )
    
    # Generate the images
    images = generator.generate_images(
        prompt=prompt,
        num_images=num_images,
        **kwargs
    )
    
    # Return the paths to generated images
    return [
        str(Path(output_dir) / f"generated_{int(time.time())}_{i}.png")
        for i in range(len(images))
    ]