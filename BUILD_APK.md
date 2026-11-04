# WTHR-GO — Android APK & GitHub Releases Guide

Every time you push or publish changes to your repository (`main` branch or a tag), the GitHub Actions workflow in [`.github/workflows/build-apk.yml`](.github/workflows/build-apk.yml) automatically compiles **WTHR-GO** into an installable Android APK and publishes it directly to your **GitHub Releases** section!

---

## 📥 Where to Download the APK

### Method 1: GitHub Releases (Recommended)
1. Go to your repository's Releases page:
   👉 **[https://github.com/LordRamlington/WTHR-GO/releases](https://github.com/LordRamlington/WTHR-GO/releases)**
2. Under the **Latest Release**, you will see **`WTHR-GO-debug.apk`** under the **Assets** section.
3. Tap or click to download the APK directly to your phone or computer.

### Method 2: GitHub Actions Artifacts
1. Go to the **Actions** tab in your repository:
   👉 **[https://github.com/LordRamlington/WTHR-GO/actions](https://github.com/LordRamlington/WTHR-GO/actions)**
2. Click on the latest workflow run (`Build WTHR-GO Android APK`).
3. Scroll down to the bottom **Artifacts** section and click **WTHR-GO-Android-APK**.

---

## 📲 How to Install on Android

1. Download **`WTHR-GO-debug.apk`** directly on your Android phone using Chrome, Firefox, or by transferring it from your computer.
2. Tap the downloaded file in your browser's download manager or your Android **Files** app.
3. If Android prompts you with *"For your security, your phone is not allowed to install unknown apps from this source"*:
   - Tap **Settings**.
   - Toggle **Allow from this source**.
   - Tap **Back** and tap **Install**.
4. Open **WTHR-GO** from your app drawer!

---

## ⚙️ Repository Settings Note

To ensure GitHub Actions has permission to publish releases to your repository:
1. In your GitHub repo, go to **Settings** > **Actions** > **General**.
2. Scroll to **Workflow permissions**.
3. Ensure **"Read and write permissions"** is selected and save.
