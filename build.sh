#!/bin/bash

# Build script for Vercel deployment
# This ensures the React Router CLI is properly invoked

echo "🔧 Starting React Router build..."

# Make sure we're using the local node_modules
export PATH="./node_modules/.bin:$PATH"

# Run the React Router build command
echo "📦 Running react-router build..."
npx --yes @react-router/dev@latest build || exit 1

echo "✅ Build completed successfully!"
