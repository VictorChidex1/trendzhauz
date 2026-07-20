import os
from PIL import Image

def main():
    img_path = "/Users/mac/Documents/Vibe Coding/trendzhauz/public/assets/Trendzhauz-logo.png"
    if not os.path.exists(img_path):
        print(f"Error: {img_path} not found")
        return
        
    img = Image.open(img_path).convert("RGBA")
    w, h = img.size
    
    # Filter orange pixels of the play button specifically
    # The play button is strictly on the left (x < 420) and in the lower-middle height (y > 400)
    orange_pixels = []
    
    for x in range(w):
        for y in range(h):
            r, g, b, a = img.getpixel((x, y))
            # Detect orange: high red, medium green, low blue
            if r > 180 and g > 60 and b < 80 and a > 100:
                if x < 420 and y > 400:
                    orange_pixels.append((x, y))
                
    if orange_pixels:
        xs = [p[0] for p in orange_pixels]
        ys = [p[1] for p in orange_pixels]
        
        min_x, max_x = min(xs), max(xs)
        min_y, max_y = min(ys), max(ys)
        
        print(f"Isolated orange play button box: ({min_x}, {min_y}, {max_x}, {max_y})")
        
        margin = 12
        crop_box = (
            max(0, min_x - margin),
            max(0, min_y - margin),
            min(w, max_x + margin),
            min(h, max_y + margin)
        )
        
        play_btn = img.crop(crop_box)
        
        # Make it a perfect square
        pw, ph = play_btn.size
        pmax = max(pw, ph)
        square_play = Image.new("RGBA", (pmax, pmax), (0, 0, 0, 0))
        square_play.paste(play_btn, ((pmax - pw)//2, (pmax - ph)//2))
        
        # Save play button only
        play_button_path = "/Users/mac/Documents/Vibe Coding/trendzhauz/public/assets/Trendzhauz-icon-only.png"
        square_play.save(play_button_path, "PNG")
        print(f"Saved isolated play button icon to: {play_button_path} (size: {square_play.size})")

if __name__ == "__main__":
    main()
