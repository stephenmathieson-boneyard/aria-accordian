
var Accordian = require('aria-accordian');

describe('aria-accordian', function () {

  var accordian;

  var isFocusable = require('is-focusable');

  function assert(expr, msg) {
    if (!expr) throw new Error(msg || 'shit broke');
  }

  // TODO clean this up and move into its own component
  function fire(element, type, augment) {
    augment = augment || {};

    var e = document.createEvent
      ? document.createEvent('HTMLEvents')
      : document.createEventObject();

    for (var a in augment) {
      if (a === 'which') {
        e.keyCode = augment[a];
      }
      e[a] = augment[a];
    }

    if (e.initEvent) {
      e.initEvent(type, true, true);
    }

    element.dispatchEvent
      ? element.dispatchEvent(e)
      : element.fireEvent('on' + type, e);
  }

  before(function () {
    accordian = new Accordian('#fixture');
  });

  it('should accept a (string) selector as an element', function () {
    var fixture = document.getElementById('fixture');
    assert(accordian.element === fixture, 'should query for the selector');
  });

  it('should set `role=application` on the given element', function () {
    var fixture = document.getElementById('fixture');
    assert(fixture.getAttribute('role') === 'application');
  });


  it('should map all tabs', function () {
    var tabs = document.querySelectorAll('#fixture .tab');
    assert(accordian.tabs.length === tabs.length, 'should have ' + tabs.length + ' tabs');
  });

  it('should give every tab an id', function () {
    for (var i = accordian.tabs.length - 1; i >= 0; i--) {
      assert(accordian.tabs[i].element.id.length > 1, 'tab # ' + i + ' should have an id');
    }
  });

  it('should set `role=tab` on every tab', function () {
    for (var i = accordian.tabs.length - 1; i >= 0; i--) {
      var tab = accordian.tabs[i].element;
      assert(tab.getAttribute('role') === 'tab', 'expecting tab # ' + i + ' to have `role=tab`');
    }
  });

  it('should associate every tab to its panel (aria-controls)', function () {
    for (var i = accordian.tabs.length - 1; i >= 0; i--) {
      var tab = accordian.tabs[i].element;
      var panel = accordian.panels[i].element;
      var controls = tab.getAttribute('aria-controls');
      assert(controls === panel.id, 'expecting tab # ' + i + ' to control panel # ' + i);
    }
  });

  it('should make every tab focusable', function () {
    for (var i = accordian.tabs.length - 1; i >= 0; i--) {
      assert(isFocusable(accordian.tabs[i].element), 'expecting tab # ' + i + ' to be focusable');
    }
  });

  describe('click events on tabs', function () {
    it('should toggle the associated panel\'s state', function (done) {
      function next(index) {
        var tab = accordian.tabs[index];
        var panel = accordian.panels[index];
        if (!tab) {
          assert(index === accordian.tabs.length, 'should check every tab');
          return done();
        }

        accordian.once('select', function (_panel) {
          assert(panel === _panel, 'should select the correct panel');
          index++;
          next(index);
        });

        fire(tab.element, 'click');
      }

      next(0);
    });
  });

  it('should map all panels', function () {
    var panels = document.querySelectorAll('#fixture .panel');
    assert(accordian.panels.length === panels.length, 'should have ' + panels.length + ' tabs');
  });

  it('should give every panel an id', function () {
    for (var i = accordian.panels.length - 1; i >= 0; i--) {
      assert(accordian.panels[i].element.id.length > 1, 'panel # ' + i + ' should have an id');
    }
  });

  it('should set `role=panel` on every panel', function () {
    for (var i = accordian.panels.length - 1; i >= 0; i--) {
      var panel = accordian.panels[i].element;
      assert(panel.getAttribute('role') === 'tabpanel', 'expecting panel # ' + i + ' to have `role=tabpanel`');
    }
  });

  it('should label every panel by its tab (aria-labelledby)', function () {
    for (var i = accordian.tabs.length - 1; i >= 0; i--) {
      var tab = accordian.tabs[i].element;
      var panel = accordian.panels[i].element;
      var labelledby = panel.getAttribute('aria-labelledby');
      assert(labelledby === tab.id, 'expecting tab # ' + i + ' to label panel # ' + i);
    }
  });

});
