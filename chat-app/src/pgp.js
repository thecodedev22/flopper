import * as openpgp from 'openpgp';

// Generate a new key pair
export async function generateKey(name, email, passphrase) {
  const { privateKey, publicKey } = await openpgp.generateKey({
    type: 'rsa',
    rsaBits: 2048,
    userIDs: [{ name, email }],
    passphrase
  });
  return { privateKey, publicKey };
}

// Encrypt a message with a public key
export async function encryptMessage(plainText, publicKeyArmored) {
  const publicKey = await openpgp.readKey({ armoredKey: publicKeyArmored });
  const encrypted = await openpgp.encrypt({
    message: await openpgp.createMessage({ text: plainText }),
    encryptionKeys: publicKey
  });
  return encrypted;
}

// Decrypt a message with a private key
export async function decryptMessage(encryptedText, privateKeyArmored, passphrase) {
  const privateKey = await openpgp.decryptKey({
    privateKey: await openpgp.readPrivateKey({ armoredKey: privateKeyArmored }),
    passphrase
  });
  const message = await openpgp.readMessage({ armoredMessage: encryptedText });
  const { data: decrypted } = await openpgp.decrypt({
    message,
    decryptionKeys: privateKey
  });
  return decrypted;
}