httpGetDigest = function(url, authHeader) {
  const username = context.values.get("publicKey");
  const apiKey = context.values.get("privateKey");

  const realm = authHeader.match(/realm="(.*?)"/)[1];
  const nonce = authHeader.match(/nonce="(.*?)"/)[1];
  const qop = authHeader.match(/qop="(.*?)"/)[1];

  const ha1 = utils.crypto.hash('md5', `${username}:${realm}:${apiKey}`).toHex();

  const path = url.match(/:\/\/.*?(\/.*)/)[1];

  const ha2 = utils.crypto.hash('md5', `GET:${path}`).toHex();
  const cnonce = Math.random().toString().substr(2, 14);
  const nc = '00000001';

  const hash = utils.crypto.hash('md5', `${ha1}:${nonce}:${nc}:${cnonce}:${qop}:${ha2}`).toHex();

  const digestHeader = `Digest username="${username}", realm="${realm}", nonce="${nonce}", uri="${path}", qop=${qop}, nc=${nc}, cnonce="${cnonce}", response="${hash}", algorithm=MD5`;
  
  return context.http.get({ url: url, headers: { 'Authorization': [ digestHeader ], 'Content-Type': ['application/json'] } });
};

exports = function(url) {
  return context.http.get({ url: url })
    .then(resp => {
      const authHeader = resp.headers['Www-Authenticate'].toString();
      return httpGetDigest(url, authHeader);
    });
};