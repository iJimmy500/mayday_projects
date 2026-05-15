import https from 'https';

const testUrl = "https://corsproxy.io/?https://archive.org/download/mahjong_202011/mahjong.swf";

https.get(testUrl, {
  headers: {
    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)'
  }
}, (res) => {
  console.log("Status:", res.statusCode);
  console.log("Headers:", res.headers);
}).on('error', (e) => {
  console.error(e);
});
