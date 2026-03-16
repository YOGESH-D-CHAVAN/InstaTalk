import fs from 'fs';

async function run() {
  const form = new FormData();
  form.append('file', new Blob([fs.readFileSync('./package.json')]), 'package.json');
  try {
    const res = await fetch('https://instatalk-tyq7.onrender.com/api/upload', {
      method: 'POST',
      body: form
    });
    console.log("Success:", await res.json());
  } catch (err) {
    console.error("Error:", err.message);
  }
}
run();
