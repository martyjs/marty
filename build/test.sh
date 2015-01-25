if [ -f tmp/mock-server.pid ];
then
  kill $(cat tmp/mock-server.pid) > /dev/null
  rm -f tmp/mock-server.pid
else
  mkdir -p tmp
fi

node test/lib/mockServer &
echo $! > tmp/mock-server.pid
node_modules/.bin/karma start --single-run

if [ -f tmp/mock-server.pid ];
then
  kill $(cat tmp/mock-server.pid) > /dev/null
  rm -f tmp/mock-server.pid
fi