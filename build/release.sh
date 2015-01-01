if [[ -n $(git status --porcelain) ]];
then
  echo "repo is dirty. please commit before releasing";
  exit 1;
fi

version="$(node build/updateVersion.js)"
make build
git add -A
git commit -m "v$version"
git tag $version