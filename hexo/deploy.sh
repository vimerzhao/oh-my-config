echo =================更新博客==================
git clone https://github.com/zhaoyu1995/zhaoyu1995.github.io.git .deploy/zhaoyu1995.github.io

hexo generate
cp -R public/* .deploy/zhaoyu1995.github.io
cd .deploy/zhaoyu1995.github.io
git add .
git commit -m $1
git push origin master

cd ..
cd ..
rm -rf .deploy

#由于配置文件多，无须每次更新，自己判断是否需要备份
if [ "$2"x != ""x ];then
echo =================备份配置==================
git clone https://github.com/zhaoyu1995/my-settings
# 备份的文件
cp -R -f source/* my-settings/hexo/source
cp -R -f _config.yml my-settings/hexo/
cp -R -f deploy.sh my-settings/hexo/
cp -R -f themes/next/_config.yml my-settings/hexo/themes
# 结束
cd my-settings/
git add .
git commit -m $2
git push origin master
cd..
rm -rf my-settings
else
	echo =================未备份配置=================
fi


