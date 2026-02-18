#!/bin/bash

echo "🌱 EcoTrip Calculator - Setup Script"
echo "====================================="
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check Node.js
echo "Checking Node.js installation..."
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js is not installed${NC}"
    echo "Please install Node.js from https://nodejs.org/"
    exit 1
else
    echo -e "${GREEN}✅ Node.js $(node --version) found${NC}"
fi

# Check npm
if ! command -v npm &> /dev/null; then
    echo -e "${RED}❌ npm is not installed${NC}"
    exit 1
else
    echo -e "${GREEN}✅ npm $(npm --version) found${NC}"
fi

echo ""
echo "Installing dependencies..."
echo ""

# Install backend dependencies
echo -e "${YELLOW}📦 Installing backend dependencies...${NC}"
cd backend
npm install
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Backend dependencies installed${NC}"
else
    echo -e "${RED}❌ Failed to install backend dependencies${NC}"
    exit 1
fi

echo ""

# Install frontend dependencies
echo -e "${YELLOW}📦 Installing frontend dependencies...${NC}"
cd ../frontend
npm install
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Frontend dependencies installed${NC}"
else
    echo -e "${RED}❌ Failed to install frontend dependencies${NC}"
    exit 1
fi

cd ..

echo ""
echo "Running tests..."
echo ""

# Test backend
echo -e "${YELLOW}🧪 Running backend tests...${NC}"
cd backend
npm test
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Backend tests passed${NC}"
else
    echo -e "${RED}❌ Backend tests failed${NC}"
fi

echo ""

# Test frontend
echo -e "${YELLOW}🧪 Running frontend tests...${NC}"
cd ../frontend
npm test
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Frontend tests passed${NC}"
else
    echo -e "${RED}❌ Frontend tests failed${NC}"
fi

cd ..

echo ""
echo -e "${GREEN}✅ Setup complete!${NC}"
echo ""
echo "Next steps:"
echo "1. Start the backend: cd backend && npm start"
echo "2. Build the frontend: cd frontend && npm run build"
echo "3. Serve the frontend: npx http-server frontend/dist -p 8080"
echo ""
echo "📚 Read INSTRUCTIONS.md for training guidance"
echo "🎯 Read EXERCISES.md for student exercises"
echo ""
echo "⚠️  Remember: This code is intentionally bad for educational purposes!"
echo ""
