const axios = require('axios');

async function testAPI() {
  const messages = [
    {
      role: "user",
      content: "请围绕【Java程序设计】这门课程，结合大二学段、中级难度，生成3道练习题，格式要求：每道题包含question题目、answer答案，返回纯JSON数组，不要多余文字。"
    }
  ];

  console.log('发送的消息:', messages[0].content);

  try {
    const result = await axios.post(
      'https://api.deepseek.com/v1/chat/completions',
      {
        model: "deepseek-chat",
        messages: messages,
        temperature: 0.7
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.DEEPSEEK_API_KEY}`,
          "Content-Type": "application/json"
        },
        timeout: 30000
      }
    );
    const content = result.data.choices[0].message.content;
    console.log('\nAPI返回结果:');
    console.log(content);
  } catch (error) {
    console.error('接口调用失败：', error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
      console.error('Response status:', error.response.status);
    }
  }
}

testAPI();