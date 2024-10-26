// services/anthropicService.js

const Anthropic = require('@anthropic-ai/sdk');
require('dotenv').config();

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY
});

async function callAnthropicAPI(prompt) {
  try {
    const response = await client.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 1000,
      messages: [
        {
          role: 'user',
          content: prompt,
        }
      ],
      temperature: 0.7,
      stream: false,
    });

    return response.content[0].text;
  } catch (error) {
    console.error('API 呼叫錯誤:', error);
    throw error;
  }
}

module.exports = {
  callAnthropicAPI
};