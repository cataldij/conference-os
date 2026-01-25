#!/bin/bash

# Conference OS Setup Script
# This script automates the initial setup process

set -e

echo "🎯 Conference OS Setup"
echo "======================"
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

echo "✓ Node.js version: $(node -v)"

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

echo "✓ npm version: $(npm -v)"
echo ""

# Install dependencies
echo "📦 Installing dependencies..."
npm install
echo "✓ Dependencies installed"
echo ""

# Check if .env.local exists
if [ ! -f ".env.local" ]; then
    echo "⚠️  No .env.local file found"
    echo "📝 Creating .env.local from .env.example..."
    cp .env.example .env.local
    echo "✓ Created .env.local"
    echo ""
    echo "⚠️  IMPORTANT: Please edit .env.local and add your API keys"
    echo ""
fi

# Check if Supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    echo "📦 Installing Supabase CLI..."
    npm install -g supabase
    echo "✓ Supabase CLI installed"
else
    echo "✓ Supabase CLI already installed"
fi
echo ""

# Ask if user wants to start local Supabase
echo "🤔 Do you want to start local Supabase? (y/n)"
read -r start_supabase

if [ "$start_supabase" = "y" ]; then
    echo "🚀 Starting Supabase..."

    # Check if Docker is running
    if ! docker info > /dev/null 2>&1; then
        echo "❌ Docker is not running. Please start Docker first."
        echo "   Then run: npx supabase start"
        exit 1
    fi

    # Initialize Supabase if not already initialized
    if [ ! -f "supabase/config.toml" ]; then
        echo "Initializing Supabase..."
        npx supabase init
    fi

    # Start Supabase
    npx supabase start
    echo "✓ Supabase started"
    echo ""

    # Run migrations
    echo "📊 Running database migrations..."
    npx supabase db push
    echo "✓ Migrations completed"
    echo ""

    # Ask about seed data
    echo "🤔 Do you want to load seed data? (y/n)"
    read -r load_seed

    if [ "$load_seed" = "y" ]; then
        echo "🌱 Loading seed data..."
        psql postgresql://postgres:postgres@localhost:54322/postgres < supabase/seed.sql
        echo "✓ Seed data loaded"
        echo ""
    fi
fi

echo "✅ Setup Complete!"
echo ""
echo "Next steps:"
echo "1. Edit .env.local and add your API keys"
echo "2. Start the development server:"
echo "   - Mobile: cd apps/mobile && npm run dev"
echo "   - Web: cd apps/web && npm run dev"
echo "   - All: npm run dev"
echo ""
echo "3. Visit the web dashboard at http://localhost:3000"
echo "4. Scan the QR code to open the mobile app"
echo ""
echo "📖 Documentation: https://github.com/yourusername/conference-os"
echo "💬 Support: support@conferenceoscmd"
echo ""
echo "Happy coding! 🚀"
