version=$(cat VERSION)

cd docs
VERSION=true jekyll build -d ../../marty-gh-pages/v/$version

cd ..