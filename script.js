/* 2. Incrementer & decrementer
-----------------------------------------------------------------------------------------
*/

$('[aria-controls="number"]').on('click', function() {
  var button = $(this);
  $('#number').val(function(i, oldval) {
    return button.is('[title*="add"]') ?
      parseInt(oldval, 10) + 10 :
      parseInt(oldval, 10) - 10;
  });
});

/* 3. Progressive collapsibles
-----------------------------------------------------------------------------------------
*/

$('.collapsible h3').each(function() {

  var $this = $(this);

  // create unique id for a11y relationship

  var id = 'collapsible-' + $this.index();

  // wrap the content and make it focusable

  $this.nextUntil('h3').wrapAll('<div id="'+ id +'" aria-hidden="true">');
  var panel = $this.next();

  // Add the button inside the <h2> so both the heading and button semanics are read

  $this.wrapInner('<button aria-expanded="false" aria-controls="'+ id +'">');
  var button = $this.children('button');

  // Toggle the state properties

  button.on('click', function() {
    var state = $(this).attr('aria-expanded') === 'false' ? true : false;
    $(this).attr('aria-expanded', state);
    panel.attr('aria-hidden', !state);
  });

});

/* 4. Tab Interface
-----------------------------------------------------------------------------------------
*/

// The class for the container div

var $container = '.tab-interface';

// The setup

$($container +' ul').attr('role','tablist');
$($container +' [role="tablist"] li').attr('role','presentation');
$('[role="tablist"] a').attr({
    'role' : 'tab',
    'tabindex' : '-1'
});

// Make each aria-controls correspond id of targeted section (re href)

$('[role="tablist"] a').each(function() {
  $(this).attr(
    'aria-controls', $(this).attr('href').substring(1)
  );
});

// Make the first tab selected by default and allow it focus

$('[role="tablist"] li:first-child a').attr({
    'aria-selected' : 'true',
    'tabindex' : '0'
});

// Make each section focusable and give it the tabpanel role

$($container +' section').attr({
  'role' : 'tabpanel'
});

// Make first child of each panel focusable programmatically

$($container +' section > *:first-child').attr({
    'tabindex' : '0'
});

// Make all but the first section hidden (ARIA state and display CSS)

$('[role="tabpanel"]:not(:first-of-type)').attr({
  'aria-hidden' : 'true'
});


// Change focus between tabs with arrow keys

$('[role="tab"]').on('keydown', function(e) {

  // define current, previous and next (possible) tabs

  var $original = $(this);
  var $prev = $(this).parents('li').prev().children('[role="tab"]');
  var $next = $(this).parents('li').next().children('[role="tab"]');
  var $target;

  // find the direction (prev or next)

  switch (e.keyCode) {
    case 37:
      $target = $prev;
      break;
    case 39:
      $target = $next;
      break;
    default:
      $target = false
      break;
  }

  if ($target.length) {
      $original.attr({
        'tabindex' : '-1',
        'aria-selected' : null
      });
      $target.attr({
        'tabindex' : '0',
        'aria-selected' : true
      }).focus();
  }

  // Hide panels

  $($container +' [role="tabpanel"]')
    .attr('aria-hidden', 'true');

  // Show panel which corresponds to target

  $('#' + $(document.activeElement).attr('href').substring(1))
    .attr('aria-hidden', null);

});

// Handle click on tab to show + focus tabpanel

$('[role="tab"]').on('click', function(e) {

  e.preventDefault();

  // remove focusability [sic] and aria-selected

  $('[role="tab"]').attr({
    'tabindex': '-1',
    'aria-selected' : null
    });

  // replace above on clicked tab

  $(this).attr({
    'aria-selected' : true,
    'tabindex' : '0'
  });

  // Hide panels

  $($container +' [role="tabpanel"]').attr('aria-hidden', 'true');

  // show corresponding panel

  $('#' + $(this).attr('href').substring(1))
    .attr('aria-hidden', null);

});

/* 5. Alert! You're offline
-----------------------------------------------------------------------------------------
*/

// Function to run when going offline

var offline = function() {
  if (!$('#status').hasClass('offline')) {
    $('#status')
      .attr('class', 'offline')
      .text('There\'s no internets. Go to the pub!');
  }
}

// Function to run when back online

var online = function() {
  if (!$('#status').hasClass('online')) {
    $('#status')
      .attr('class', 'online')
      .text('You are online.');
  }
}

// Test by trying to poll a file

function testConnection(url) {
    var xmlhttp = new XMLHttpRequest();
    xmlhttp.onload = function() {
      online();
    }
    xmlhttp.onerror = function() {
      offline();
    }
    xmlhttp.open("GET",url,true);
    xmlhttp.send();
}

// Loop the test every ten seconds for "test_resource.html"

function start() {
  rand = Math.floor(Math.random()*90000) + 20000;
  testConnection('http://localhost:3000/projects?fresh=' + rand);
  setTimeout(start, 20000);
}

