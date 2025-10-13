#!/usr/bin/env python3
"""
Create simple icon files for the Chrome extension.
Requires: pip install pillow
"""

try:
    from PIL import Image, ImageDraw
    
    # Create icons in three sizes
    sizes = [(16, 16), (48, 48), (128, 128)]
    color = (76, 175, 80)  # Green color matching the Start button
    
    for width, height in sizes:
        # Create a new image with transparent background
        img = Image.new('RGBA', (width, height), (255, 255, 255, 0))
        draw = ImageDraw.Draw(img)
        
        # Draw a rounded rectangle background
        draw.rounded_rectangle(
            [(0, 0), (width-1, height-1)], 
            radius=width//8, 
            fill=color
        )
        
        # Add a play symbol (triangle)
        margin = width * 0.25
        points = [
            (margin, margin),  # Top left
            (margin, height - margin),  # Bottom left
            (width - margin, height // 2)  # Right middle
        ]
        draw.polygon(points, fill=(255, 255, 255))
        
        # Save the icon
        img.save(f'icon{width}.png')
        print(f'Created icon{width}.png')
    
    print("\nIcons created successfully!")
    print("You can now load the extension in Chrome.")
    
except ImportError:
    print("Pillow is not installed. Creating simple placeholder icons...")
    
    # Create very simple icons without Pillow
    import struct
    import zlib
    
    def create_simple_png(size, filename):
        # Create a simple solid color PNG
        width = height = size
        
        # PNG header
        header = b'\x89PNG\r\n\x1a\n'
        
        # IHDR chunk
        ihdr_data = struct.pack('>IIBBBBB', width, height, 8, 2, 0, 0, 0)
        ihdr = b'IHDR' + ihdr_data
        ihdr_crc = zlib.crc32(ihdr) & 0xffffffff
        ihdr_chunk = struct.pack('>I', 13) + ihdr + struct.pack('>I', ihdr_crc)
        
        # IDAT chunk (simple green rectangle)
        # Create scanlines
        scanlines = b''
        for y in range(height):
            scanline = b'\x00'  # Filter type: None
            for x in range(width):
                # RGB: green color
                scanline += b'\x4c\xaf\x50'
            scanlines += scanline
        
        idat_data = zlib.compress(scanlines)
        idat = b'IDAT' + idat_data
        idat_crc = zlib.crc32(idat) & 0xffffffff
        idat_chunk = struct.pack('>I', len(idat_data)) + idat + struct.pack('>I', idat_crc)
        
        # IEND chunk
        iend = b'IEND'
        iend_crc = zlib.crc32(iend) & 0xffffffff
        iend_chunk = struct.pack('>I', 0) + iend + struct.pack('>I', iend_crc)
        
        # Write PNG file
        with open(filename, 'wb') as f:
            f.write(header + ihdr_chunk + idat_chunk + iend_chunk)
    
    # Create the icons
    for size in [16, 48, 128]:
        create_simple_png(size, f'icon{size}.png')
        print(f'Created simple icon{size}.png')
    
    print("\nBasic icons created!")
    print("For better icons, install Pillow: pip install pillow")
    print("Then run this script again.")