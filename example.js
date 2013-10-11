var Accordian = require('a11y-accordian');

var accordian = new Accordian('.accordian', {
  tab: '.tab',
  panel: '.panel',
  selected: 'selected'
});

accordian.on('ready', function () {
  console.log('accordian is setup');
});

accordian.on('select', function (panel) {
  console.log('selected', panel);
});

accordian.on('deselect', function (panel) {
  console.log('deselected', panel);
});

