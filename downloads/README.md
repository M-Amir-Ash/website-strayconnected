# Downloads Folder

This folder should contain the actual APK and IPA files for the StrayConnected app.

## Required Files:

1. **StrayConnected.apk**
   - Android application package
   - Built and signed APK file

2. **StrayConnected.ipa**
   - iOS application archive
   - Signed IPA file for iOS distribution

## Important Notes:

### For Android (APK):
- Build your Android app using Android Studio or React Native
- Sign the APK with your keystore
- Test on different Android devices
- Users will need to enable "Install from Unknown Sources"

### For iOS (IPA):
- Build your iOS app using Xcode
- Sign with your Apple Developer certificate
- For distribution outside App Store, you'll need:
  - Enterprise distribution certificate, or
  - Ad-hoc distribution (limited devices), or
  - Use a service like TestFlight for beta testing

### Alternative Distribution Methods:

If you can't distribute IPA files directly:
- Use **TestFlight** for iOS beta testing (recommended)
- Use **Firebase App Distribution** for both platforms
- Use **AppCenter** by Microsoft
- Use **Diawi** for wireless app installation

### Security Warning:

Make sure your website uses HTTPS when distributing apps. Users should only download from your official website to prevent malware distribution.

## File Naming Convention:

Consider versioning your files:
- StrayConnected_v1.0.0.apk
- StrayConnected_v1.0.0.ipa

This helps track which version users are downloading.
