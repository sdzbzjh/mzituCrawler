const Crawler = require('crawler')
const fs = require('fs')

let imageCrawler = new Crawler({
    encoding: null,
    jQuery: false,
    headers: {
        Referer: ''
    },
    callback(error, res, done) {
        if (error) {
            console.log(error)
        } else {
            const dirname = './images/' + res.options.path
            const filename = res.options.filename
            fs.readdir(dirname, (err, files) => {
                if (err) {
                    fs.mkdir(dirname, (error) => {
                        if (error) {
                            console.log(error)
                        } else {
                            console.log('创建目录' + res.options.path + '成功')
                        }
                    })
                } else {
                    //imageCrawler
                    //console.log(imageCrawler.options)
                    // fs.writeFile(dirname + '/' + filename, '1', (err) => {
                    //     if (err) {
                    //         console.log(err);
                    //     } else {

                    //     }
                    // })
                    fs.createWriteStream(dirname + '/' + filename).write(res.body)
                }
            })
        }
        done();
    }
})


let urlCrawler = new Crawler({
    maxConnections: 10,
    callback(error, res, done) {
        if (error) {
            console.log(error)
        } else {
            const $ = res.$;
            const title = $('h2.main-title').text()
            //目录名称，过滤掉页码
            const path = title.split('（')[0].trim();
            const src = $('div.main-image img').attr('src')
            const arr = src.split('.')
            const suffix = arr[arr.length - 1]
            imageCrawler.options.headers.Referer = src
            imageCrawler.queue({
                url: src,
                path: path,
                filename: title + '.' + suffix
            })
        }
        done();
    }
})

urlCrawler.queue('http://www.mzitu.com/142189')