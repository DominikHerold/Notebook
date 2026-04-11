// node encrypt.js MEINPASSWORT geheim.txt name data/geheim.enc.json
const crypto = require("crypto");
const fs = require("fs");

const password = process.argv[2];
const inputFile = process.argv[3];
const name = process.argv[4];
const outputFile = process.argv[5];

const content = fs.readFileSync(inputFile, "utf8");

const payload = JSON.stringify({
  name: name,
  content: content
});

const salt = crypto.randomBytes(16);
const iv = crypto.randomBytes(12);

const key = crypto.pbkdf2Sync(password, salt, 600000, 32, "sha256");

const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);

let encrypted = cipher.update(payload, "utf8");
encrypted = Buffer.concat([encrypted, cipher.final()]);
const tag = cipher.getAuthTag();

const result = {
  salt: salt.toString("base64"),
  iv: iv.toString("base64"),
  ciphertext: Buffer.concat([encrypted, tag]).toString("base64")
};

fs.writeFileSync(outputFile, JSON.stringify(result, null, 2));