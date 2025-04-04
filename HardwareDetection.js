(function () {
    // 创建 Web Worker 的代码内容
    const workerCode = `
        importScripts('https://cdnjs.cloudflare.com/ajax/libs/decimal.js/10.4.3/decimal.min.js');

        function calculatePi() {
            Decimal.precision = 10000;
            let pi = new Decimal(0);
            let k = new Decimal(0);
            
            // 使用Chudnovsky算法计算圆周率
            while (k.lessThan(1000)) {
                let term = new Decimal(-1).pow(k)
                    .mul(factorial(6 * k))
                    .mul(13591409 + 545140134 * k)
                    .div(factorial(3 * k))
                    .div(factorial(k).pow(3))
                    .div(new Decimal(640320).pow(3 * k));
                
                pi = pi.add(term);
                
                if (k.mod(10).equals(0)) {
                    postMessage({
                        type: 'progress',
                        progress: k.div(1000).mul(100).toNumber(),
                        currentPi: pi.toString().substring(0, 20) + "..."
                    });
                }
                k = k.add(1);
            }
            
            pi = new Decimal(426880).mul(new Decimal(10005).sqrt()).div(pi);
            return pi.toString();
        }

        function factorial(n) {
            let result = new Decimal(1);
            for (let i = 2; i <= n; i++) {
                result = result.mul(i);
            }
            return result;
        }

        const startTime = Date.now();
        const result = calculatePi();
        const endTime = Date.now();
        const timeTaken = (endTime - startTime) / 1000;

        postMessage({
            type: 'complete',
            result: result,
            timeTaken: timeTaken,
            score: Math.round(1000000 / timeTaken)
        });
    `;

    // 创建 Blob 对象
    const blob = new Blob([workerCode], { type: 'application/javascript' });
    const workerUrl = URL.createObjectURL(blob);
    const worker = new Worker(workerUrl);

    // 监听 Worker 消息
    worker.onmessage = function (e) {
        if (e.data.type === 'progress') {
            console.log(`计算进度: ${e.data.progress.toFixed(2)}%`);
            console.log(`当前计算值: ${e.data.currentPi}`);
        } else if (e.data.type === 'complete') {
            console.log('计算完成！');
            console.log(`计算用时: ${e.data.timeTaken.toFixed(2)}秒`);
            console.log(`性能得分: ${e.data.score}`);
            console.log(`圆周率(10000位): ${e.data.result}`);
            URL.revokeObjectURL(workerUrl);
        }
    };

    // 错误处理
    worker.onerror = function (error) {
        console.error('计算过程出错:', error);
        URL.revokeObjectURL(workerUrl);
    };
})();