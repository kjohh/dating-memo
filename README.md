# 约会备忘录 (Dating Memo)

一个有趣的移动优先的Web应用，用于记录和管理约会对象的信息和特质。

## 功能特点

- 📝 记录约会对象的基本信息（姓名、年龄、职业等）
- 🏷️ 添加特质标签（优点、缺点、性格特点）
- ⭐ 对约会对象进行评分
- 🔍 搜索和筛选约会对象
- 📱 移动优先设计，响应式界面
- 🌙 支持深色模式
- 💾 数据保存在本地存储中，无需后端服务器

## 技术栈

- [Next.js](https://nextjs.org/) - React框架
- [TypeScript](https://www.typescriptlang.org/) - 类型安全
- [Tailwind CSS](https://tailwindcss.com/) - 样式
- [React Hook Form](https://react-hook-form.com/) - 表单处理
- [Zod](https://github.com/colinhacks/zod) - 数据验证
- [React Icons](https://react-icons.github.io/react-icons/) - 图标

## 开始使用

### 安装依赖

```bash
npm install
```

### 开发模式运行

```bash
npm run dev
```

打开 [http://localhost:3000](http://localhost:3000) 查看应用。

### 构建生产版本

```bash
npm run build
```

### 运行生产版本

```bash
npm start
```

## 使用说明

1. 点击"添加新对象"按钮创建新的约会对象
2. 填写基本信息、选择标签并提交表单
3. 点击卡片查看详细信息
4. 在详情页面可以编辑或删除约会对象
5. 使用搜索框搜索约会对象
6. 使用排序按钮更改排序方式

## 数据存储

所有数据都存储在浏览器的本地存储中，不会上传到任何服务器。这意味着：

- 数据在浏览器关闭后仍然保留
- 数据在清除浏览器数据时会被删除
- 数据不会在不同设备间同步

## 隐私

由于所有数据都存储在本地，您的约会记录完全是私密的，只有您能看到。

## 许可证

MIT
