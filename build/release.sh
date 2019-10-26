#!/usr/bin/env sh

# 确保脚本抛出遇到的错误
set -e

# 缓存构建后的文件
git stash

# 切换到master分支
git checkout master

# 缓存文件弹出-构建文件
git stash pop

# 生成静态文件
# npm run build

# 提交生成的文件
git add .
git commit -m 'build & release'

git push -f "https://${access_token}@github.com/muzi131313/axios-pro.git" master:master
