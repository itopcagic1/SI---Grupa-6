const { differenceInMilliseconds, addHours, subHours, isBefore } = require('date-fns');

function calculateTimeoutMilliseconds(termStartTime) {
  const now = new Date();
  
  const limit24h = addHours(now, 24);
  const limit2hBeforeTerm = subHours(new Date(termStartTime), 2);
  
  // Choose the deadline that happens earlier
  const actualDeadline = isBefore(limit24h, limit2hBeforeTerm) ? limit24h : limit2hBeforeTerm;
  
  const difference = differenceInMilliseconds(actualDeadline, now);
  
  return difference > 0 ? difference : 0; 
}

module.exports = {
  calculateTimeoutMilliseconds
};