import assert from "node:assert/strict";
import { createSign } from "node:crypto";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import test, { after } from "node:test";
import { fileURLToPath, pathToFileURL } from "node:url";
import { build } from "esbuild";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const dir = mkdtempSync(join(tmpdir(), "mailflare-sns-test-"));
after(() => rmSync(dir, { recursive: true, force: true }));

await build({
	entryPoints: [join(root, "src/lib/aws/sns-signature.ts")],
	outfile: join(dir, "sns.mjs"), bundle: true, platform: "node", format: "esm", logLevel: "silent",
});
const { verifySnsSignature, isValidSigningCertUrl } = await import(pathToFileURL(join(dir, "sns.mjs")).href);

const keyPem = `-----BEGIN PRIVATE KEY-----
MIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC5JgRDLWkBMIwY
N0Vnulu4SoeQMJogCL0Tyrsv8/MYmsN3PQxPOyc1zo1qk7+uz+JeT8s5sPYp3caY
zhgB45GMOvYUVVRXw8Jsp8aeobZFVhRb9CrO4SmGJs7H+JsyHlIHJHbRYv4N8oAT
mWN9DXK/Si2O3UHnZRvqvPY+fvLZGv24Eff9/QMBdl0sU6xcjxGdDB29Q5Agv2f0
FlqdzwZdqpOU5r/mgKdPhkGfh4qeTTd9qABMViQH0D71JA4lVve6VFhB7BwNdBOY
MFto31Z7smGMZkfm7ggSPWnD17ixdWgm+nGRpekl/KzZWTOUE3P1xAzfUrZMrgkg
05PUPor7AgMBAAECggEACI5JryMHka8BIlNXiToS5/rFtfORA77zodkB+m7PAomQ
U8/F5Flq7/EaFt06A+WGY+5TCVj0ny2o8kG/2UJ/ZNgKrBjfW2jn8KZ2Jrl5V03p
hfBMFCBSj2j2sEX8Qf4lsz/Ln9Rvwgw9P+qcLtiyv0U5wrrVw1AoUJon1O5/4Wlq
O4H/x0uI3Lywc8bjgCVGd5zFPwr0iaZsus7Sk+U4SbLc5jkXaJ9XFvc1Tl/PjNnd
jY3Ef9/Kn3cpxgzrlp+6pkuI7/BmsCadGY3n26EfTjnQFdKd4Aqpbq+3M/RQIAy2
NLpoaAFXpBbV4uQeVSSSHdSZFUVn1Fr60/2kVzEzIQKBgQDoE6qZ+cH5F/qJGbuR
qHMCyrZbNpxn40p7rB0DTWK3iCzPdGkMfGidItdkvpj105Gp4Ang29fqcYl7l5IJ
+i5wTyBX78B1l255SvhEgVMdg2Vvq+vC560nNC9O2JP7emIRde/csZkZ0qTQeDXX
Xt1b+paIdfIRU49C2+eyyfeeoQKBgQDMO/JwCfPEMaA+teC8EalMaVQJ+Ely1EMP
bRQP88CyKfdwb0YnPsBHhIbxCDqJvz5fNyPNj1JwQaMtQ4+YblVDwA5SyFC0vgQl
AGxAiF5JK5m23P7rZGQLkWp2vy5C/vYRzfDqTOdvY7OprzOSM1wcQh9zQ1b/3Qeu
pT8HY37QGwKBgH/5UEsmIaOlaF8v1HHmzL0OYW5899SFzq3R5BHNG5GPQv6G9+KN
u/ZinxoLzDdKmnltdKUNNcwvHZwModhkoDUIPRKgv6VYgu/Zunu0QMv2h/oDeLd6
n84NhcTZwwianPd57HHrcTx/HqlikHYZ9sDgtx+6wmhxhn9c2jCKFMThAoGAKXGk
wc2TNOXpIbCguSlQVJwvHJLQvMeMEC5PWulY2g6gEqXR85bNR/YBuBm2X0t6qbGz
xzvlO7hmF4JVOlZxYP0xKuVRU0wX5TZPwUyq7Wg2miAAbt4BW0OX+h7TkW7Rmk1T
LQiMElOGGtHdwjY/49AbN7WbivJcY7lOr/4ltq8CgYEA5L3uXvSQqV11yb6nwAI9
aWs20M9FAj32GCEIPpgu6zeNm2IzzcTFtmDodfWsNThnfI46k1Un7Ur3sTvMS5wP
5W33COTBoaBVvp6DjxNewkDCB6PB30qnB+PNbc/wXehQU2Nx3Ae5Fkd99dfcxVf4
tsBwA7rhk+HDjlUrOodZjSY=
-----END PRIVATE KEY-----`;

