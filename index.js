const Crawler = require('crawler')
const fs = require('fs')

let imageCrawler = new Crawler({
    encoding: null,
    jQuery: false,
    skipDuplicates: true,
    headers: {
        Referer: ''
    },
    callback(error, res, done) {
        if (error) {
            console.log(error)
        } else {
            const dirname = '/home/acer/图片/images/' + res.options.path
            const filename = res.options.filename
            fs.readdir(dirname, (err, files) => {
                if (err) {
                    fs.mkdir(dirname, (error) => {
                        if (error) {
                            console.error(error.Error)
                        } else {
                            //console.log('创建目录' + res.options.path + '成功')
                            fs.createWriteStream(dirname + '/' + filename).write(res.body)
                        }
                    })
                } else {
                    //保存图片
                    fs.createWriteStream(dirname + '/' + filename).write(res.body)
                }
            })
        }
        done()
    }
})


let urlCrawler = new Crawler({
    maxConnections: 10,
    skipDuplicates: true,
    callback(error, res, done) {
        if (error) {
            console.log(error)
        } else {
            const $ = res.$
            const title = $('h2.main-title').text()
            //目录名称，过滤掉页码
            const path = title.split('（')[0].trim()
            const src = $('div.main-image img').attr('src')
            if (!src) return

            const arr = src.split('.')
            const suffix = arr[arr.length - 1]
            const uri = res.options.uri
            //如果是第一页，那么爬取分页，否则不爬取分页
            const reg = /www\.mzitu\.com\/[0-9]+$/
            if (reg.test(uri)) {
                const pages = $('.pagenavi>a')
                const tmpArr = $(pages[pages.length - 2]).attr('href').split('/')
                const lastPage = tmpArr[tmpArr.length - 1]
                const urlPool = []

                console.log(path + '---' + lastPage + '张已保存')

                for (let i = 2; i < lastPage; ++i) {
                    urlPool.push(uri + '/' + i)
                }

                urlCrawler.queue(urlPool)
            }

            imageCrawler.options.headers.Referer = src
            //启动下载的爬虫
            imageCrawler.queue({
                url: src,
                path: path,
                filename: title + '.' + suffix
            })
        }
        done()
    }
})

//主爬虫程序
let mainCrawler = new Crawler({
    maxConnections: 10,
    skipDuplicates: true,
    callback(error, res, done) {
        if (error) {
            console.log(error)
        } else {
            const $ = res.$
            const list = $('#pins>li>a')
            const urls = []
            for (let i = 0, len = list.length; i < len; ++i) {
                urls.push($(list[i]).attr('href'))
            }
            urlCrawler.queue(urls)
            const uri = res.options.uri
            //如果是第一页，那么爬取分页，否则不爬取分页
            const reg = /xinggan\/$/
            if (reg.test(uri)) {
                const pages = $('.nav-links>a')
                const tmpArr = $(pages[pages.length - 2]).attr('href').split('/')
                const lastPage = tmpArr[tmpArr.length - 2]
                const urlPool = []

                for (let i = 2; i < lastPage; ++i) {
                    urlPool.push('http://www.mzitu.com/xinggan/page/' + i)
                }

                mainCrawler.queue(urlPool)
            }
        }
        done()
    }
})

mainCrawler.queue('http://www.mzitu.com/xinggan/')