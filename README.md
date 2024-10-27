# 如何使用此 repository：
- 前端UI 請搭配 https://github.com/justin3737/everyday_words/
- 本地端測試 分支請使用 dev

## Stack
- Node.js
- Express
- MongoDB
- Mongoose
- MongoDB Atlas

---

## JSON data base 導入MongoDB

這個項目包含了兩個 json data base導入腳本，用於將筆記和詞彙數據導入到 MongoDB 數據庫中。

## 前置條件

在運行腳本之前，請確保你已經：

1. 安裝了 Node.js
2. 安裝了項目依賴（運行 `npm install`）
3. 設置了 MongoDB 連接 URI 環境變量（`MONGODB_URI`）
4. 準備好了要導入的 JSON 文件（`note.json` 和 `b2vocabulary.json`）

## 設置環境變量

在運行腳本之前，請確保設置了 `MONGODB_URI` 環境變量。你可以在終端中使用以下命令（根據你的操作系統和 shell 可能有所不同）：

```bash
export MONGODB_URI="your_mongodb_connection_string_here"
```

或者，你可以創建一個 `.env` 文件在項目根目錄，並添加以下內容：

```bash
MONGODB_URI=your_mongodb_connection_string_here
```

## 運行腳本

### 導入筆記

要導入筆記數據，請運行：

```bash
node scripts/importNotes.js
```

### 導入詞彙

要導入詞彙數據，請運行：

```bash
node scripts/importVocabulary.js
```


### 一次性導入所有數據

如果你想一次性導入所有數據，你可以運行：

```bash
node scripts/importAll.js
```


這將依次執行筆記和詞彙的導入腳本。

## 注意事項

- 確保在運行腳本之前，JSON 文件（`note.json` 和 `b2vocabulary.json`）位於正確的位置。
- 這些腳本會先清空相應的集合，然後再插入新數據。請確保你不會意外刪除重要的現有數據。
- 如果遇到任何錯誤，請檢查控制台輸出以獲取更多信息。

## 故障排除

如果你遇到問題：

1. 確保所有依賴都已正確安裝（`npm install`）
2. 檢查 MongoDB 連接字符串是否正確
3. 確保 JSON 文件格式正確且位於指定的位置
4. 檢查是否有足夠的權限訪問數據庫和文件系統

如果問題仍然存在，請查看錯誤消息並相應地調試代碼。