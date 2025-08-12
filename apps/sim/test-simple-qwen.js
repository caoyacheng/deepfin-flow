const { env } = require('./lib/env');

async function testSimpleQwen() {
    console.log('🧪 Testing Qwen3-Embedding API with simple approach...\n');

    // Check environment variables
    const dashscopeApiKey = env.DASHSCOPE_API_KEY;
    if (!dashscopeApiKey) {
        console.log('❌ DASHSCOPE_API_KEY not configured');
        console.log('Please add DASHSCOPE_API_KEY to your .env file');
        return;
    }

    console.log('✅ DASHSCOPE_API_KEY found');

    // Test with very simple, short texts
    const testTexts = [
        'Hello world',
        'This is a test',
        'Simple text for testing'
    ];

    try {
        console.log('\n🚀 Testing with simple texts...');

        const requestBody = {
            model: 'text-embedding-v4',
            input: testTexts,
        };

        console.log('Request body:', JSON.stringify(requestBody, null, 2));

        const response = await fetch('https://dashscope.aliyuncs.com/api/v1/services/embeddings/text-embedding-v4/text-embedding', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${dashscopeApi_key}`,
                'Content-Type': 'application/json',
                'X-DashScope-SSE': 'disable',
            },
            body: JSON.stringify(requestBody),
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.log(`❌ API request failed: ${response.status} ${response.statusText}`);
            console.log(`Error details: ${errorText}`);
            return;
        }

        const data = await response.json();
        console.log('✅ API request successful!');
        console.log(`📊 Generated ${data.output.embeddings.length} embeddings`);

    } catch (error) {
        console.log('❌ Error during API test:', error.message);
    }
}

// Run the test
testSimpleQwen().catch(console.error);
