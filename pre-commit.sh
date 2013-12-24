#!/bin/sh

grunt dist
RESULT=$?
[ $RESULT -ne 0 ] && exit 1

git add --all dist
exit 0