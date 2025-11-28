#!/bin/bash

# Exit immediately if a command exits with a non-zero status
set -e

echo "🚀 Starting Environment Setup for .NET 8 and Angular..."

# ==========================================
# 1. Update System & Install Prerequisites
# ==========================================
echo "📦 Updating package lists and installing prerequisites..."
# Check if sudo is available (some containers run as root without sudo)
if command -v sudo &> /dev/null; then
    SUDO="sudo"
else
    SUDO=""
fi

$SUDO apt-get update
$SUDO apt-get install -y curl wget libicu-dev build-essential

# ==========================================
# 2. Install .NET 8 SDK
# ==========================================
echo "bg Installing .NET 8 SDK..."

# We use the official install script which is distro-agnostic and more reliable for agents
wget https://dot.net/v1/dotnet-install.sh -O dotnet-install.sh
chmod +x ./dotnet-install.sh

# Install to the default location (~/.dotnet)
./dotnet-install.sh --channel 8.0 --quality GA

# CLEANUP
rm dotnet-install.sh

# CONFIGURATION: Export PATH so it is usable immediately in this session
# Note: For persistent user sessions, you would usually add this to .bashrc, 
# but for agents, we usually just need it for the current build script.
export DOTNET_ROOT=$HOME/.dotnet
export PATH=$PATH:$DOTNET_ROOT:$DOTNET_ROOT/tools

# Verify .NET installation
echo "✅ Verifying .NET installation..."
dotnet --version

# ==========================================
# 3. Install Node.js (LTS v20) & NPM
# ==========================================
echo "🟢 Installing Node.js 20 (LTS)..."

# Using NodeSource repository for up-to-date Node versions (Default apt is often too old)
curl -fsSL https://deb.nodesource.com/setup_20.x | $SUDO -E bash -
$SUDO apt-get install -y nodejs

# Verify Node installation
node -v
npm -v

# ==========================================
# 4. Install Angular CLI
# ==========================================
echo "🅰️ Installing Angular CLI..."

# Install globally
$SUDO npm install -g @angular/cli

# Verify Angular installation
ng version

echo "🎉 Environment Setup Complete!"
echo "You can now run 'dotnet build' or 'ng build'."