const $ = new Env('劲酒');
let JingJiu = ($.isNode() ? process.env.JingJiu : $.getjson("JingJiu")) || [];
//const CryptoJS = createCryptoJS()
var CryptoJS = require("crypto-js");
var key = CryptoJS.enc.Utf8.parse("Z0J7M480h6kppf67");
!(async () => {
    if (typeof $request != "undefined") {
        await getCookie();
    } else {
        await main();
    }
})().catch((e) => {$.log(e)}).finally(() => {$.done({});});

async function main() {
    for (const item of JingJiu) {
        token = item.token;
        mobile = item.mobile;
        console.log(`用户：${mobile}开始任务`)
        //签到
        console.log("开始签到")
        let sign = await commonPost('/app/jingyoujia/taskContinuousRecord',{"taskId":5})
        if (sign.code == 200) {
            console.log(`获得：${sign.data.integral}`)
        } else {
            console.log(sign.msg)
        }
    }
    //幸运大转盘
    console.log("————————————")
    console.log("幸运大转盘")
    let queryTurntable = await commonGet('/app/jingyoujia/taskHallTurntable/queryTurntableGoodsList')
    let lotteryNumbers = await commonGet(`/app/jingyoujia/taskHallTurntable/getUserLotteryNumbers?activityId=${queryTurntable.data.id}`)
    for (let i = 0; i < lotteryNumbers.data.userLotteryNumbers; i++) {
        let lottery = await commonPost('/app/jingyoujia/taskHallTurntable/extractTurntableGoods',{"activityId":queryTurntable.data.id})
        console.log(`抽奖获得：${lottery.data.awardName}`)
    }
    //拍一拍赢好礼
    console.log("————————————")
    console.log("拍一拍赢好礼")
    let queryIntegralAndTimes = await commonGet('/app/jingyoujia/beatSecondConfig/queryIntegralAndTimes?configId=1')
    for (let i = 0; i < queryIntegralAndTimes.data.lastTimes; i++) {
        let starGame = await commonPost('/app/jingyoujia/beatSecondConfig/starGame',{"gameId":1})
        let endGame = await commonPost('/app/jingyoujia/beatSecondConfig/endGame',{"beatTime":"5.38","recordId":starGame.data})
        if (endGame.code == 200) {
            console.log(`抽奖获得：${endGame.data.integral}`)
        } else {
            console.log(endGame.msg)
        }
    }
    //拍拍春天
    console.log("————————————")
    console.log("拍拍春天")
    let medicineDraw = await commonPost('/business/Mountain/medicineDraw',{"activityType":"MOUNTAIN_CLIMBING_2024","latitude":32.30181121826172,"longitude":118.31683349609375})
    if (medicineDraw.code == 200) {
        console.log(`抽奖获得：${medicineDraw.data.awardName}`)
    } else {
        console.log(medicineDraw.msg)
    }
    //劲牌春日登高会
    console.log("————————————")
    console.log("劲牌春日登高会")
    //分享加次数
    let addShareCount = await commonPost('/business/Mountain/addShareCount',{"taskCode":66})
    //积分换次数
    let addIntegralChance = await commonPost('/business/Mountain/addIntegralChance',{"taskCode":66})
    let getAscendedChanceCount = await commonGet('/business/Mountain/getAscendedChanceCount')
    for (let i = 0; i < getAscendedChanceCount.data.useCount; i++) {
        let gameStart = await commonPost('/business/Mountain/gameStart',{"activityType":"MOUNTAIN_CLIMBING_2024","currentTime":await formattedDate(),"gameNo":66,"latitude":"32.30181121826172","longitude":"118.31683349609375"})
        let gameDraw = await commonPost('/business/Mountain/gameDraw',{"activityType":"MOUNTAIN_CLIMBING_2024","recordNumber":580,"recordId":gameStart.data,"latitude":"32.30181121826172","longitude":"118.31683349609375","isIntegral":null})
        if (gameDraw.code == 200) {
            console.log(`抽奖获得：${gameDraw.data.awardName}`)
        } else {
            console.log(gameDraw.msg)
        }
    }
    //问卷调查抽好礼
    console.log("————————————")
    console.log("问卷调查抽好礼")
    let surveyDraw = await commonPost('/business/Mountain/surveyDraw',{"surveyType":"1","activityType":"MOUNTAIN_CLIMBING_2024","latitude":32.30181121826172,"longitude":118.31683349609375})
    if (surveyDraw.code == 200) {
        console.log(`抽奖获得：${surveyDraw.data.awardName}`)
    } else {
        console.log(surveyDraw.msg)
    }
    //积分查询
    console.log("————————————")
    console.log("积分查询")
    let queryCustIntegral = await commonGet('/app/jingyoujia/customer/queryCustIntegral')
    console.log(`拥有积分：${queryCustIntegral.data}`)
    $.msg($.name, `用户：${mobile}`, `拥有积分: ${queryCustIntegral.data}`);
}

