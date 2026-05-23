import fs from 'fs';

const logPath = "C:\\Users\\shame\\.gemini\\antigravity\\brain\\dc04ab14-5dea-427b-a266-750d9b757e47\\.system_generated\\logs\\overview.txt";
const content = fs.readFileSync(logPath, 'utf8');

// Search for the response of viewing CandidatePortal.tsx
// We can find where the view_file tool output has "File Path: ...CandidatePortal.tsx"
const marker = "CandidatePortal.tsx";
const index = content.indexOf("File Path: `file:///c:/Users/shame/SA%20consultant/sa-elevate/sa-elevate/src/pages/CandidatePortal.tsx`");

if (index !== -1) {
  console.log("Found view_file output at index", index);
  // Get next 50000 characters
  const slice = content.substring(index, index + 100000);
  // Find where this step ends or another step starts
  const endOfStep = slice.indexOf('"}');
  if (endOfStep !== -1) {
    fs.writeFileSync('extracted_candidate.txt', slice.substring(0, endOfStep));
    console.log("Successfully extracted to extracted_candidate.txt");
  } else {
    fs.writeFileSync('extracted_candidate.txt', slice);
    console.log("Extracted partial slice to extracted_candidate.txt");
  }
} else {
  console.log("Could not find CandidatePortal.tsx view_file output in overview.txt");
}
