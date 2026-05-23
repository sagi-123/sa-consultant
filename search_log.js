import fs from 'fs';

const logPath = "C:\\Users\\shame\\.gemini\\antigravity\\brain\\dc04ab14-5dea-427b-a266-750d9b757e47\\.system_generated\\logs\\overview.txt";
const content = fs.readFileSync(logPath, 'utf8');

const lines = content.split('\n');
lines.forEach((line, index) => {
  if (line.includes('setVendorForm')) {
    console.log(`Line ${index + 1}:`);
    console.log(line.substring(0, 1000));
  }
});
