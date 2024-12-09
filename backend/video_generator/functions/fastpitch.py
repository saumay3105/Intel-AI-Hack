import os
from typing import List, Tuple
import torch
import numpy as np
import soundfile as sf
from transformers import AutoTokenizer
from fastpitch import FastPitchModel
import intel_extension_for_pytorch as ipex
from phonemizer import phonemize
from dotenv import load_dotenv, find_dotenv
import librosa

class FastPitchSpeechGenerator:
    def __init__(self):
        """
        Initialize the FastPitch model with Intel oneAPI optimizations.
        Sets up necessary components for speech synthesis and viseme generation.
        """
        # Load environment variables and configurations
        load_dotenv(find_dotenv())
        
        # Initialize the FastPitch model
        self.model = FastPitchModel.from_pretrained("nvidia/fastpitch")
        self.tokenizer = AutoTokenizer.from_pretrained("nvidia/fastpitch")
        
        # Enable Intel oneAPI optimizations
        self.model = ipex.optimize(self.model)
        
        # Move model to CPU with oneAPI optimizations
        self.device = torch.device("cpu")
        self.model = self.model.to(self.device)
        self.model.eval()
        
        # Define viseme mapping (phoneme to viseme conversion)
        self.phoneme_to_viseme = {
            'AA': 0,  # ah
            'AE': 1,  # at
            'AH': 0,  # hut
            'AO': 2,  # bought
            'AW': 3,  # cow
            'AY': 4,  # hide
            'B': 5,   # be
            'CH': 6,  # cheese
            'D': 7,   # dee
            'DH': 7,  # thee
            'EH': 1,  # ed
            'ER': 8,  # hurt
            'EY': 4,  # ate
            'F': 9,   # fee
            'G': 10,  # green
            'HH': 11, # he
            'IH': 1,  # it
            'IY': 1,  # eat
            'JH': 6,  # gee
            'K': 10,  # key
            'L': 12,  # lee
            'M': 5,   # me
            'N': 7,   # knee
            'NG': 10, # ping
            'OW': 2,  # oat
            'OY': 2,  # toy
            'P': 5,   # pee
            'R': 8,   # read
            'S': 13,  # sea
            'SH': 13, # she
            'T': 7,   # tea
            'TH': 9,  # theta
            'UH': 2,  # hood
            'UW': 2,  # two
            'V': 9,   # vee
            'W': 14,  # we
            'Y': 1,   # yield
            'Z': 13,  # zee
            'ZH': 13, # seizure
            'SIL': 15 # silence
        }

    def _convert_phonemes_to_visemes(self, phonemes: List[str], durations: List[float]) -> List[List[float]]:
        """
        Convert phonemes to viseme IDs with their corresponding timings.
        
        Args:
            phonemes: List of phoneme strings
            durations: List of phoneme durations in seconds
            
        Returns:
            List of [timestamp, viseme_id] pairs
        """
        viseme_data = []
        current_time = 0
        
        for phoneme, duration in zip(phonemes, durations):
            # Convert phoneme to viseme ID
            viseme_id = self.phoneme_to_viseme.get(phoneme, 15)  # Default to silence viseme
            
            # Add viseme timing data (convert to milliseconds)
            viseme_data.append([current_time * 1000, viseme_id])
            current_time += duration
            
        return viseme_data

    def generate_speech_and_viseme(
        self,
        text: str,
        audio_output_file: str = "output.wav",
        voice: str = "female",
        sample_rate: int = 22050
    ) -> Tuple[List[List[float]], None]:
        """
        Generate speech audio and viseme data from input text using FastPitch with Intel oneAPI optimization.
        
        Args:
            text: Input text to convert to speech
            audio_output_file: Path to save the generated audio
            voice: Voice type (currently supports 'male' or 'female')
            sample_rate: Audio sample rate
            
        Returns:
            Tuple containing viseme data and None (for compatibility with original interface)
        """
        try:
            # Convert text to phonemes
            phonemes = phonemize(
                text,
                language='en-us',
                backend='espeak',
                strip=True,
                preserve_punctuation=True,
                with_stress=True
            ).split()
            
            # Prepare input for FastPitch
            inputs = self.tokenizer(text, return_tensors="pt")
            inputs = {k: v.to(self.device) for k, v in inputs.items()}
            
            # Generate speech with Intel oneAPI optimizations
            with torch.no_grad():
                outputs = self.model(
                    input_ids=inputs["input_ids"],
                    attention_mask=inputs["attention_mask"]
                )
            
            # Get audio and duration information
            audio = outputs.audio[0].cpu().numpy()
            durations = outputs.durations[0].cpu().numpy()
            
            # Adjust voice characteristics if needed
            if voice == "male":
                # Lower pitch for male voice
                audio = librosa.effects.pitch_shift(audio, sr=sample_rate, n_steps=-2)
            
            # Save audio file
            sf.write(audio_output_file, audio, sample_rate)
            
            # Generate viseme data
            viseme_data = self._convert_phonemes_to_visemes(phonemes, durations)
            
            print("Text-to-speech conversion successful.")
            return viseme_data
            
        except Exception as e:
            print(f"Text-to-speech conversion failed: {str(e)}")
            return None, None

def generate_speech_and_viseme_from_text(
    text: str,
    audio_output_file: str = "output.wav",
    voice: str = "female"
) -> Tuple[List[List[float]], None]:
    """
    Main function to generate speech and viseme data from text.
    This maintains the same interface as the original Azure-based function.
    
    Args:
        text: Input text to convert to speech
        audio_output_file: Path to save the generated audio
        voice: Voice type (remapped from Azure voice names to male/female)
        
    Returns:
        Tuple containing viseme data and None (for compatibility)
    """
    # Initialize the speech generator
    generator = FastPitchSpeechGenerator()
    
    # Map Azure voice names to simple male/female selection
    voice_type = "male" if voice.lower().startswith("m") else "female"
    
    # Generate speech and viseme data
    return generator.generate_speech_and_viseme(
        text=text,
        audio_output_file=audio_output_file,
        voice=voice_type
    )