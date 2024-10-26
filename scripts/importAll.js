const { exec } = require('child_process');

console.log('Importing notes...');
exec('node scripts/importNotes.js', (error, stdout, stderr) => {
  if (error) {
    console.error(`Error importing notes: ${error}`);
    return;
  }
  console.log('Notes imported successfully.');
  console.log(stdout);

  console.log('Importing vocabulary...');
  exec('node scripts/importVocabulary.js', (error, stdout, stderr) => {
    if (error) {
      console.error(`Error importing vocabulary: ${error}`);
      return;
    }
    console.log('Vocabulary imported successfully.');
    console.log(stdout);
  });
});
