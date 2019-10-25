#!/usr/bin/env sh

# 确保脚本抛出遇到的错误
set -e

# git push -f "https://${access_token}@github.com/muzi131313/axios-pro.git" master:master

# 生成静态文件
npm run build

# 提交生成的文件
git add .
git commit -m 'deploy'

git push -f "https://${access_token}@github.com/muzi131313/axios-pro.git" master:master