async function getCookie() {
    const token = $request.headers["authorization"];
    if (!token) {
        return
    }
    const body = $.toObj($response.body);
    if (!body.data || !body.data.mobile) {
        return
    }
    const mobile = body.data.mobile;
    const newData = {"mobile": mobile, "token": token}
    const index = JingJiu.findIndex(e => e.mobile == newData.mobile);
    if (index !== -1) {
        if (JingJiu[index].token == newData.token) {
            return
        } else {
            JingJiu[index] = newData;
            console.log(newData.token)
            $.msg($.name, `🎉用户${newData.mobile}更新token成功!`, ``);
        }
    } else {
        JingJiu.push(newData)
        console.log(newData.token)
        $.msg($.name, `🎉新增用户${newData.mobile}成功!`, ``);
    }
    $.setjson(JingJiu, "JingJiu");
}

async function commonPost(url,body) {
    body = await encrypt(JSON.stringify(body))
    return new Promise(resolve => {
        const options = {
            url: `https://jjw.jingjiu.com/app-jingyoujia${url}`,
            headers: {
                'Accept': 'application/json, text/plain, */*',
                'xweb_xhr': '1',
                'appid': 'wx10bc773e0851aedd',
                'authorization': token,
                'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Safari/537.36 MicroMessenger/7.0.20.1781(0x6700143B) NetType/WIFI MiniProgramEnv/Windows WindowsWechat/WMPF WindowsWechat(0x63090a13) XWEB/9117',
                'content-type': 'application/json',
                'sec-fetch-site': 'cross-site',
                'sec-fetch-mode': 'cors',
                'Sec-Fetch-Dest': 'empty',
                'referer': 'https://servicewechat.com/wx10bc773e0851aedd/606/page-frame.html',
                'accept-encoding': 'gzip, deflate, br',
                'accept-language': 'zh-CN,zh;q=0.9',
            },
            body: JSON.stringify({"v1":body}),
        }
        $.post(options, async (err, resp, data) => {
            try {
                if (err) {
                    console.log(`${JSON.stringify(err)}`)
                    console.log(`${$.name} API请求失败，请检查网路重试`)
                } else {
                    await $.wait(2000)
                    resolve(JSON.parse(data));
                }
            } catch (e) {
                $.logErr(e, resp)
            } finally {
                resolve();
            }
        })
    })
}

async function commonGet(url,body) {
    body = await encrypt(JSON.stringify(body))
    return new Promise(resolve => {
        const options = {
            url: `https://jjw.jingjiu.com/app-jingyoujia${url}`,
            headers: {
                'Accept': 'application/json, text/plain, */*',
                'xweb_xhr': '1',
                'appid': 'wx10bc773e0851aedd',
                'authorization': token,
                'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Safari/537.36 MicroMessenger/7.0.20.1781(0x6700143B) NetType/WIFI MiniProgramEnv/Windows WindowsWechat/WMPF WindowsWechat(0x63090a13) XWEB/9117',
                'content-type': 'application/json',
                'sec-fetch-site': 'cross-site',
                'sec-fetch-mode': 'cors',
                'Sec-Fetch-Dest': 'empty',
                'referer': 'https://servicewechat.com/wx10bc773e0851aedd/606/page-frame.html',
                'accept-encoding': 'gzip, deflate, br',
                'accept-language': 'zh-CN,zh;q=0.9',
            },
        }
        $.get(options, async (err, resp, data) => {
            try {
                if (err) {
                    console.log(`${JSON.stringify(err)}`)
                    console.log(`${$.name} API请求失败，请检查网路重试`)
                } else {
                    await $.wait(2000)
                    resolve(JSON.parse(data));
                }
            } catch (e) {
                $.logErr(e, resp)
            } finally {
                resolve();
            }
        })
    })
}

