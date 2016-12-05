---
title: 我的第一篇博客
date: 2016-08-17 23:46:34
categories: 
  - 随笔
tags:
  - 博客
---

&emsp;&emsp;今天，花了将近一天的时间终于成功地搭建了自己在github上的博客。写下这篇博文作为自己的第一篇博客，主要是整理一下参考的文档，作一记录。
<!--more-->

# 资料整理
- [手把手教你使用Hexo + Github Pages搭建个人独立博客](http://jiji262.github.io/2016/04/15/2016-04-15-hexo-github-pages-blog/)。环境搭建的大部分工作以及如何部署等都是参照这篇博客完成的，没有这篇博客不可能如此顺利。此外，博主的自定义脚本方法让我部署博客方便了不少！十分有用。贴出自己修改后的脚本：

``` bash
git clone https://github.com/zhaoyu1995/zhaoyu1995.github.io.git .deploy/zhaoyu1995.github.io

hexo generate
cp -R public/* .deploy/zhaoyu1995.github.io
cd .deploy/zhaoyu1995.github.io
git add .
git commit -m “update”
git push origin master
```

- [更新hexo,成功了,但是hexo deploy/generate 命令都用不了,显示没有 #1719](https://github.com/hexojs/hexo/issues/1719)。在搭建过程中遇到了了一个**命令失效**的问题，参照这个网页稀里糊涂解决了。
- [使用 Github Pages + Hexo + 多说 搭建博客全过程 - 基础篇](http://kiya.space/2015/11/10/use-Github-Pages-Hexo-duoshuo-to-set-up-a-blog-basic-steps/)。这篇博客是一个很好地补充，讲的都是基本的配置。
- [使用Hexo搭建个人博客(基于hexo3.0)](http://opiece.me/2015/04/09/hexo-guide/)。查找如何添加博客参照的正是这篇文章。
- [Hexo官网](https://hexo.io/zh-cn/)。权威的参考。
- [Hexo系列教程之三：next主题的配置和优化](http://blog.csdn.net/willxue123/article/details/50994852)在配置博客主题时解决了我的很多问题。
- [如何生成SSH key](http://www.jianshu.com/p/31cbbbc5f9fa/)。基本问题。
- [hexo 下的分类和表签无法显示，怎么解决?](https://www.zhihu.com/question/29017171)。解决这个问题也花了不少时间。
- [精于心，简于形](http://theme-next.iissnan.com/)。next主题的官网，参照其文档，完成了博客的大多数功能设置。

# 总结
&emsp;&emsp;虽然成功搭建了自己的博客，但是很多问题都没有很透彻的理解，博客的美化做的也很差。诸如网站统计、访客统计、hexo等许多东西都是第一次接触，还是要有意识的多学习一些这方面(前端、Git、Hexo等)的知识，以免书到用时方恨少！
&emsp;&emsp;*Good night!*