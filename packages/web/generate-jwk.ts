/**
 * This file is used for generating JWKS json
 */

import fs from "fs";
import path from "path";
import { importSPKI, exportJWK } from "jose";

const publicKeyPath = path.resolve("public_key.pem");
const publicKeyPEM = fs.readFileSync(publicKeyPath, "utf-8");

const publicKey = await importSPKI(publicKeyPEM, "EdDSA");

const jwk = await exportJWK(publicKey);
jwk.kid = process.env.currentKid || "default-kid";
jwk.use = "sig";
jwk.alg = "EdDSA";

const jwks = { keys: [jwk] };

const outputPath = path.resolve("public/.well-known/jwks.json");
fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(outputPath, JSON.stringify(jwks, null, 2));

console.log("JWKS generated at:", outputPath);
console.log(JSON.stringify(jwks, null, 2));
