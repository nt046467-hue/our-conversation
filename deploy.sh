#!/bin/bash
# Quick deployment script for GitHub Pages

echo "🎉 Anniversary Webpage - Quick Deploy Helper"
echo "=============================================="
echo ""

# Check if git is installed
if ! command -v git &> /dev/null; then
    echo "❌ Git not found. Please install Git first:"
    echo "   https://git-scm.com/download"
    exit 1
fi

echo "✅ Git found"
echo ""

# Check if we're in a git repository
if [ ! -d ".git" ]; then
    echo "📍 Not in a git repository. Initializing..."
    git init
    git branch -M main

    read -p "Enter your GitHub repository URL (https://github.com/...): " REPO_URL

    if [ -z "$REPO_URL" ]; then
        echo "❌ Repository URL is required"
        exit 1
    fi

    git remote add origin "$REPO_URL"
    echo "✅ Repository configured"
else
    echo "✅ Already in a git repository"
fi

echo ""
echo "📝 Staging files..."
git add lovechat.html README.md DEPLOYMENT.md .gitignore 2>/dev/null
git add . 2>/dev/null

echo "📦 Creating commit..."
read -p "Commit message (default: 'Update anniversary app'): " COMMIT_MSG
COMMIT_MSG=${COMMIT_MSG:-"Update anniversary app"}

git commit -m "$COMMIT_MSG" || echo "⚠️  Nothing new to commit"

echo ""
echo "📤 Pushing to GitHub..."
git push -u origin main

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Successfully pushed to GitHub!"
    echo ""
    echo "🎊 Your app should be live at:"
    echo "   https://YOUR_USERNAME.github.io/anniversary-webpage/lovechat.html"
    echo ""
    echo "📝 Note: Replace YOUR_USERNAME with your GitHub username"
    echo "⏱️  It may take 1-2 minutes to deploy"
else
    echo "❌ Push failed. Make sure your repository URL is correct."
    echo "   Check: git remote -v"
fi

echo ""
echo "💾 Need help? Check DEPLOYMENT.md for detailed instructions"