// Start the first test

start();


/* 6. Warning dialog
-----------------------------------------------------------------------------------------
*/

$('[data-dialog-call]').on('click', function () {

  // define the dialog element
  var dialog = $('body > dialog');

  // record the trigger element
  var trigger = $(this).attr('id') ? $(this).attr('id') : 'trigger';

  // open dialog and add roles
  dialog
    .attr({
      'tabindex' : '0',
      'open' : 'true',
      'role' : 'alertdialog',
      'aria-labelledby' : 'd-message'
    });

  // retrieve custom close button wording, if any
  var closeText =  $(this).attr('data-dialog-response') ? $(this).attr('data-dialog-response') : 'close';

  // build the dialog markup
  dialog.wrapInner('<div><div role="document" tabindex="0"><button role="button">'+ closeText +'</button></div></div>');

  // Insert the message held in the trigger's [data-dialog-msg] attribute
  $('<p id="d-message">' + $(this).attr('data-dialog-call') + '</p>')
  .insertBefore(dialog.find('button:first-of-type'));

  // hide and make unfocusable all other elements
  $('body > *:not(dialog)').addClass('mod-hidden');

  // make last button in dialog the close button
  var close = dialog.find('button:last-of-type');
  $(close).focus();

  var content = dialog.find('[role="document"]');

  var closeDialog = function() {

    dialog.find('p').remove();

    $('body > *:not(dialog)').removeClass('mod-hidden');

    //set focus back to element that triggered dialog

    $('#' + trigger).focus();

    // If we manufactured the ID, remove it
    if ($('#' + trigger).attr('id') === 'trigger') {
      $('#' + trigger).attr('id', null);
    }

    // remove dialog attributes and empty dialog
    dialog.removeAttr('open role aria-describedby tabindex');

    dialog.empty();

    $(dialog).off('keypress.escape');

  }

  // run closeDialog() on click of close button
  $(close).on('click', function() {
    closeDialog();
  });

  // also run closeDialog() on ESC

  $(dialog).on('keypress.escape', function(e) {
    if (e.keyCode == 27) {
      closeDialog();
    }
  });

  // Refocus dialog if user tries to leave it

  $(close).on('keydown', function(e) {
    if ((e.keyCode || e.which) === 9) {
        content.focus();
        e.preventDefault();
    }
  });

});

/* 7. A toolbar widget
-----------------------------------------------------------------------------------------
*/



$('[role="toolbar"] [data-sort]').on('click', function() {

  if ($(this).attr('aria-pressed', 'false')) {

    var listToSort = $('#' + $(this).parent().attr('aria-controls'));
    var listItems = listToSort.children();
    var array = [];

    for (var i = 0, l = $(listItems).length; i < l; i++) {
      array.push($(listItems[i]).text());
    }

    if ($(this).attr('data-sort') === 'ascending') {
      array.sort();
      console.log(array);
    }

    if ($(this).attr('data-sort') === 'descending') {
      array.sort();
      array.reverse();
      console.log(array);
    }

    for(var i = 0, l = $(listItems).length; i < l; i++) {
      listItems[i].innerHTML = array[i];
    }

    $(this).siblings().attr('aria-pressed', 'false');
    $(this).attr('aria-pressed', 'true');

  }

});

$('[role="toolbar"] [data-sort]').on('keydown', function(e) {

  var $newButton;
  var $nextButton = $(this).next();
  var $prevButton = $(this).prev();
  var $listToSort = $('#' + $(this).parent().attr('aria-controls'));

  switch (e.keyCode) {
    case 37:
      $newButton = $prevButton;
      break;
    case 39:
      $newButton = $nextButton;
      break;
    default:
      $newButton = false;
      break;
  }

  if ($newButton.length) {
    $newButton.focus();
  }

  if (e.keyCode === 9) {
    if (!e.shiftKey) {
      e.preventDefault();
      $listToSort.focus();
    }
  }

});

/* 9. Simple dropdowns
-----------------------------------------------------------------------------------------
*/

$('[role="navigation"] ul ul').prev('a')
  .attr('aria-haspopup', 'true')
  .append('<span aria-hidden="true"> &#x25be;</span>');

var showSubmenu = function(dropdown) {
  dropdown.attr('aria-hidden', 'false');
};

var hideSubmenu = function(dropdown) {
  dropdown.attr('aria-hidden', 'true');
};

$('.with-dropdowns > li > a').on('focus', function(e) {
  hideSubmenu($('[aria-label="submenu"]'));
});

$('[aria-haspopup]').on('click', function(e) {
  var submenu = $(this).next();
  showSubmenu(submenu);
  //$(submenu).find('li:first-child a').focus();
  return false;
});

$('[aria-haspopup]').hover(function() {
  showSubmenu($(this).next());
  $(this).off('click');
});

$('[aria-haspopup]').parents('li').mouseleave(function() {
  hideSubmenu($(this).find('[aria-label="submenu"]'));
});
