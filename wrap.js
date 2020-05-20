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
    return function(cb) {
        const args = Array.prototype.slice.call(arguments)
        const length = args.length
        if(length && 'function' === typeof args[length-1]) {
            cb = args.pop()
            it = gen.apply(this, args)
        } else {
            return;
        }
        // 驱动 generator 的执行
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
     // 初始化信息
     const sizeInfo = files.reduce((info, file) => {
        info[file] = 0
        return info
    }, {})
    try{
        const requests = files.map((file) => {
            return size(file)
        })
        sizes = yield requests
        sizes.forEach((size, index) => {
            sizeInfo[files[index]] = sizes[index]
        })
        return sizeInfo
    } catch(error) {
        console.error('error:', error)
    }
}

runner(__main)(['file1.md', 'file2.md', 'file3.md'], (err, value)=>{
    console.log('value', value);
});