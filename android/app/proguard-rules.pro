# Add project specific ProGuard rules here.
# By default, the flags in this file are appended to flags specified
# in /usr/local/Cellar/android-sdk/24.3.3/tools/proguard/proguard-android.txt
# You can edit the include path and order by changing the proguardFiles
# directive in build.gradle.
#
# For more details, see
#   http://developer.android.com/guide/developing/tools/proguard.html

# Add any project specific keep options here:
# Keep WebRTC classes
-keep class org.webrtc.** { *; }
-dontwarn org.webrtc.**

# Socket.io (if you use it with WebRTC signaling)
-keep class io.socket.** { *; }
-dontwarn io.socket.**

# For React Native JNI
-keep class com.facebook.jni.** { *; }
-dontwarn com.facebook.jni.**

