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

const toThunk = (fn) => {
    if(Array.isArray(fn)) {
        let results = []
        let pending = value.length
        return (cb) => {
            let finished = false
            fn.forEach((item, index) => {
                if(finished){
                    return;
                }
                let func = toThunk(item)
                func.call(this, (err, res) => {
                     if(err) {
                        finished = true
                        cb(err)
                     }else {
                         results[index] = res
                         pending--
                         if(pending === 0) {
                             // 所有的任务执行完毕
                             cb(null, results)
                         }
                     }
                })
            })
        }
    }else if(isPromise(fn)) {
        return (cb) => {
            return fn.then(function(res){
                cb(null, res)
            }, function(err){
                cb(err)
            })
        }
    }
}

// 可以自动执行
const runner = (gen) => {
    // 获取迭代器
    const it = gen()
    // 驱动 generator 的执行
    return function(cb) {
        next()
        function next(err, res) {
            if (err) {
                try {
                    return it.throw(err)
                } catch (e) {
                    return cb(err)
                }
            }
            let {value, done} = it.next(res)
            if(done) {
                cb(null, value)
            }
            let thunk = toThunk(value)
            if(typeof thunk === 'function') {
                thunk.call(this, (err, res) => {
                    if(err) {
                        next(err, null)
                    }else {
                        next(null, res)
                    }
                })
            }
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

let wrapped = runner(__main)

const print = (err, sizeInfo) => {
    if(err) {
        console.error(err)
    } else {
        console.dir(sizeInfo)
    }
}

wrapped(print)