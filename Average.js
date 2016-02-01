'use strict';

var request = require('request');
var async = require('async');

var MIN_AGE = 25;

function Average() {
  this.baseUrl = 'http://challenge.broadly.com/';
  this.doLogNotes = false;
  this.minAge = MIN_AGE;
}

Average.prototype.start = function(minAge) {
  var self = this;
  var start = new Date();

  console.log("Start Time", start);

  if (minAge) {
    this.minAge = minAge;
  }

  request(this.baseUrl, function(error, response, body) {
    var data = JSON.parse(body);

    if (data.url) {
      request(data.url, function(error, response, body) {
        var data = JSON.parse(body);

        if (data.classes) { 

          if (self.doLogNotes) {
            data.classes.forEach(function(aClass) {
              request(aClass, function(error, reponse, body) {
                var data = JSON.parse(body);
                self.processClass(data);
              });
            });

          } else {
            async.map(data.classes, function(aClass, callback) {
              request(aClass, function(error, response, body) {
                var data = JSON.parse(body);
                self.processClass(data, function(studentIds) {
                  callback(null, studentIds.length);
                });
              });
            }, function(err, results) {

              console.log("\nAverage class size: ", Math.round(results.reduce(function(prev, current) {
                return prev + current;
              }) / data.classes.length), "students\n");

              console.log("End Time", new Date());
              console.log("Elapsed Time", new Date().getTime() - start.getTime(), "miliseconds");
            });
          }
        }
      });
    }
  });
};

Average.prototype.processClass = function(data, callback) {
  var self = this;

  this.doLogNotes && this.logNote(data);

  if (data.next) {
    request(data.next, function(error, response, body) {
      var data = JSON.parse(body);

      if (self.doLogNotes) {
        self.logNote(data);
        self.processClass(data);
      }

      self.processClass(data, function(students) {
        callback(data.students.filter(function(student) {
          return student.age >= self.minAge;
        }).map(function(student) {
          return student.id;
        }).filter(function(student) {
          return students.indexOf(student.id) === -1;
        }).concat(students));
      });
    });

  } else {
    if (this.doLogNotes) {
      return;
    }

    callback(data.students.filter(function(student) {
      return student.age >= self.minAge;
    }).map(function(student) {
      return student.id;
    }));  
  }
};

Average.prototype.logNote = function(data) {
  console.log("Note:", data.note);
};

Average.prototype.onlyLogNotes = function() {
  this.doLogNotes = true;
  this.start();
};

module.exports = new Average();
