from PIL import Image, ImageEnhance, ImageFilter

# Load image
img = Image.open('public/Jai_Sharma-removebg-preview.png').convert('RGBA')
w, h = img.size

# Face crop
face = img.crop((int(w*0.15), int(h*0.05), int(w*0.85), int(h*0.65)))

# Pro processing for 192x192
temp = face.resize((512, 512), Image.Resampling.LANCZOS)  # Upsize first
temp = ImageEnhance.Contrast(temp).enhance(1.3)
temp = ImageEnhance.Sharpness(temp).enhance(1.2)
temp = temp.filter(ImageFilter.UnsharpMask(radius=1, percent=150, threshold=3))

# Final 192x192 - perfect size!
final192 = temp.resize((192, 192), Image.Resampling.LANCZOS)
final192.save('public/Jaisharma-192.png')
print("✅ Jaisharma-192.png ready in public/ folder!")
