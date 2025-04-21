# Orbit Institute System - Android Application Guide

This guide explains how to convert the Orbit Institute web application into an Android app that connects to your online MySQL database.

## Overview

There are two main approaches to create an Android app from your web application:

1. **WebView Approach**: Package your web application in a native Android WebView
2. **React Native Approach**: Convert your React web app to React Native

We'll focus on the WebView approach since it's faster to implement and provides a good experience for your admin application.

## WebView Android App Development

### Prerequisites

- Android Studio installed (latest version)
- JDK 11 or newer
- Basic familiarity with Android development

### Step 1: Create a New Android Project

1. Open Android Studio
2. Select "Create New Project"
3. Choose "Empty Activity" template
4. Configure the project:
   - Name: "Orbit Institute System"
   - Package name: "com.orbitinstitute.management"
   - Language: Kotlin
   - Minimum API level: API 24 (Android 7.0)

### Step 2: Configure Web View

1. Open `activity_main.xml` and replace it with:

```xml
<?xml version="1.0" encoding="utf-8"?>
<androidx.constraintlayout.widget.ConstraintLayout xmlns:android="http://schemas.android.com/apk/res/android"
    xmlns:app="http://schemas.android.com/apk/res-auto"
    xmlns:tools="http://schemas.android.com/tools"
    android:layout_width="match_parent"
    android:layout_height="match_parent"
    tools:context=".MainActivity">

    <WebView
        android:id="@+id/webView"
        android:layout_width="0dp"
        android:layout_height="0dp"
        app:layout_constraintBottom_toBottomOf="parent"
        app:layout_constraintEnd_toEndOf="parent"
        app:layout_constraintStart_toStartOf="parent"
        app:layout_constraintTop_toTopOf="parent" />

    <ProgressBar
        android:id="@+id/progressBar"
        style="?android:attr/progressBarStyle"
        android:layout_width="wrap_content"
        android:layout_height="wrap_content"
        app:layout_constraintBottom_toBottomOf="parent"
        app:layout_constraintEnd_toEndOf="parent"
        app:layout_constraintStart_toStartOf="parent"
        app:layout_constraintTop_toTopOf="parent" />

</androidx.constraintlayout.widget.ConstraintLayout>
```

2. Open `MainActivity.kt` and replace it with:

```kotlin
package com.orbitinstitute.management

import android.annotation.SuppressLint
import android.content.Context
import android.net.ConnectivityManager
import android.net.NetworkCapabilities
import android.os.Build
import android.os.Bundle
import android.view.View
import android.webkit.*
import android.widget.ProgressBar
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity

class MainActivity : AppCompatActivity() {
    private lateinit var webView: WebView
    private lateinit var progressBar: ProgressBar
    
    // Replace with your actual hosted web application URL
    private val appUrl = "https://your-hostinger-website.com" 

    @SuppressLint("SetJavaScriptEnabled")
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)
        
        webView = findViewById(R.id.webView)
        progressBar = findViewById(R.id.progressBar)

        if (!isNetworkAvailable()) {
            Toast.makeText(this, "No internet connection available", Toast.LENGTH_LONG).show()
        }

        // Configure WebView
        webView.settings.apply {
            javaScriptEnabled = true
            domStorageEnabled = true
            databaseEnabled = true
            setAppCacheEnabled(true)
            loadsImagesAutomatically = true
            mixedContentMode = WebSettings.MIXED_CONTENT_ALWAYS_ALLOW
            useWideViewPort = true
            loadWithOverviewMode = true
            setSupportZoom(true)
            builtInZoomControls = true
            displayZoomControls = false
        }

        // Add WebView client to handle page loading
        webView.webViewClient = object : WebViewClient() {
            override fun shouldOverrideUrlLoading(view: WebView?, request: WebResourceRequest?): Boolean {
                return false
            }

            override fun onPageFinished(view: WebView?, url: String?) {
                progressBar.visibility = View.GONE
                super.onPageFinished(view, url)
            }
        }

        // Add Chrome client to handle JavaScript alerts
        webView.webChromeClient = object : WebChromeClient() {
            override fun onProgressChanged(view: WebView?, newProgress: Int) {
                super.onProgressChanged(view, newProgress)
                if (newProgress < 100) {
                    progressBar.visibility = View.VISIBLE
                } else {
                    progressBar.visibility = View.GONE
                }
            }
        }

        // Load the web application
        webView.loadUrl(appUrl)
    }

    // Handle back button to navigate within the WebView
    override fun onBackPressed() {
        if (webView.canGoBack()) {
            webView.goBack()
        } else {
            super.onBackPressed()
        }
    }

    // Check for an active network connection
    private fun isNetworkAvailable(): Boolean {
        val connectivityManager = getSystemService(Context.CONNECTIVITY_SERVICE) as ConnectivityManager
        
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            val networkCapabilities = connectivityManager.activeNetwork ?: return false
            val actNw = connectivityManager.getNetworkCapabilities(networkCapabilities) ?: return false
            
            return when {
                actNw.hasTransport(NetworkCapabilities.TRANSPORT_WIFI) -> true
                actNw.hasTransport(NetworkCapabilities.TRANSPORT_CELLULAR) -> true
                actNw.hasTransport(NetworkCapabilities.TRANSPORT_ETHERNET) -> true
                else -> false
            }
        } else {
            val networkInfo = connectivityManager.activeNetworkInfo
            return networkInfo != null && networkInfo.isConnected
        }
    }
}
```

### Step 3: Add Internet Permission

Add Internet permission to your `AndroidManifest.xml` by adding this line before the `<application>` tag:

```xml
<uses-permission android:name="android.permission.INTERNET" />
<uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
```

### Step 4: Create App Icons

1. Create app icons using Android Studio's Image Asset Studio:
   - Right-click on the `res` folder
   - Select "New > Image Asset"
   - Choose "Launcher Icons (Adaptive and Legacy)"
   - Select your logo image
   - Configure as needed and click "Next" and then "Finish"

### Step 5: Build the APK

1. Go to "Build > Build Bundle(s) / APK(s) > Build APK(s)"
2. Android Studio will build the APK and show a notification when complete
3. Click on the "locate" link in the notification to find your APK file

### Step 6: Distribute the App

Your APK file is now ready for distribution. You can:
1. Share it directly with your team
2. Upload it to your website for download
3. Publish it on Google Play Store (requires a developer account)

## Important Considerations

### 1. Hosting Your Web Application

Before creating the Android app, you need to:
1. Deploy your web application to Hostinger
2. Ensure it's accessible via a public URL (e.g., https://orbitinstitute.com)
3. Update the `appUrl` in `MainActivity.kt` with this URL

### 2. Responsive Design

Make sure your web application is responsive and works well on mobile devices:
- Test on different screen sizes
- Ensure buttons and inputs are large enough for touch
- Check for any desktop-specific features that might not work on mobile

### 3. Database Connection

Your Android app will connect to the MySQL database through your hosted web application. You don't need to configure the database connection directly in the Android app.

### 4. Security

- Use HTTPS for your web application URL
- Implement proper authentication and session management
- Consider implementing app-specific security measures (certificate pinning, etc.)

## Future Improvements

To enhance your Android app in the future, consider:

1. **Push Notifications**: Integrate Firebase Cloud Messaging for real-time notifications
2. **Offline Support**: Add service workers for offline capability
3. **Native Features**: Add interfaces between JavaScript and native Android functionality
4. **App Updates**: Implement in-app update checking