process.env.NODE_ENV = "production";
process.env.NEXT_TELEMETRY_DISABLED = "1";

if (typeof PhusionPassenger !== "undefined") {
  PhusionPassenger.configure({ autoInstall: false });
}

require("./scripts/apply-db-env.cjs");
const { createServer } = require("http");
const { parse } = require("url");
const next = require("next");

const passenger = typeof PhusionPassenger !== "undefined";
const hostname = process.env.HOST || "0.0.0.0";
const port = parseInt(process.env.PORT || "3000", 10);

const app = next({
  dev: false,
  hostname,
  port: passenger ? undefined : port,
});
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const server = createServer((req, res) => {
    handle(req, res, parse(req.url, true));
  });
  if (passenger) {
    server.listen("passenger", () => {
      console.log("zuknow.in ready (Passenger, production)");
    });
  } else {
    server.listen(port, hostname, () => {
      console.log(`zuknow.in ready on http://${hostname}:${port}`);
    });
  }
});
