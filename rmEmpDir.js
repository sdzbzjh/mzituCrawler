const fs = require('fs')

const dirRm = function () {
    fs.readdir('/home/acer/图片/images/', function (err, files) {
        if (err) {
            console.error(err)
            return
        } else {
            files.forEach(element => {
                console.log()
                let state = fs.lstat('/home/acer/图片/images/' + element, function (error, stats) {
                    if (error) {
                        console.log(error)
                    } else {
                        if (stats.size === 4096) {
                            deleteFolder('/home/acer/图片/images/' + element)
                        }
                    }
                })
            })
        }
    })
}

function deleteFolder(path) {
    if (fs.existsSync(path)) {
        fs.readdirSync(path).forEach(function (file) {
            var curPath = path + "/" + file
            if (fs.statSync(curPath).isDirectory()) { // recurse
                deleteFolderRecursive(curPath)
            } else { // delete file
                fs.unlinkSync(curPath)
            }
        });
        fs.rmdirSync(path)
    }
}

dirRm()