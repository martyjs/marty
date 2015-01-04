if [[ -n $(git status --porcelain) ]];
then
  echo "repo is dirty. please commit before releasing";
  exit 1;
fi

echo "updating version"
version="$(node build/updateVersion.js)"

echo "building v$version"
make build

echo "commiting source"
git add -A
git commit -m "v$version"

echo "creating tag v$version"
git tag v$version
git push origin master
git push origin --tags

echo "publishing to NPM"
npm publish