# Cloudinary Setup Instructions

To enable image uploads in your admin panel, you need to create an upload preset in your Cloudinary account.

## Steps:

1. **Login to Cloudinary Console**
   - Go to [https://console.cloudinary.com/](https://console.cloudinary.com/)
   - Login with your account credentials

2. **Create Upload Preset**
   - Navigate to "Settings" → "Upload"
   - Click "Add upload preset"
   - Set preset name: `portfolio_uploads`
   - Set signing mode to "Unsigned"
   - Optional: Set folder to `portfolio` for organization

3. **Configure Preset (Optional)**
   - Max file size: 10MB
   - Allowed formats: jpg, jpeg, png, webp
   - Transformation: Auto-optimize quality

4. **Save the Preset**
   - Click "Save"

## Your Current Settings:
- **Cloud Name**: dkid7ilxv
- **Upload Preset**: portfolio_uploads (you need to create this)

## Alternative: Use Default Preset
If you prefer to use the default preset, change line 402 in `/app/admin/page.tsx`:
```typescript
uploadPreset="ml_default"
```

## Test Upload
Once configured, you can test image uploads by:
1. Going to `/admin` 
2. Signing in
3. Clicking "Upload Photo" in the Personal Information section
