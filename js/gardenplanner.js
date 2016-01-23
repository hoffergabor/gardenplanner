/**
 * List all calendars of the client
 */
function listCalendars() {
  var request = gapi.client.calendar.calendarList.list({
    'maxResults': 10
  });

  var gardenPlannerExists = false;
  var gardenPlannerCalendarId = '';

  request.execute(function(resp) {
    var calendars = resp.items;
    console.log('User calendars:');

    if (calendars.length > 0) {
      for (i = 0; i < calendars.length; i++) {
        var calendar = calendars[i];
        console.log(calendar.summary + '-' + calendar.id);
        if (calendar.summary == 'GardenPlanner') {
          gardenPlannerExists = true;
          gardenPlannerCalendarId = calendar.id;
        }
      }
    } else {
      console.warn('No calendars found.');
    }

    if (gardenPlannerExists == false) {
      insertGardenPlannerCalendar();
    }
    else {
      console.log('GardenPlanner was already there - setting Events');
      /*insertTestEvent(gardenPlannerCalendarId);*/
      listGardenPlannerEvents(gardenPlannerCalendarId);
      getPublicCalendars(plants);
    }

  });
  
}

/**
 * Inserts the GardenPlanner calendar
 */
function insertGardenPlannerCalendar() {
  var request = gapi.client.calendar.calendars.insert({
    'summary': 'GardenPlanner',
    'timeZone': 'Europe/Budapest'
  });

  request.execute(function(resp) {
      console.log('Added GardenPlanner - setting events');
      console.log(resp.summary + '-' + resp.id);
      /*insertTestEvent(resp.id);*/
      listGardenPlannerEvents(gardenPlannerCalendarId);
      getPublicCalendars(plants);
  });

}

/**
 * Listing all GardenPlanner events
 */
function listGardenPlannerEvents(gardenPlannerCalendarId) {
  var request = gapi.client.calendar.events.list({
    'calendarId': gardenPlannerCalendarId
  });

  request.execute(function(resp) {
    var events = resp.items;
    console.log('GardenPlanner Events:');

    if (events.length > 0) {
      for (i = 0; i < events.length; i++) {
        var event = events[i];
        console.log(event.summary + '-' + event.id);
      }
    } else {
      console.warn('No events found in GardenPlanner.');
    }
  });

}

/**
 * Fetching public calendars from the DB
 */
function getPublicCalendars(plants) {
  displayCategory("Konyhakerti növények","konyhakert");
  plants({category:"Konyhakert"}).each(function (plant) {
   console.log('Fetched from DB - ' + plant.name);
   displayPlant(plant,"#konyhakert");
  });
  displayCategory("Fűszernövények","fuszernoveny");
  plants({category:"Fűszernövény"}).each(function (plant) {
   console.log('Fetched from DB - ' + plant.name);
   displayPlant(plant,"#fuszernoveny");
  });
}

/**
 * Displaying a plant category
 */
function displayCategory(categoryname,category) {
  $( "#plantList" ).append('<h3>' + categoryname + '</h3><ul id=\"' + category + '\"></ul>');
}

/**
 * Displaying a plant on the canvas
 */
function displayPlant(plant,category) {
  $( category ).append('<li class=\"col-lg-3 col-md-4 col-sm-6 col-xs-12\"><input type=\"checkbox\" id=\"' + plant.name + '\" value=\"' + plant.name + '\"><label for=\"' + plant.name + '\"><img src=\"' + plant.img + '\"/><name>' + plant.name + '</name></label></li>');
}

/**
 * Importing a public calendar's events
 */
function importEvent(event,calendarId) {
  var request = gapi.client.calendar.events.import({
    'calendarId': calendarId,
    'iCalUID': event.iCalUID,
    'start': event.start,
    'end': event.end,
    'summary': event.summary,
    'supportsAttachments': true,
    'attachments': event.attachments
  });

  request.execute(function(resp) {
      console.log('Imported event - ' + resp.summary);
  });

}

/**
 * Get the first word from the event name (to determine what plants are added already)
 */
function getFirstWord(string) {
  return string.substr(0, string.indexOf(" "));
}


/**
 * Append a pre element to the body containing the given message
 * as its text node.
 *
 * @param {string} message Text to be placed in pre element.
 */
function appendPre(message) {
  var pre = document.getElementById('output');
  var textContent = document.createTextNode(message + '\n');
  pre.appendChild(textContent);
}