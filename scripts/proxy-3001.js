const http = require("http");

const server = http.createServer((clientReq, clientRes) => {
  const options = {
    hostname: "127.0.0.1",
    port: 3000,
    path: clientReq.url,
    method: clientReq.method,
    headers: clientReq.headers,
  };

  const proxy = http.request(options, (res) => {
    clientRes.writeHead(res.statusCode, res.headers);
    res.pipe(clientRes, { end: true });
  });

  proxy.on("error", (err) => {
    clientRes.writeHead(502, { "Content-Type": "text/plain" });
    clientRes.end("Proxy Error: Next.js dev server on port 3000 is compiling...");
  });

  clientReq.pipe(proxy, { end: true });
});

server.on("upgrade", (req, socket, head) => {
  const proxy = http.request({
    hostname: "127.0.0.1",
    port: 3000,
    path: req.url,
    method: req.method,
    headers: req.headers,
  });

  proxy.on("upgrade", (res, proxySocket, proxyHead) => {
    socket.write(`HTTP/1.1 101 Switching Protocols\r\n` +
      Object.keys(res.headers).map(h => `${h}: ${res.headers[h]}`).join("\r\n") +
      `\r\n\r\n`);
    proxySocket.pipe(socket);
    socket.pipe(proxySocket);
  });

  proxy.on("error", () => socket.destroy());
  req.pipe(proxy);
});

server.listen(3001, () => {
  console.log("Port 3001 proxy forwarding to port 3000 running.");
});

