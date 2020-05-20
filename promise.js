const fs = require('fs')

const size = (fileName) => {
    return new Promise((resolve, reject) => {
        fs.stat(fileName, function(err, value) {
            if(err) {
                reject(err)
            }else {
                resolve(value.size)
            }
        })
    })
}

const isPromise = (fn) => {
    return fn && typeof fn.then === 'function'
}

// 可以自动执行
const runner = (gen) => {
    // 获取迭代器
    const it = gen()
    // 驱动 generator 的执行
    next()

    function next(err, res) {
        if(err) {
            return it.throw(err)
        }
        let {value, done} = it.next(res)
        if(done) {
            return;
        }
        if(isPromise(value)) {
            value.then((res) => {
                next(null, res)
            },(err) => {
                next(err)
            })
        }
        // paraller 逻辑
        if(Array.isArray(value)) {
            let results = []
            let pending = value.length
            value.forEach((item, index) => {
                item.call(this, (err, res) => {
                     if(err) {
                         next(err)
                     }else {
                         results[index] = res
                         pending--
                         if(pending === 0) {
                             // 所有的任务执行完毕
                             next(null, results)
                         }
                     }
                })
            })
        }
        if(typeof value === 'function') {
            value.call(this, (err, res) => {
                if(err) {
                    next(err, null)
                }else {
                    next(null, res)
                }
            })
        }
    }
}


const __main = function *() {
    const sizeInfo = {
        'file1': 0,
        'file2': 0,
        'file3': 0,
    }
    
    try{
        let sizes = yield Promise.all([
            size('file1.md'),
            size('file2.md'),
            size('file3.md'),
        ])
        sizeInfo['file1'] = sizes[0]
        sizeInfo['file2'] = sizes[1]
        sizeInfo['file3'] = sizes[2]
    }catch(err){
        console.error(err)
    }

    console.log(sizeInfo)
}

runner(__main)