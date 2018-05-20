# oh-my-gitbash
Light & simple powerline theme for Git bash for windows

## Install:
I recommend the following:

```bash
cd $HOME
mkdir -p .bash/themes/git_bash_windows_powerline
git clone https://github.com/diesire/git_bash_windows_powerline.git .bash/themes/git_bash_windows_powerline
```
then add the following to your .bashrc:
```bash
# Theme
THEME=$HOME/.bash/themes/git_bash_windows_powerline/theme.bash
if [ -f $THEME ]; then
   . $THEME
fi
unset THEME
```

## Requisites
* In order for this theme to render correctly, you will need a
[Powerline-patched font](https://github.com/powerline/fonts).

## License
MIT

## Notes
Powerline安装之后也可能乱码，多修改几次gitbash的配置（字符集、UI Language等）就可以。

## ACK
这个配置是从[diesire/git_bash_windows_powerline](https://github.com/diesire/git_bash_windows_powerline)这个项目fork过来的，自己已经做了些修改，今后会根据需要定制。

感谢原作者提供的基础和思路。
