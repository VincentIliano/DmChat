#!/bin/bash
set -e  # Exit immediately if a command fails

echo "--- 🛑 KILLING ZOMBIE PROCESSES ---"
# Kills any stuck dotnet or node processes to free up ports/files
pkill -f dotnet || true
pkill -f node || true
echo "✅ Processes cleared."

echo "--- 🧹 CLEANING BUILD ARTIFACTS ---"
# Removes old build files that might be locked
dotnet clean
find . -type d -name "bin" -prune -exec rm -rf {} +
find . -type d -name "obj" -prune -exec rm -rf {} +
echo "✅ Clean complete."

echo "--- 📦 FRONTEND SETUP (The likely culprit) ---"
# Finds the directory with package.json (usually ClientApp) and runs install manually
CLIENT_DIR=$(find . -name "package.json" -not -path "*/node_modules/*" -exec dirname {} \; | head -n 1)

if [ -z "$CLIENT_DIR" ]; then
    echo "⚠️  No package.json found. Skipping frontend setup."
else
    echo "👉 Found frontend in: $CLIENT_DIR"
    cd "$CLIENT_DIR"
    
    # This prevents the build from hanging on "Optional" skipping or user prompts
    echo "Running npm install..."
    npm install --no-audit --prefer-offline
    
    # Optional: Pre-build the Angular app to catch errors early
    # echo "Building Angular app..."
    # npm run build
    
    cd - > /dev/null
    echo "✅ Frontend dependencies installed."
fi

echo "--- 🔐 CERTIFICATE CHECK ---"
# Fixes the HTTPS hang if the cert isn't trusted
dotnet dev-certs https --clean
dotnet dev-certs https --trust
echo "✅ Certificates reset."

echo "--- 🏗️  BUILDING .NET BACKEND ---"
# Runs build with 'normal' verbosity so he can see if it hangs on Restore or Compile
dotnet restore --verbosity normal
dotnet build --no-incremental --verbosity normal

# echo "--- 🚀 STARTING APP ---"
# echo "Starting application interactively. Press Ctrl+C to stop."
# Runs the app directly so logs stream to the console instantly (no buffering)
# dotnet run --project TtrpgMessageApi --urls "https://localhost:7139;http://localhost:5000"
