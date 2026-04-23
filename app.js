const files = [
  "data/geheim2.enc.json",
  "data/geheim3.enc.json",
  "data/geheim4.enc.json",
  "data/geheim5.enc.json",
  "data/geheim7.enc.json",
  "data/geheim8.enc.json",
  "data/geheim.enc.json",
  "data/geheim6.enc.json",
  "data/geheim9.enc.json"
];

let fileElements = [];

async function fetchFiles() {
  const container = document.getElementById("files");

  for (const file of files) {
    const res = await fetch(file);
    const data = await res.json();

    const div = document.createElement("div");
    div.className = "file";

    const title = document.createElement("h2");
    title.textContent = "🔒 Verschlüsselt";

    const decryptBtn = document.createElement("button");
    decryptBtn.textContent = "Entschlüsseln";

    const content = document.createElement("pre");

    const copyBtn = document.createElement("button");
    copyBtn.textContent = "Kopieren";

    decryptBtn.onclick = async () => {
      await decryptAndRender(data, title, content);
    };

    copyBtn.onclick = () => {
      navigator.clipboard.writeText(content.textContent);
    };

    div.appendChild(title);
    div.appendChild(decryptBtn);
    div.appendChild(content);
    div.appendChild(copyBtn);

    container.appendChild(div);

    fileElements.push({ data, title, content });
  }
}

async function decryptAndRender(data, titleEl, contentEl) {
  const password = document.getElementById("password").value;

  try {
    const decrypted = await decrypt(data, password);
    const parsed = JSON.parse(decrypted);

    titleEl.textContent = parsed.name;
    contentEl.textContent = parsed.content;
  } catch (e) {
    contentEl.textContent = "❌ Falsches Passwort";
  }
}

async function decryptAll() {
  for (const file of fileElements) {
    await decryptAndRender(file.data, file.title, file.content);
  }
}

async function decrypt(data, password) {
  const enc = new TextEncoder();

  const salt = Uint8Array.from(atob(data.salt), c => c.charCodeAt(0));
  const iv = Uint8Array.from(atob(data.iv), c => c.charCodeAt(0));
  const ciphertext = Uint8Array.from(atob(data.ciphertext), c => c.charCodeAt(0));

  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    enc.encode(password),
    "PBKDF2",
    false,
    ["deriveKey"]
  );

  const key = await crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt,
      iterations: 600000,
      hash: "SHA-256"
    },
    keyMaterial,
    { name: "AES-GCM", length: 256 },
    false,
    ["decrypt"]
  );

  const decrypted = await crypto.subtle.decrypt(
    {
      name: "AES-GCM",
      iv
    },
    key,
    ciphertext
  );

  return new TextDecoder().decode(decrypted);
}

fetchFiles();
