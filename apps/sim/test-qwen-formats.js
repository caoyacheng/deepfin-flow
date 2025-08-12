// Simple test script for Qwen API formats
require('dotenv').config();

async function testQwenFormats() {
    console.log('🧪 Testing different Qwen3-Embedding API formats...\n');

    // Check environment variables
    const dashscopeApiKey = process.env.DASHSCOPE_API_KEY;
    if (!dashscopeApiKey) {
        console.log('❌ DASHSCOPE_API_KEY not configured');
        console.log('Please add DASHSCOPE_API_KEY to your .env file');
        return;
    }

    console.log('✅ DASHSCOPE_API_KEY found');

    // Test with simple, short texts
    const testTexts = [
        'Hello world',
        'This is a test',
        'Simple text for testing'
    ];

    // Test different API formats
    const testFormats = [
        {
            name: 'Standard Qwen API',
            url: 'https://dashscope.aliyuncs.com/api/v1/services/embeddings/text-embedding-v4/text-embedding',
            headers: {
                'Authorization': `Bearer ${dashscopeApiKey}`,
                'Content-Type': 'application/json',
                'X-DashScope-SSE': 'disable',
            },
            body: {
                model: 'text-embedding-v4',
                input: testTexts,
            }
        },
        {
            name: 'Alternative Format',
            url: 'https://dashscope.aliyuncs.com/api/v1/services/embeddings/text-embedding-v4/text-embedding',
            headers: {
                'Authorization': `Bearer ${dashscopeApiKey}`,
                'Content-Type': 'application/json',
                'X-DashScope-SSE': 'disable',
            },
            body: {
                model: 'text-embedding-v4',
                input: testTexts.map(text => text.substring(0, 100)),
            }
        },
        {
            name: 'Compatible Mode',
            url: 'https://dashscope.aliyuncs.com/compatible-mode/v1/embeddings',
            headers: {
                'Authorization': `Bearer ${dashscopeApiKey}`,
                'Content-Type': 'application/json',
            },
            body: {
                model: 'text-embedding-v4',
                input: testTexts,
            }
        }
    ];

    for (const format of testFormats) {
        try {
            console.log(`\n🚀 Testing: ${format.name}`);
            console.log(`URL: ${format.url}`);
            console.log('Request body:', JSON.stringify(format.body, null, 2));

            const response = await fetch(format.url, {
                method: 'POST',
                headers: format.headers,
                body: JSON.stringify(format.body),
            });

            if (response.ok) {
                const data = await response.json();
                console.log(`✅ ${format.name} successful!`);
                console.log(`📊 Response: ${JSON.stringify(data, null, 2)}`);
                break; // Stop on first success
            } else {
                const errorText = await response.text();
                console.log(`❌ ${format.name} failed: ${response.status} ${response.statusText}`);
                console.log(`Error details: ${errorText}`);
            }

        } catch (error) {
            console.log(`❌ ${format.name} error: ${error.message}`);
        }
    }
}

// Run the test
testQwenFormats().catch(console.error);
