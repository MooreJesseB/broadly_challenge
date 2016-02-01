var Average = require('./Average');
var firstArg = process.argv[2];

console.log("Getting the average class size...");

if (typeof firstArg === 'number') {
  Average.start(firstArg);
} else if (firstArg === "--notes") {
  Average.onlyLogNotes();
} else {
  Average.start();
}