async function formattedDate() {
    let date = new Date();
    let year = date.getFullYear();
    let month = ("0" + (date.getMonth() + 1)).slice(-2);
    let day = ("0" + date.getDate()).slice(-2);
    let hours = ("0" + date.getHours()).slice(-2);
    let minutes = ("0" + date.getMinutes()).slice(-2);
    let seconds = ("0" + date.getSeconds()).slice(-2);
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;

}

async function encrypt(text) {
    var encrypted = CryptoJS.AES.encrypt(text, key, {
        mode: CryptoJS.mode.ECB,
        padding: CryptoJS.pad.Pkcs7
    });
    return encrypted.toString();
}

function Env(t,e){class s{constructor(t){this.env=t}send(t,e="GET"){t="string"==typeof t?{url:t}:t;let s=this.get;return"POST"===e&&(s=this.post),new Promise((e,a)=>{s.call(this,t,(t,s,r)=>{t?a(t):e(s)})})}get(t){return this.send.call(this.env,t)}post(t){return this.send.call(this.env,t,"POST")}}return new class{constructor(t,e){this.name=t,this.http=new s(this),this.data=null,this.dataFile="box.dat",this.logs=[],this.isMute=!1,this.isNeedRewrite=!1,this.logSeparator="\n",this.encoding="utf-8",this.startTime=(new Date).getTime(),Object.assign(this,e),this.log("",`🔔${this.name}, 开始!`)}getEnv(){return"undefined"!=typeof $environment&&$environment["surge-version"]?"Surge":"undefined"!=typeof $environment&&$environment["stash-version"]?"Stash":"undefined"!=typeof module&&module.exports?"Node.js":"undefined"!=typeof $task?"Quantumult X":"undefined"!=typeof $loon?"Loon":"undefined"!=typeof $rocket?"Shadowrocket":void 0}isNode(){return"Node.js"===this.getEnv()}isQuanX(){return"Quantumult X"===this.getEnv()}isSurge(){return"Surge"===this.getEnv()}isLoon(){return"Loon"===this.getEnv()}isShadowrocket(){return"Shadowrocket"===this.getEnv()}isStash(){return"Stash"===this.getEnv()}toObj(t,e=null){try{return JSON.parse(t)}catch{return e}}toStr(t,e=null){try{return JSON.stringify(t)}catch{return e}}getjson(t,e){let s=e;const a=this.getdata(t);if(a)try{s=JSON.parse(this.getdata(t))}catch{}return s}setjson(t,e){try{return this.setdata(JSON.stringify(t),e)}catch{return!1}}getScript(t){return new Promise(e=>{this.get({url:t},(t,s,a)=>e(a))})}runScript(t,e){return new Promise(s=>{let a=this.getdata("@chavy_boxjs_userCfgs.httpapi");a=a?a.replace(/\n/g,"").trim():a;let r=this.getdata("@chavy_boxjs_userCfgs.httpapi_timeout");r=r?1*r:20,r=e&&e.timeout?e.timeout:r;const[i,o]=a.split("@"),n={url:`http://${o}/v1/scripting/evaluate`,body:{script_text:t,mock_type:"cron",timeout:r},headers:{"X-Key":i,Accept:"*/*"},timeout:r};this.post(n,(t,e,a)=>s(a))}).catch(t=>this.logErr(t))}loaddata(){if(!this.isNode())return{};{this.fs=this.fs?this.fs:require("fs"),this.path=this.path?this.path:require("path");const t=this.path.resolve(this.dataFile),e=this.path.resolve(process.cwd(),this.dataFile),s=this.fs.existsSync(t),a=!s&&this.fs.existsSync(e);if(!s&&!a)return{};{const a=s?t:e;try{return JSON.parse(this.fs.readFileSync(a))}catch(t){return{}}}}}writedata(){if(this.isNode()){this.fs=this.fs?this.fs:require("fs"),this.path=this.path?this.path:require("path");const t=this.path.resolve(this.dataFile),e=this.path.resolve(process.cwd(),this.dataFile),s=this.fs.existsSync(t),a=!s&&this.fs.existsSync(e),r=JSON.stringify(this.data);s?this.fs.writeFileSync(t,r):a?this.fs.writeFileSync(e,r):this.fs.writeFileSync(t,r)}}lodash_get(t,e,s){const a=e.replace(/\[(\d+)\]/g,".$1").split(".");let r=t;for(const t of a)if(r=Object(r)[t],void 0===r)return s;return r}lodash_set(t,e,s){return Object(t)!==t?t:(Array.isArray(e)||(e=e.toString().match(/[^.[\]]+/g)||[]),e.slice(0,-1).reduce((t,s,a)=>Object(t[s])===t[s]?t[s]:t[s]=Math.abs(e[a+1])>>0==+e[a+1]?[]:{},t)[e[e.length-1]]=s,t)}getdata(t){let e=this.getval(t);if(/^@/.test(t)){const[,s,a]=/^@(.*?)\.(.*?)$/.exec(t),r=s?this.getval(s):"";if(r)try{const t=JSON.parse(r);e=t?this.lodash_get(t,a,""):e}catch(t){e=""}}return e}setdata(t,e){let s=!1;if(/^@/.test(e)){const[,a,r]=/^@(.*?)\.(.*?)$/.exec(e),i=this.getval(a),o=a?"null"===i?null:i||"{}":"{}";try{const e=JSON.parse(o);this.lodash_set(e,r,t),s=this.setval(JSON.stringify(e),a)}catch(e){const i={};this.lodash_set(i,r,t),s=this.setval(JSON.stringify(i),a)}}else s=this.setval(t,e);return s}getval(t){switch(this.getEnv()){case"Surge":case"Loon":case"Stash":case"Shadowrocket":return $persistentStore.read(t);case"Quantumult X":return $prefs.valueForKey(t);case"Node.js":return this.data=this.loaddata(),this.data[t];default:return this.data&&this.data[t]||null}}setval(t,e){switch(this.getEnv()){case"Surge":case"Loon":case"Stash":case"Shadowrocket":return $persistentStore.write(t,e);case"Quantumult X":return $prefs.setValueForKey(t,e);case"Node.js":return this.data=this.loaddata(),this.data[e]=t,this.writedata(),!0;default:return this.data&&this.data[e]||null}}initGotEnv(t){this.got=this.got?this.got:require("got"),this.cktough=this.cktough?this.cktough:require("tough-cookie"),this.ckjar=this.ckjar?this.ckjar:new this.cktough.CookieJar,t&&(t.headers=t.headers?t.headers:{},void 0===t.headers.Cookie&&void 0===t.cookieJar&&(t.cookieJar=this.ckjar))}get(t,e=(()=>{})){switch(t.headers&&(delete t.headers["Content-Type"],delete t.headers["Content-Length"],delete t.headers["content-type"],delete t.headers["content-length"]),t.params&&(t.url+="?"+this.queryStr(t.params)),this.getEnv()){case"Surge":case"Loon":case"Stash":case"Shadowrocket":default:this.isSurge()&&this.isNeedRewrite&&(t.headers=t.headers||{},Object.assign(t.headers,{"X-Surge-Skip-Scripting":!1})),$httpClient.get(t,(t,s,a)=>{!t&&s&&(s.body=a,s.statusCode=s.status?s.status:s.statusCode,s.status=s.statusCode),e(t,s,a)});break;case"Quantumult X":this.isNeedRewrite&&(t.opts=t.opts||{},Object.assign(t.opts,{hints:!1})),$task.fetch(t).then(t=>{const{statusCode:s,statusCode:a,headers:r,body:i,bodyBytes:o}=t;e(null,{status:s,statusCode:a,headers:r,body:i,bodyBytes:o},i,o)},t=>e(t&&t.error||"UndefinedError"));break;case"Node.js":let s=require("iconv-lite");this.initGotEnv(t),this.got(t).on("redirect",(t,e)=>{try{if(t.headers["set-cookie"]){const s=t.headers["set-cookie"].map(this.cktough.Cookie.parse).toString();s&&this.ckjar.setCookieSync(s,null),e.cookieJar=this.ckjar}}catch(t){this.logErr(t)}}).then(t=>{const{statusCode:a,statusCode:r,headers:i,rawBody:o}=t,n=s.decode(o,this.encoding);e(null,{status:a,statusCode:r,headers:i,rawBody:o,body:n},n)},t=>{const{message:a,response:r}=t;e(a,r,r&&s.decode(r.rawBody,this.encoding))})}}post(t,e=(()=>{})){const s=t.method?t.method.toLocaleLowerCase():"post";switch(t.body&&t.headers&&!t.headers["Content-Type"]&&!t.headers["content-type"]&&(t.headers["content-type"]="application/x-www-form-urlencoded"),t.headers&&(delete t.headers["Content-Length"],delete t.headers["content-length"]),this.getEnv()){case"Surge":case"Loon":case"Stash":case"Shadowrocket":default:this.isSurge()&&this.isNeedRewrite&&(t.headers=t.headers||{},Object.assign(t.headers,{"X-Surge-Skip-Scripting":!1})),$httpClient[s](t,(t,s,a)=>{!t&&s&&(s.body=a,s.statusCode=s.status?s.status:s.statusCode,s.status=s.statusCode),e(t,s,a)});break;case"Quantumult X":t.method=s,this.isNeedRewrite&&(t.opts=t.opts||{},Object.assign(t.opts,{hints:!1})),$task.fetch(t).then(t=>{const{statusCode:s,statusCode:a,headers:r,body:i,bodyBytes:o}=t;e(null,{status:s,statusCode:a,headers:r,body:i,bodyBytes:o},i,o)},t=>e(t&&t.error||"UndefinedError"));break;case"Node.js":let a=require("iconv-lite");this.initGotEnv(t);const{url:r,...i}=t;this.got[s](r,i).then(t=>{const{statusCode:s,statusCode:r,headers:i,rawBody:o}=t,n=a.decode(o,this.encoding);e(null,{status:s,statusCode:r,headers:i,rawBody:o,body:n},n)},t=>{const{message:s,response:r}=t;e(s,r,r&&a.decode(r.rawBody,this.encoding))})}}time(t,e=null){const s=e?new Date(e):new Date;let a={"M+":s.getMonth()+1,"d+":s.getDate(),"H+":s.getHours(),"m+":s.getMinutes(),"s+":s.getSeconds(),"q+":Math.floor((s.getMonth()+3)/3),S:s.getMilliseconds()};/(y+)/.test(t)&&(t=t.replace(RegExp.$1,(s.getFullYear()+"").substr(4-RegExp.$1.length)));for(let e in a)new RegExp("("+e+")").test(t)&&(t=t.replace(RegExp.$1,1==RegExp.$1.length?a[e]:("00"+a[e]).substr((""+a[e]).length)));return t}queryStr(t){let e="";for(const s in t){let a=t[s];null!=a&&""!==a&&("object"==typeof a&&(a=JSON.stringify(a)),e+=`${s}=${a}&`)}return e=e.substring(0,e.length-1),e}msg(e=t,s="",a="",r){const i=t=>{switch(typeof t){case void 0:return t;case"string":switch(this.getEnv()){case"Surge":case"Stash":default:return{url:t};case"Loon":case"Shadowrocket":return t;case"Quantumult X":return{"open-url":t};case"Node.js":return}case"object":switch(this.getEnv()){case"Surge":case"Stash":case"Shadowrocket":default:{let e=t.url||t.openUrl||t["open-url"];return{url:e}}case"Loon":{let e=t.openUrl||t.url||t["open-url"],s=t.mediaUrl||t["media-url"];return{openUrl:e,mediaUrl:s}}case"Quantumult X":{let e=t["open-url"]||t.url||t.openUrl,s=t["media-url"]||t.mediaUrl,a=t["update-pasteboard"]||t.updatePasteboard;return{"open-url":e,"media-url":s,"update-pasteboard":a}}case"Node.js":return}default:return}};if(!this.isMute)switch(this.getEnv()){case"Surge":case"Loon":case"Stash":case"Shadowrocket":default:$notification.post(e,s,a,i(r));break;case"Quantumult X":$notify(e,s,a,i(r));break;case"Node.js":}if(!this.isMuteLog){let t=["","==============📣系统通知📣=============="];t.push(e),s&&t.push(s),a&&t.push(a),console.log(t.join("\n")),this.logs=this.logs.concat(t)}}log(...t){t.length>0&&(this.logs=[...this.logs,...t]),console.log(t.join(this.logSeparator))}logErr(t,e){switch(this.getEnv()){case"Surge":case"Loon":case"Stash":case"Shadowrocket":case"Quantumult X":default:this.log("",`❗️${this.name}, 错误!`,t);break;case"Node.js":this.log("",`❗️${this.name}, 错误!`,t.stack)}}wait(t){return new Promise(e=>setTimeout(e,t))}done(t={}){const e=(new Date).getTime(),s=(e-this.startTime)/1e3;switch(this.log("",`🔔${this.name}, 结束! 🕛 ${s} 秒`),this.log(),this.getEnv()){case"Surge":case"Loon":case"Stash":case"Shadowrocket":case"Quantumult X":default:$done(t);break;case"Node.js":process.exit(1)}}}(t,e)}
