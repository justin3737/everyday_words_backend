const Anthropic = require('@anthropic-ai/sdk');
require('dotenv').config();

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY
});

async function callAnthropicAPI(prompt) {
  const response = await anthropic.beta.messages.create({
    model: 'claude-3-sonnet-20240229',
    max_tokens: 1000,
    messages: [{ role: 'user', content: prompt }],
    stream: false
  });

  return response.content[0].text;
}

module.exports = {
  callAnthropicAPI
};
