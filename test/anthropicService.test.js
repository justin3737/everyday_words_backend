// anthropicService.test.js

// 1. 首先 mock Anthropic SDK
jest.mock('@anthropic-ai/sdk', () => {
    // 返回一個類別的 mock
    return jest.fn().mockImplementation(() => ({
      messages: {
        create: jest.fn()
      }
    }));
  });
  
  const Anthropic = require('@anthropic-ai/sdk');
  
  describe('Anthropic API Tests', () => {
    let client;
    
    beforeEach(() => {
      // 清除所有 mock 的狀態
      jest.clearAllMocks();
      
      // 重設環境變數
      process.env.ANTHROPIC_API_KEY = 'test-api-key';
      
      // 建立新的 client 實例
      client = new Anthropic();
    });
  
    test('成功調用 API 時應該返回正確的回應', async () => {
      // 設置 mock 回應
      const mockResponse = { content: [{ text: 'API 回應內容' }] };
      client.messages.create.mockResolvedValue(mockResponse);
  
      // 導入實際的服務模組
      const { callAnthropicAPI } = require('../services/anthropicService');
  
      // 執行測試
      const result = await callAnthropicAPI('測試提示詞');
  
      // 驗證
      expect(client.messages.create).toHaveBeenCalledWith({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 1000,
        messages: [
          {
            role: 'user',
            content: '測試提示詞',
          }
        ],
        temperature: 0.7,
        stream: false,
      });
  
      expect(result).toBe('API 回應內容');
    });
  
    test('當 API 呼叫失敗時應該拋出錯誤', async () => {
      const errorMessage = 'API 錯誤';
      client.messages.create.mockRejectedValue(new Error(errorMessage));
  
      const { callAnthropicAPI } = require('../services/anthropicService');
      
      await expect(callAnthropicAPI('測試提示詞')).rejects.toThrow(errorMessage);
    });
  });