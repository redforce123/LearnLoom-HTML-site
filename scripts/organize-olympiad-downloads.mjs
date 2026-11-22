import fs from 'fs';
import path from 'path';

const srcDir = 'F:\\Chrome Downloads\\Olympiad Downloads';
const publicRoot = path.resolve('public/resources/Olympiad_Question_Bank');
const localBackupRoot = 'F:\\Chrome Downloads\\Olympiad Downloads\\Organized_Olympiad_Question_Bank';

const targets = [publicRoot, localBackupRoot];

// Precise mappings from downloads to standardized hierarchy
const copyPlan = [
  // Primary School (Grades 1-3)
  {
    src: 'Grade 1 cs.pdf',
    rel: path.join('Primary_School (Grades 1-3)', 'Olympiad_Grade-01_Computer-Science.pdf')
  },
  {
    src: 'Grade 2 CS.pdf',
    rel: path.join('Primary_School (Grades 1-3)', 'Olympiad_Grade-02_Computer-Science.pdf')
  },
  {
    src: 'Grade2 english.pdf',
    rel: path.join('Primary_School (Grades 1-3)', 'Olympiad_Grade-02_English.pdf')
  },
  {
    src: 'Grade 2 SS.pdf',
    rel: path.join('Primary_School (Grades 1-3)', 'Olympiad_Grade-02_Social-Studies.pdf')
  },
  {
    src: 'Grade 3 CS.pdf',
    rel: path.join('Primary_School (Grades 1-3)', 'Olympiad_Grade-03_Computer-Science.pdf')
  },
  {
    src: 'Grade 3 Hindi.pdf', // 10 pages updated
    rel: path.join('Primary_School (Grades 1-3)', 'Olympiad_Grade-03_Hindi.pdf')
  },
  {
    src: 'Grade 3 SS.pdf',
    rel: path.join('Primary_School (Grades 1-3)', 'Olympiad_Grade-03_Social-Studies.pdf')
  },

  // Primary School (Grades 4-5)
  {
    src: '4 English.pdf', // 10 pages updated final export
    rel: path.join('Primary_School (Grades 4-5)', 'Olympiad_Grade-04_English.pdf')
  },
  {
    src: '4 Hindi Olympiad.pdf', // 10 pages updated
    rel: path.join('Primary_School (Grades 4-5)', 'Olympiad_Grade-04_Hindi.pdf')
  },
  {
    src: 'Grade 5 CS.pdf',
    rel: path.join('Primary_School (Grades 4-5)', 'Olympiad_Grade-05_Computer-Science.pdf')
  },
  {
    src: 'Grade 5 Hindi.pdf',
    rel: path.join('Primary_School (Grades 4-5)', 'Olympiad_Grade-05_Hindi.pdf')
  },
  {
    src: '5 Social Science.pdf', // Oct 6 updated export
    rel: path.join('Primary_School (Grades 4-5)', 'Olympiad_Grade-05_Social-Studies.pdf')
  },

  // Middle School (Grades 6-8)
  {
    src: '6 CS Olympiad.pdf', // Oct 6 updated export, 13 pages
    rel: path.join('Middle_School (Grades 6-8)', 'Olympiad_Grade-06_Computer-Science.pdf')
  },
  {
    src: '6 Hindi Olympiad.pdf',
    rel: path.join('Middle_School (Grades 6-8)', 'Olympiad_Grade-06_Hindi.pdf')
  },
  {
    src: 'Grade 6 SS.pdf',
    rel: path.join('Middle_School (Grades 6-8)', 'Olympiad_Grade-06_Social-Studies.pdf')
  },
  {
    src: '7 English Olympiad.pdf',
    rel: path.join('Middle_School (Grades 6-8)', 'Olympiad_Grade-07_English.pdf')
  },
  {
    src: 'Grade 7 SS.pdf',
    rel: path.join('Middle_School (Grades 6-8)', 'Olympiad_Grade-07_Social-Studies.pdf')
  },
  {
    src: 'Grade 8 English Olympiad.pdf',
    rel: path.join('Middle_School (Grades 6-8)', 'Olympiad_Grade-08_English.pdf')
  },
  {
    src: 'Grade 8 SS.pdf',
    rel: path.join('Middle_School (Grades 6-8)', 'Olympiad_Grade-08_Social-Studies.pdf')
  }
];

for (const destRoot of targets) {
  console.log(`\n========================================`);
  console.log(`Setting up destination root: ${destRoot}`);
  for (const item of copyPlan) {
    const sourcePath = path.join(srcDir, item.src);
    const destPath = path.join(destRoot, item.rel);
    const destFolder = path.dirname(destPath);

    if (!fs.existsSync(destFolder)) {
      fs.mkdirSync(destFolder, { recursive: true });
    }

    if (fs.existsSync(sourcePath)) {
      fs.copyFileSync(sourcePath, destPath);
      const stat = fs.statSync(destPath);
      console.log(`✓ Copied: ${item.src} -> ${item.rel} (${(stat.size / 1024).toFixed(1)} KB)`);
    } else {
      console.error(`✗ Source file not found: ${sourcePath}`);
    }
  }
}

// Copy Grade 8 General into Middle_School (Grades 6-8)
const g8Old = path.join(publicRoot, 'Middle_School (Grade 8)', 'Olympiad_Grade-08.pdf');
const g8New = path.join(publicRoot, 'Middle_School (Grades 6-8)', 'Olympiad_Grade-08_General.pdf');
if (fs.existsSync(g8Old)) {
  const destDir = path.dirname(g8New);
  if (!fs.existsSync(destDir)) fs.mkdirSync(destDir, { recursive: true });
  fs.copyFileSync(g8Old, g8New);
  console.log(`✓ Copied existing Grade 8 General to Middle_School (Grades 6-8)/Olympiad_Grade-08_General.pdf`);
}

// Also copy all existing folders into localBackupRoot for a full mirror
const existingFolders = [
  'Primary_School (Grades 1-3)',
  'Primary_School (Grades 4-5)',
  'Middle_School (Grade 8)',
  'Middle_School (Grades 6-8)',
  'Secondary_School (Grades 9-10)',
  'Senior_Secondary (Grades 11-12)'
];

function copyRecursive(src, dest) {
  if (!fs.existsSync(src)) return;
  const stat = fs.statSync(src);
  if (stat.isDirectory()) {
    if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });
    for (const child of fs.readdirSync(src)) {
      copyRecursive(path.join(src, child), path.join(dest, child));
    }
  } else {
    fs.copyFileSync(src, dest);
  }
}

for (const folder of existingFolders) {
  const pSrc = path.join(publicRoot, folder);
  const pDest = path.join(localBackupRoot, folder);
  copyRecursive(pSrc, pDest);
}

console.log('\nAll files successfully organized and synchronized!');
