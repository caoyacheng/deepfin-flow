const { env } = require('./lib/env');

async function testQwenEmbeddings() {
    console.log('🧪 Testing Qwen3-Embedding API integration...\n');

    // Check environment variables
    const dashscopeApiKey = env.DASHSCOPE_API_KEY;
    if (!dashscopeApiKey) {
        console.log('❌ DASHSCOPE_API_KEY not configured');
        console.log('Please add DASHSCOPE_API_KEY to your .env file');
        return;
    }

    console.log('✅ DASHSCOPE_API_KEY found');
    console.log(`�� API Key: ${dashscopeApiKey.substring(0, 8)}...`);

    // Test API endpoint
    const testTexts = ['Hello world', 'This is a test', 'Qwen3-Embedding integration'];

    try {
        console.log('\n🚀 Testing embedding generation...');

        const response = await fetch('https://dashscope.aliyuncs.com/api/v1/services/embeddings/text-embedding-v4/text-embedding', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${dashscopeApiKey}`,
                'Bearer ${dashscopeApiKey}`,
        'Content-Type': 'application/json',
                'X-DashScope-SSE': 'disable',
            },
            body: JSON.stringify({
                model: 'text-embedding-v4',
                input: testTexts,
                parameters: {
                    text_type: 'query',
                    truncation: 'NONE',
                },
            }),
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
        console.log(`🔢 Each embedding has ${data.output.embeddings[0].embedding.length} dimensions`);
        console.log(`💰 Token usage: ${data.usage.total_tokens}`);

        // Test the first embedding
        const firstEmbedding = data.output.embeddings[0];
        console.log('\n📝 First embedding sample:');
        console.log(`Text: "${testTexts[0]}"`);
        console.log(`Vector: [${firstEmbedding.embedding.slice(0, 0, 5).join(', ')}...]`);

    } catch (error) {
        console.log('❌ Error during API test:', error.message);
    }
}

// Run the test
testQwenEmbeddings().catch(console.error);
