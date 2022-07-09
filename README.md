Language : 🇺🇸 English | [🇨🇳 简体中文](./README.zh-CN.md)

<h1 align="center">pkg-size</h1>

## Overview

`pkg-size` is a VSCode plugin that statistical`package.json` dependencies size 📦

## Features

- Size after packing
- Size after gzip compression
- The bottom status bar shows the size of the current file
- Build result cache

## Snapshot

`package.json`
![snapshot](snapshot/overview.png)

Status bar

![status](snapshot/status.png)

## Instructions for use

### Some deps can't build

deps with specific loader will not builded

### Clear the **current** project cache

***Click the status bar icon*** to clear the build cache
> will only clear the dependency cache used by the current project (if any)

### Clear **all** cache

- `Linux` and `MacOS`: `rm -f ～/.pkg.size`
- `Windows`: delete `C:\Users\YouName\.pkg.size`

## Release Notes

### 1.0.0

- feat: 🎸 clear cache
- feat: 🎸 build info persistence
- feat: 🎸 file hash check
- feat: 🎸 parse deps

**Enjoy!**