const certPem = `-----BEGIN CERTIFICATE-----
MIIDCTCCAfGgAwIBAgIUPJltgsCjrDzkMw7In2PaoMYTV7cwDQYJKoZIhvcNAQEL
BQAwEzERMA8GA1UEAwwIc25zLnRlc3QwIBcNMjYxMTIxMTUyNTQxWhgPMjEyNjEw
MjgxNTI1NDFaMBMxETAPBgNVBAMMCHNucy50ZXN0MIIBIjANBgkqhkiG9w0BAQEF
AAOCAQ8AMIIBCgKCAQEAuSYEQy1pATCMGDdFZ7pbuEqHkDCaIAi9E8q7L/PzGJrD
dz0MTzsnNc6NapO/rs/iXk/LObD2Kd3GmM4YAeORjDr2FFVUV8PCbKfGnqG2RVYU
W/QqzuEphibOx/ibMh5SByR20WL+DfKAE5ljfQ1yv0otjt1B52Ub6rz2Pn7y2Rr9
uBH3/f0DAXZdLFOsXI8RnQwdvUOQIL9n9BZanc8GXaqTlOa/5oCnT4ZBn4eKnk03
fagATFYkB9A+9SQOJVb3ulRYQewcDXQTmDBbaN9We7JhjGZH5u4IEj1pw9e4sXVo
JvpxkaXpJfys2VkzlBNz9cQM31K2TK4JINOT1D6K+wIDAQABo1MwUTAdBgNVHQ4E
FgQUjhBUn6G8VO6fjBZasg/KWox1P7AwHwYDVR0jBBgwFoAUjhBUn6G8VO6fjBZa
sg/KWox1P7AwDwYDVR0TAQH/BAUwAwEB/zANBgkqhkiG9w0BAQsFAAOCAQEAeLZ0
s1ane1DoC8ZjraHehRUmouxDGsbAJ9m1CYDvYjnsDtfpffZobtkCEh0IxSJV75Nt
CeE3FLs7pHspEp7DLbdCdl8RZgtnTLZASDhgMPIxW+nUkrkVhIgYn4iVVkcSWUhr
b5QHE7zARDSBTrN0XqoiecxDOYWpuicBo0DxahdMHVMUinSu5HJp4Yv9mrzPki11
tF5wDLOALvuNqPNGjgS8HkbG59QOqXqNpYH2ET0V4sXZvLZXnyxKe+i4Nke6ctC/
hv+3wHLtDE5j5lGa8CKRkCNP6XBexFhYPzg8XIrkFstcR3AGoSHQ5A32/0oAw9Wq
iw087YmBLdsmP/96gg==
-----END CERTIFICATE-----`;

const der = Buffer.from(certPem.replace(/-----[A-Z ]+-----/g, "").replace(/\s+/g, ""), "base64");
const loadCertificate = async () => der.buffer.slice(der.byteOffset, der.byteOffset + der.byteLength);

const base = { Type: "Notification", MessageId: "m-1", TopicArn: "arn:aws:sns:us-east-1:1:t", Message: "{}", Timestamp: new Date().toISOString(), SignatureVersion: "2", SigningCertURL: "https://sns.us-east-1.amazonaws.com/cert.pem" };
function sign(envelope, algorithm = "RSA-SHA256") {
	const signer = createSign(algorithm);
	signer.update(["Message", "MessageId", "Timestamp", "TopicArn", "Type"].map((key) => `${key}\n${envelope[key]}\n`).join(""));
	return signer.sign(keyPem, "base64");
}

test("accepts a correctly signed notification and rejects tampering", async () => {
	const envelope = { ...base, Signature: sign(base) };
	assert.equal(await verifySnsSignature(envelope, { loadCertificate }), true);
	assert.equal(await verifySnsSignature({ ...envelope, Message: "{\"x\":1}" }, { loadCertificate }), false);
	assert.equal(await verifySnsSignature({ ...envelope, TopicArn: "arn:other" }, { loadCertificate }), false);
});

test("accepts SignatureVersion 1 (SHA-1)", async () => {
	const v1 = { ...base, SignatureVersion: "1" };
	assert.equal(await verifySnsSignature({ ...v1, Signature: sign(v1, "RSA-SHA1") }, { loadCertificate }), true);
});

test("rejects stale timestamps, missing signatures and foreign certificate URLs", async () => {
	const old = { ...base, Timestamp: new Date(Date.now() - 3 * 86_400_000).toISOString() };
	assert.equal(await verifySnsSignature({ ...old, Signature: sign(old) }, { loadCertificate }), false);
	assert.equal(await verifySnsSignature(base, { loadCertificate }), false);
	for (const url of ["http://sns.us-east-1.amazonaws.com/c.pem", "https://evil.example/c.pem", "https://sns.us-east-1.amazonaws.com.evil.example/c.pem", "https://sns.us-east-1.amazonaws.com:8443/c.pem", "https://sns.us-east-1.amazonaws.com/c.txt"]) {
		assert.equal(isValidSigningCertUrl(url), false, url);
	}
	assert.equal(isValidSigningCertUrl("https://sns.eu-west-1.amazonaws.com/SimpleNotificationService-abc.pem"), true);
});
