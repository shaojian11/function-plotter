# function-plotter
函数图像绘制工具 - 支持多种数学函数

## 移动端应用说明
本仓库已初始化为一个 React Native + Expo 应用，用于在 Android / iPhone 上绘制数学函数图像。

## 功能
- 输入函数表达式
- 实时绘制坐标轴和函数曲线
- 支持常见数学函数：sin、cos、tan、sqrt、log、exp
- 内置示例公式

## 运行方式
1. 安装依赖：
   ```bash
   npm install
   ```
2. 启动开发服务器：
   ```bash
   npx expo start
   ```
3. 使用 Expo Go 扫码运行，或者在 Android / iOS 模拟器中打开。

## 示例公式
- `sin(x)`
- `x^2`
- `cos(x)`
- `sqrt(x^2 + 1)`
- `sin(x) + cos(x)`

## 说明
如果你要在手机端真正打包安装，需要在本地安装 Expo 和对应原生环境（Android Studio / Xcode）。
