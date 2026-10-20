import os
from PIL import Image

for name in ['bike-mtb', 'bike-road', 'bike-city', 'bike-kids']:
    in_path = os.path.join('public', f'{name}.png')
    out_webp = os.path.join('public', f'{name}.webp')
    out_png = os.path.join('public', f'{name}-opt.png')
    
    im = Image.open(in_path)
    w, h = im.size
    target_w = 540
    target_h = int(h * (target_w / w))
    im_resized = im.resize((target_w, target_h), Image.Resampling.LANCZOS)
    
    # Save optimized webp
    im_resized.save(out_webp, 'WEBP', quality=92, method=6)
    # Save optimized png
    im_resized.save(out_png, 'PNG', optimize=True)
    
    print(f"{name}: WebP={os.path.getsize(out_webp)} bytes, PNG={os.path.getsize(out_png)} bytes (original={os.path.getsize(in_path)} bytes)")

print("Optimization complete!")
