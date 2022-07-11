Language : 🇺🇸 English | [🇨🇳 简体中文](./README.zh-CN.md)

<h1 align="center">PKG Size</h1>

<div align="center">

![Visual Studio Marketplace Downloads](https://img.shields.io/visual-studio-marketplace/d/zingerbee.pkg-size?style=flat-square)
![Visual Studio Marketplace Rating](https://img.shields.io/visual-studio-marketplace/r/zingerbee.pkg-size?style=flat-square)
![Visual Studio Marketplace Release Date](https://img.shields.io/visual-studio-marketplace/release-date/zingerbee.pkg-size?style=flat-square)
![Visual Studio Marketplace Version](https://img.shields.io/visual-studio-marketplace/v/zingerbee.pkg-size?style=flat-square)


</div>

## Overview

`PKG Size` is a VSCode plugin that statistics `package.json` dependencies size 📦

## Features

- Size after packing
- Size after gzip compression
- Show size of current file in bottom status bar
- Build result cache

## Snapshot

`package.json`
![snapshot](snapshot/overview.png)

Status bar

![status](snapshot/status.png)

## How to use

### Clear the **current** project cache

***Click the status bar icon*** to clear the build cache

or

```bash
# Open Command Palette (Command/Ctrl + Shift + P)
Rebuild Deps
```



> will only clear the dependency cache used by the current project (if any)

### Clear **all** cache

- `Linux` and `MacOS`: `rm -f ～/.pkg.size`
- `Windows`: delete `C:\Users\YouName\.pkg.size`

## Question asked frequently

### Some deps can't build

deps with specific loader will not builded

### Can I build backend myself

Yes

1. Deployment backend see [bundlephobia](https://github.com/pastelsky/bundlephobia)

2. Modify configuration file `${home}/.pkg-size` 的 `baseUrl`

```json
{
    "configs":{
        "baseUrl": "https://youdomain"
    }
}
```

### Can I implement the backend myself

Yes

```bash
GET /api/size/package=port-seletor@0.1.5

# return
data: {
    size: string
    gzip: string
}
```

## Release Notes

SEE [CHANGELOG](CHANGELOG.md)

## Thanks

<a href="https://www.flaticon.com/free-icons/package" title="package icons">Package icons created by IconBaandar - Flaticon</a>

build info from [bundlephobia](https://bundlephobia.com/)
