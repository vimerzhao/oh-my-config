git clone https://github.com/zhaoyu1995/zhaoyu1995.github.io.git .deploy/zhaoyu1995.github.io

hexo generate
cp -R public/* .deploy/zhaoyu1995.github.io
cd .deploy/zhaoyu1995.github.io
git add .
git commit -m $1
git push origin master



cd ..
git clone https://github.com/zhaoyu1995/my-settings
cd my-settings/hexo
