version=$(cat VERSION)

mkdir -p tmp/doc-versions

#Copy the old versions of documentation for now

cd docs

cp -r ../../marty-gh-pages/v/ ../tmp/doc-versions
jekyll build -d ../../marty-gh-pages

# Copy the old versions back again
mkdir ../../marty-gh-pages/v/
cp -r ../tmp/doc-versions/* ../../marty-gh-pages/v/
rm -rf ../tmp/doc-versions
echo martyjs.org > ../../marty-gh-pages/CNAME

VERSION=true jekyll build -d ../../marty-gh-pages/v/$version

cd ..