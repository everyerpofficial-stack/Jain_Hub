import base64

with open('public/logo.png', 'rb') as f:
    b64 = base64.b64encode(f.read()).decode('utf-8')

with open('src/routes/mobiles/logoBase64.ts', 'w') as f:
    f.write(f'export const JAIN_LOGO_BASE64 = "data:image/png;base64,{b64}";\n')

print("Base64 file generated successfully!")
