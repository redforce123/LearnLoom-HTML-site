import fs from 'fs';
import path from 'path';

const src = 'C:\\Users\\benab\\Downloads\\Website resources free pdfs';
const targets = [
  path.resolve('public/resources/Olympiad_Question_Bank'),
  'C:\\Users\\benab\\Downloads\\Website resources free pdfs\\Olympiad_Question_Bank'
];

const mapping = [
  { src: 'Grade 4 olympiad final.pdf', rel: path.join('Primary_School (Grades 4-5)', 'Olympiad_Grade-04_Final.pdf') },
  { src: 'grade 5  olympiad.pdf', rel: path.join('Primary_School (Grades 4-5)', 'Olympiad_Grade-05_Set-01.pdf') },
  { src: 'grade 5  olympiad (1).pdf', rel: path.join('Primary_School (Grades 4-5)', 'Olympiad_Grade-05_Set-02.pdf') },
  { src: 'Grade 8 Olympiad.pdf', rel: path.join('Middle_School (Grade 8)', 'Olympiad_Grade-08.pdf') },
  { src: 'Grade 9 Olympiad.pdf', rel: path.join('Secondary_School (Grades 9-10)', 'General_Science_Maths', 'Olympiad_Grade-09_General.pdf') },
  { src: 'Grade 10 Olympiad.pdf', rel: path.join('Secondary_School (Grades 9-10)', 'General_Science_Maths', 'Olympiad_Grade-10_General.pdf') },
  { src: 'Grade 10 OlympiaD F.pdf', rel: path.join('Secondary_School (Grades 9-10)', 'General_Science_Maths', 'Olympiad_Grade-10_Final.pdf') },
  { src: 'Grade 9 Olympiad ss.pdf', rel: path.join('Secondary_School (Grades 9-10)', 'Social_Studies', 'Olympiad_Grade-09_Social-Studies.pdf') },
  { src: 'grade 10 ss olympiad.pdf', rel: path.join('Secondary_School (Grades 9-10)', 'Social_Studies', 'Olympiad_Grade-10_Social-Studies.pdf') },
  { src: 'GRADE 11.pdf', rel: path.join('Senior_Secondary (Grades 11-12)', 'Olympiad_Grade-11.pdf') },
  { src: 'GRADE 12 OLYMPIAD.pdf', rel: path.join('Senior_Secondary (Grades 11-12)', 'Olympiad_Grade-12.pdf') }
];

for (const destRoot of targets) {
  console.log(`Setting up target: ${destRoot}`);
  for (const item of mapping) {
    const sourceFile = path.join(src, item.src);
    const targetFile = path.join(destRoot, item.rel);
    const targetDir = path.dirname(targetFile);

    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }

    if (fs.existsSync(sourceFile)) {
      fs.copyFileSync(sourceFile, targetFile);
      console.log(`✓ Copied: ${item.src} -> ${item.rel}`);
    } else {
      console.error(`✗ Source file not found: ${sourceFile}`);
    }
  }
}

console.log('Finished organizing all PDFs successfully!');
