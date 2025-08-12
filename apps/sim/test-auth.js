// 测试用户认证状态的脚本
async function testAuth() {
    try {
        console.log('🔍 测试用户认证状态...');

        // 测试1: 检查当前页面是否有认证信息
        console.log('\n📋 当前页面认证信息:');
        console.log('- URL:', window.location.href);
        console.log('- Cookies:', document.cookie);

        // 测试2: 尝试获取用户信息
        console.log('\n👤 尝试获取用户信息...');
        try {
            const userResponse = await fetch('/api/auth/user', {
                method: 'GET',
                credentials: 'include'
            });

            if (userResponse.ok) {
                const userData = await userResponse.json();
                console.log('✅ 用户信息获取成功:', userData);
            } else {
                console.log('❌ 用户信息获取失败:', userResponse.status, userResponse.statusText);
            }
        } catch (error) {
            console.log('❌ 用户信息请求异常:', error.message);
        }

        // 测试3: 检查session状态
        console.log('\n🔐 检查session状态...');
        try {
            const sessionResponse = await fetch('/api/auth/session', {
                method: 'GET',
                credentials: 'include'
            });

            if (sessionResponse.ok) {
                const sessionData = await sessionResponse.json();
                console.log('✅ Session信息获取成功:', sessionData);
            } else {
                console.log('❌ Session信息获取失败:', sessionResponse.status, sessionResponse.statusText);
            }
        } catch (error) {
            console.log('❌ Session请求异常:', error.message);
        }

        // 测试4: 检查知识库访问权限
        console.log('\n📚 检查知识库访问权限...');
        const knowledgeBaseId = 'a54919fc-8f8f-4541-9544-09d9e2ac8181';

        try {
            const kbResponse = await fetch(`/api/knowledge/${knowledgeBaseId}`, {
                method: 'GET',
                credentials: 'include'
            });

            if (kbResponse.ok) {
                const kbData = await kbResponse.json();
                console.log('✅ 知识库访问成功:', kbData);
            } else {
                console.log('❌ 知识库访问失败:', kbResponse.status, kbResponse.statusText);
            }
        } catch (error) {
            console.log('❌ 知识库请求异常:', error.message);
        }

        console.log('\n🎯 认证测试完成！');

    } catch (error) {
        console.error('❌ 测试过程中发生错误:', error);
    }
}

// 运行测试
testAuth();
