version=$(cat VERSION)

mkdir -p tmp/doc-versions

#Copy the old versions of documentation for now
cp -r ../marty-gh-pages/v/ tmp/doc-versions

cd docs

jekyll build -d ../../marty-gh-pages
echo martyjs.org > ../../CNAME

# Copy the old versions back again
cp -r ../tmp/doc-versions/* ../../marty-gh-pages/v/
rm -rf ../tmp/doc-versions

VERSION=true jekyll build -d ../../marty-gh-pages/v/$version

cd ..