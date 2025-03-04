# 約會備忘錄 (Dating Memo)

一個有趣的行動優先的Web應用程式，用於記錄和管理約會對象的資訊和特質。

## 功能特點

- 📝 記錄約會對象的基本資訊（姓名、年齡、職業等）
- 🏷️ 添加特質標籤（優點、缺點、性格特點）
- ⭐ 對約會對象進行評分
- 🔍 搜尋和篩選約會對象
- 📱 行動優先設計，響應式介面
- 🌙 支援深色模式
- 💾 資料儲存在本地儲存中，無需後端伺服器

## 技術棧

- [Next.js](https://nextjs.org/) - React框架
- [TypeScript](https://www.typescriptlang.org/) - 型別安全
- [Tailwind CSS](https://tailwindcss.com/) - 樣式
- [React Hook Form](https://react-hook-form.com/) - 表單處理
- [Zod](https://github.com/colinhacks/zod) - 資料驗證
- [React Icons](https://react-icons.github.io/react-icons/) - 圖示

## 開始使用

### 安裝相依套件

```bash
npm install
```

### 開發模式執行

```bash
npm run dev
```

開啟 [http://localhost:3000](http://localhost:3000) 查看應用程式。

### 建置生產版本

```bash
npm run build
```

### 執行生產版本

```bash
npm start
```

## 使用說明

1. 點擊「新增約會對象」按鈕建立新的約會對象
2. 填寫基本資訊、選擇標籤並提交表單
3. 點擊卡片查看詳細資訊
4. 在詳情頁面可以編輯或刪除約會對象
5. 使用搜尋框搜尋約會對象
6. 使用排序按鈕更改排序方式

## 資料儲存

所有資料都儲存在瀏覽器的本地儲存中，不會上傳到任何伺服器。這意味著：

- 資料在瀏覽器關閉後仍然保留
- 資料在清除瀏覽器資料時會被刪除
- 資料不會在不同裝置間同步

## 隱私

由於所有資料都儲存在本地，您的約會記錄完全是私密的，只有您能看到。

## 授權條款

MIT
