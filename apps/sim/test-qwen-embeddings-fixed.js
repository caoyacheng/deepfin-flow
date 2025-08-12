const { env } = require('./lib/env');

async function testQwenEmbeddings() {
    console.log('🧪 Testing Qwen3-Embedding API integration (Fixed)...\n');

    // Check environment variables
    const dashscopeApiKey = env.DASHSCOPE_API_KEY;
    if (!dashscopeApiKey) {
        console.log('❌ DASHSCOPE_API_KEY not configured');
        console.log('Please add DASHSCOPE_API_KEY to your .env file');
        return;
    }

    console.log('✅ DASHSCOPE_API_KEY found');
    console.log(`📝 API Key: ${dashscopeApiKey.substring(0, 8)}...`);

    // Test with different text types to simulate real usage
    const testTexts = [
        'Hello world', // Short text
        'This is a test document with some content that should work fine with the API.', // Medium text
        'A'.repeat(5000) + 'B'.repeat(3000), // Long text (8000 chars)
        'Text with special chars: \n\r\t=+*&^%$#@!', // Special characters
    ];

    try {
        console.log('\n🚀 Testing embedding generation...');
        console.log('📝 Test texts:');
        testTexts.forEach((text, i) => {
            console.log(`   ${i + 1}. Length: ${text.length} chars`);
            console.log(`      Preview: "${text.substring(0, 50)}${text.length > 50 ? '...' : ''}"`);
        });

        // Clean and validate texts (same logic as in the fixed code)
        const cleanedBatch = testTexts.map((text) => {
            if (typeof text !== "string") {
                return String(text);
            }

            // Clean the text: remove null bytes, normalize whitespace, limit length
            let cleaned = text
                .replace(/\0/g, "") // Remove null bytes
                .replace(/\r\n/g, "\n") // Normalize line endings
                .replace(/\r/g, "\n") // Normalize line endings
                .trim();

            // Limit text length to 8000 characters (Qwen API limit)
            if (cleaned.length > 8000) {
                console.log(`⚠️  Text ${testTexts.indexOf(text) + 1} too long (${cleaned.length} chars), truncating to 8000 chars`);
                cleaned = cleaned.substring(0, 8000) + "...";
            }

            return cleaned;
        }).filter((text) => text.length > 0);

        console.log(`\n🧹 After cleaning: ${cleanedBatch.length} texts`);
        cleanedBatch.forEach((text, i) => {
            console.log(`   ${i + 1}. Length: ${text.length} chars`);
        });

        // Prepare request body
        const requestBody = {
            model: 'text-embedding-v4',
            input: cleanedBatch,
        };

        // Validate JSON serialization
        let requestBodyJson;
        try {
            requestBodyJson = JSON.stringify(requestBody);
            console.log(`✅ JSON serialization successful, length: ${requestBodyJson.length} chars`);
        } catch (jsonError) {
            console.log('❌ JSON serialization failed:', jsonError.message);
            return;
        }

        console.log('\n📤 Sending request to Qwen3-Embedding API...');

        const response = await fetch('https://dashscope.aliyuncs.com/api/v1/services/embeddings/text-embedding-v4/text-embedding', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${dashscopeApiKey}`,
                'Content-Type': 'application/json',
                'X-DashScope-SSE': 'disable',
            },
            body: requestBodyJson,
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.log(`❌ API request failed: ${response.status} ${response.statusText}`);
            console.log(`Error details: ${errorText}`);

            // Try to parse error response
            try {
                const errorData = JSON.parse(errorText);
                console.log('🔍 Parsed error response:');
                console.log(`   Code: ${errorData.code}`);
                console.log(`   Message: ${errorData.message}`);
                console.log(`   Request ID: ${errorData.request_id}`);
            } catch (e) {
                console.log('⚠️  Could not parse error response as JSON');
            }
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
        console.log(`Text: "${cleanedBatch[0].substring(0, 50)}..."`);
        console.log(`Vector: [${firstEmbedding.embedding.slice(0, 5).join(', ')}...]`);

    } catch (error) {
        console.log('❌ Error during API test:', error.message);
        console.log('Stack trace:', error.stack);
    }
}

// Run the test
testQwenEmbeddings().catch(console.error);
