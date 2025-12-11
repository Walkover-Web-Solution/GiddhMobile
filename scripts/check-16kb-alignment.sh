#!/bin/bash

# Script to check 16KB page alignment of native libraries in your APK
# For Android 15+ 16KB page size support

set -e

# Configuration
APK_PATH="${1:-android/app/build/outputs/apk/release/app-release.apk}"
OUTPUT_DIR="rn_apk_out"
NDK_VERSION="27.1.12297006"  # Update this to match your NDK version

# Try to find llvm-objdump
if [[ "$OSTYPE" == "darwin"* ]]; then
    OBJDUMP=~/Library/Android/sdk/ndk/${NDK_VERSION}/toolchains/llvm/prebuilt/darwin-x86_64/bin/llvm-objdump
else
    OBJDUMP=~/Android/Sdk/ndk/${NDK_VERSION}/toolchains/llvm/prebuilt/linux-x86_64/bin/llvm-objdump
fi

# Check if objdump exists
if [ ! -f "$OBJDUMP" ]; then
    echo "Error: llvm-objdump not found at $OBJDUMP"
    echo "Please update NDK_VERSION in this script to match your installed NDK"
    echo ""
    echo "Available NDK versions:"
    ls ~/Library/Android/sdk/ndk/ 2>/dev/null || ls ~/Android/Sdk/ndk/ 2>/dev/null || echo "No NDK found"
    exit 1
fi

# Check if APK exists
if [ ! -f "$APK_PATH" ]; then
    echo "Error: APK not found at $APK_PATH"
    echo "Please build your APK first with: cd android && ./gradlew assembleRelease"
    exit 1
fi

echo "=============================================="
echo "16KB Page Size Alignment Checker"
echo "=============================================="
echo ""
echo "APK: $APK_PATH"
echo "NDK: $NDK_VERSION"
echo ""

# Clean and extract APK
rm -rf "$OUTPUT_DIR"
mkdir -p "$OUTPUT_DIR"
unzip -o -q "$APK_PATH" -d "$OUTPUT_DIR"

# Check arm64-v8a libraries (primary target for 16KB devices)
LIB_FOLDER="$OUTPUT_DIR/lib/arm64-v8a"

if [ ! -d "$LIB_FOLDER" ]; then
    echo "Error: No arm64-v8a libraries found in APK"
    exit 1
fi

echo "Checking .so alignment in $LIB_FOLDER..."
echo ""
echo "Results (0x4000 = 16KB aligned ✓, 0x1000 = 4KB aligned ✗):"
echo "----------------------------------------------"

INCOMPATIBLE=0
TOTAL=0

for sofile in "$LIB_FOLDER"/*.so; do
    if [ -f "$sofile" ]; then
        TOTAL=$((TOTAL + 1))
        # Get the alignment from the first LOAD segment
        ALIGN=$($OBJDUMP -p "$sofile" 2>/dev/null | grep -E "^\s+LOAD" | head -n1 | awk '{print $NF}')
        
        FILENAME=$(basename "$sofile")
        
        if [ -z "$ALIGN" ]; then
            echo "  $FILENAME: ⚠️  Could not determine alignment"
        elif [ "$ALIGN" == "0x4000" ] || [ "$ALIGN" == "0x10000" ]; then
            echo "  $FILENAME: ✅ $ALIGN (16KB compatible)"
        elif [ "$ALIGN" == "0x1000" ]; then
            echo "  $FILENAME: ❌ $ALIGN (4KB only - NOT 16KB compatible)"
            INCOMPATIBLE=$((INCOMPATIBLE + 1))
        else
            # Check if alignment is >= 16KB (0x4000 = 16384)
            ALIGN_DEC=$((ALIGN))
            if [ "$ALIGN_DEC" -ge 16384 ]; then
                echo "  $FILENAME: ✅ $ALIGN (16KB compatible)"
            else
                echo "  $FILENAME: ❌ $ALIGN (NOT 16KB compatible)"
                INCOMPATIBLE=$((INCOMPATIBLE + 1))
            fi
        fi
    fi
done

echo ""
echo "=============================================="
echo "Summary: $TOTAL libraries checked"

if [ $INCOMPATIBLE -eq 0 ]; then
    echo "✅ All libraries are 16KB page size compatible!"
    echo "=============================================="
else
    echo "❌ $INCOMPATIBLE libraries are NOT 16KB compatible"
    echo "=============================================="
    echo ""
    echo "To fix incompatible libraries:"
    echo "1. Add to android/gradle.properties:"
    echo "   android.ndk.16KBPageAlignment=true"
    echo ""
    echo "2. For third-party libraries, update to latest versions"
    echo "   that support 16KB alignment"
    echo ""
    echo "3. Clean and rebuild: cd android && ./gradlew clean assembleRelease"
fi

# Cleanup
rm -rf "$OUTPUT_DIR"

