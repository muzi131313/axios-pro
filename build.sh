#!/usr/bin/env sh

# 确保脚本抛出遇到的错误
set -e

# 更新代码
# git pull origin master
rm -Rf dist
git add .
git commit -m 'remove dist'

git push -f "https://${access_token}@github.com/muzi131313/axios-pro.git" master:master

# 生成静态文件
npm run build

# 提交生成的文件
git add .
git commit -m 'deploy'

git push -f "https://${access_token}@github.com/muzi131313/axios-pro.git" master:master
