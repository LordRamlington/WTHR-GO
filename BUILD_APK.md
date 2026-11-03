# WTHR-GO — Android APK Build Guide

This repository includes an automated GitHub Actions workflow at [`.github/workflows/build-apk.yml`](.github/workflows/build-apk.yml) that automatically compiles and packages **WTHR-GO** into an installable Android APK (`.apk`).

---

## How It Works

### Automatic Build on Push
Every time you push or publish changes to your repository on the `main` or `master` branch, GitHub Actions will:
1. Build the production web bundle (`npm run build`).
2. Sync the native Android Capacitor project (`npx cap sync android`).
3. Compile the Android APK using Android SDK Gradle (`./gradlew assembleDebug`).
4. Output `WTHR-GO-debug.apk` directly to the GitHub Actions Artifacts section.

### Manual One-Click Build
1. In your GitHub repository, click the **Actions** tab at the top.
2. Under "Workflows", select **Build WTHR-GO Android APK**.
3. Click the **Run workflow** dropdown button and confirm.
4. When the build finishes (typically ~2-3 minutes), scroll down to the **Artifacts** section at the bottom of the summary page.
5. Click **WTHR-GO-Android-APK** to download the zip containing your `WTHR-GO-debug.apk`.

### Installing on Android
1. Transfer the `.apk` file to your Android phone (or download it directly on your mobile browser from GitHub).
2. Tap the APK file to install.
3. If prompted by Android, toggle **"Allow installation from unknown sources"** for your file manager or browser.
4. Launch **WTHR-GO** directly from your Android app drawer!
