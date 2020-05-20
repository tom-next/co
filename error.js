const fs = require('fs')

const size = (fileName) => {
    fs.stat(fileName, function(err, value) {
        if(err) {
            it.throw(err)
        }else {
            it.next(value.size)
        }
    })
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

const it = __main()
// 这里需要手动执行
it.next()