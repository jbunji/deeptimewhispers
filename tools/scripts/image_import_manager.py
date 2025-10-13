#!/usr/bin/env python3
"""
Image Import Manager - Handles downloading and organizing generated images.
Supports multiple sources: Midjourney, Leonardo.ai, local folders, etc.
"""

import os
import shutil
import requests
import time
from pathlib import Path
from typing import List, Dict, Optional
import json
import re

class ImageImportManager:
    def __init__(self, base_path: str):
        self.base_path = Path(base_path)
        
    def import_from_midjourney_folder(self, source_folder: str, story_name: str):
        """
        Import images from a Midjourney download folder.
        Midjourney images are usually named with random strings.
        """
        source = Path(source_folder)
        dest = self.base_path / story_name / "generated_images"
        dest.mkdir(parents=True, exist_ok=True)
        
        # Get all image files
        image_files = sorted([
            f for f in source.iterdir() 
            if f.suffix.lower() in ['.png', '.jpg', '.jpeg', '.webp']
        ])
        
        print(f"Found {len(image_files)} images in {source_folder}")
        
        # Rename and copy
        for i, img_file in enumerate(image_files):
            new_name = f"image_{i+1:04d}.png"
            dest_path = dest / new_name
            
            # Convert to PNG if needed
            if img_file.suffix.lower() != '.png':
                # For now, just copy - you'd use PIL/Pillow to convert
                shutil.copy2(img_file, dest_path)
            else:
                shutil.copy2(img_file, dest_path)
            
            print(f"  Copied: {img_file.name} -> {new_name}")
        
        print(f"Imported {len(image_files)} images to {dest}")
        return len(image_files)
    
    def import_from_urls(self, urls: List[str], story_name: str):
        """Download images from a list of URLs."""
        dest = self.base_path / story_name / "generated_images"
        dest.mkdir(parents=True, exist_ok=True)
        
        success_count = 0
        
        for i, url in enumerate(urls):
            try:
                response = requests.get(url, timeout=30)
                response.raise_for_status()
                
                # Save image
                filename = f"image_{i+1:04d}.png"
                dest_path = dest / filename
                
                with open(dest_path, 'wb') as f:
                    f.write(response.content)
                
                print(f"  Downloaded: {filename}")
                success_count += 1
                
                # Rate limiting
                time.sleep(1)
                
            except Exception as e:
                print(f"  Error downloading image {i+1}: {e}")
        
        print(f"Downloaded {success_count}/{len(urls)} images")
        return success_count
    
    def organize_sequential_images(self, folder: str, pattern: Optional[str] = None):
        """
        Organize images into sequential order based on filename patterns.
        Useful when images are named like: prompt_1_xyz.png, prompt_2_abc.png
        """
        source = Path(folder)
        
        # Find all images
        images = []
        for file in source.iterdir():
            if file.suffix.lower() in ['.png', '.jpg', '.jpeg', '.webp']:
                images.append(file)
        
        # Sort by various patterns
        if pattern:
            # Custom pattern provided
            regex = re.compile(pattern)
            images = sorted(images, key=lambda x: int(regex.search(x.name).group(1)))
        else:
            # Try to detect numbering
            images = sorted(images, key=lambda x: x.name)
        
        # Rename to sequential
        for i, img in enumerate(images):
            new_name = f"image_{i+1:04d}{img.suffix}"
            new_path = source / new_name
            img.rename(new_path)
            print(f"  Renamed: {img.name} -> {new_name}")
        
        return len(images)
    
    def create_image_manifest(self, story_name: str):
        """Create a manifest file listing all images and their properties."""
        image_dir = self.base_path / story_name / "generated_images"
        
        if not image_dir.exists():
            print(f"No images found for {story_name}")
            return
        
        manifest = {
            "story": story_name,
            "total_images": 0,
            "images": []
        }
        
        for img_file in sorted(image_dir.glob("image_*.png")):
            manifest["images"].append({
                "filename": img_file.name,
                "size": img_file.stat().st_size,
                "path": str(img_file.relative_to(self.base_path))
            })
        
        manifest["total_images"] = len(manifest["images"])
        
        # Save manifest
        manifest_path = self.base_path / story_name / "image_manifest.json"
        with open(manifest_path, 'w', encoding='utf-8') as f:
            json.dump(manifest, f, indent=2)
        
        print(f"Created manifest for {story_name}: {manifest['total_images']} images")
        return manifest

def create_import_instructions():
    """Create detailed instructions for importing images from various sources."""
    
    instructions = """# Image Import Guide

## Importing from Midjourney

### Method 1: Discord Bulk Download
1. In Discord, go to your Midjourney DMs
2. Use a browser extension like "Discord Image Downloader"
3. Download all images to a single folder
4. Run: `python image_import_manager.py --midjourney /path/to/downloads --story 01b-theia`

### Method 2: Manual Selection
1. Save each upscaled image from Discord
2. Name them sequentially or use the import script to auto-rename
3. Place in story's generated_images folder

## Importing from Leonardo.ai

### Via Web Interface
1. Go to your Leonardo.ai generations
2. Select all images for the story
3. Click "Download All" (if available)
4. Extract ZIP to a folder
5. Run: `python image_import_manager.py --leonardo /path/to/extracted --story 01b-theia`

### Via API
1. Use the batch generation script with Leonardo API
2. Images are automatically saved in correct format

## Importing from ComfyUI/Stable Diffusion

### Local Generation
1. Set output path in ComfyUI to story folder
2. Use batch mode with prompt list
3. Images are saved with correct naming

### From Auto1111
1. Go to outputs/txt2img-images
2. Copy relevant images to a folder
3. Run: `python image_import_manager.py --organize /path/to/images --story 01b-theia`

## Quick Commands

# Import from Midjourney folder
python image_import_manager.py --source midjourney --folder ~/Downloads/MJ_batch --story 01b-theia

# Import from URL list
python image_import_manager.py --source urls --file urls.txt --story 01b-theia

# Organize existing folder
python image_import_manager.py --organize ~/Desktop/story_images --story 01b-theia

# Create manifest for all stories
python image_import_manager.py --manifest all

## File Naming Convention

All imported images will be renamed to:
- image_0001.png
- image_0002.png
- image_0003.png
- etc.

This ensures compatibility with DaVinci Resolve image sequences.
"""
    
    return instructions

# CLI interface
if __name__ == "__main__":
    import argparse
    
    parser = argparse.ArgumentParser(description="Image Import Manager")
    parser.add_argument("--source", choices=["midjourney", "leonardo", "urls", "organize"], 
                       help="Source type")
    parser.add_argument("--folder", help="Source folder path")
    parser.add_argument("--story", required=True, help="Story name (e.g., 01b-theia)")
    parser.add_argument("--manifest", action="store_true", help="Create manifest file")
    
    args = parser.parse_args()
    
    manager = ImageImportManager("/Users/justinbundrick/Documents/ClaudeProjects/AI History/DeepTimeWhispers")
    
    if args.source == "midjourney" and args.folder:
        manager.import_from_midjourney_folder(args.folder, args.story)
    elif args.source == "organize" and args.folder:
        manager.organize_sequential_images(args.folder)
    
    if args.manifest:
        manager.create_image_manifest(args.story)
    
    # Save instructions
    instructions_path = Path("/Users/justinbundrick/Documents/ClaudeProjects/AI History/DeepTimeWhispers/IMAGE_IMPORT_GUIDE.md")
    with open(instructions_path, 'w', encoding='utf-8') as f:
        f.write(create_import_instructions())