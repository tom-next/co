const fs = require('fs')

const size = (fileName) => {
    return (fn) => {
        fs.stat(fileName, function(err, value) {
            if(err) {
                fn(err)
            }else {
                fn(null, value.size)
            }
        })
    }
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
        sizeInfo['file1'] = yield size('file1.md')
        sizeInfo['file2'] = yield size('file2.md')
        sizeInfo['file3'] = yield size('file3.md')
    }catch(err){
        console.error(err)
    }

    console.dir(sizeInfo)
}

runner(__main)