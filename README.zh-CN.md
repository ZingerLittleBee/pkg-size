Language : [🇺🇸 English](./README.md) | 🇨🇳 简体中文

<h1 align="center">pkg-size</h1>

## 概括

`pkg-size` 是一个统计 `package.json` 中依赖项 size 的 VSCode 插件 📦

## 特点

- 打包完之后 size
- gzip 压缩后 size
- 底部状态栏显示当前文件的大小
- 构建结果缓存

## 图示

`package.json`
![snapshot](snapshot/overview.png)

状态栏

![status](snapshot/status.png)

## 使用说明

### 一些依赖不会被构建

带有特定 loader 的依赖不会被构建

### 清除**当前** project 缓存

***点击状态栏图标***即可清除构建缓存
> 只会清除当前 project 所使用到的依赖缓存(如果有的话)

### 清除**所有**缓存

- `Linux` and `MacOS`: `rm -f ～/.pkg.size`
- `Windows`: 删除 `C:\Users\YouName\.pkg.size`

## 发行说明

### 1.0.0

- feat: 🎸 clear cache
- feat: 🎸 build info persistence
- feat: 🎸 file hash check
- feat: 🎸 parse deps


## 感谢

<a href="https://www.flaticon.com/free-icons/package" title="package icons">Package icons created by IconBaandar - Flaticon</a>

**Enjoy!**
