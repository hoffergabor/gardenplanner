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
      insertTestEvent(gardenPlannerCalendarId);
    }

  });
  
}

/**
 * Inserts the GardenPlanner calendar
 */
function insertGardenPlannerCalendar() {
  var request = gapi.client.calendar.calendars.insert({
    'summary': 'GardenPlanner'
  });

  request.execute(function(resp) {
      console.log('Added GardenPlanner - setting events');
      console.log(resp.summary + '-' + resp.id);
      insertTestEvent(resp.id);
  });

}

/**
 * Inserting a test event
 */
function insertTestEvent(gardenPlannerCalendarId) {
  var request = gapi.client.calendar.events.insert({
    'calendarId': gardenPlannerCalendarId,
    'summary': 'testEvent',
    'start': {
      'dateTime': '2016-01-14T10:00:00z',
      'timeZone': 'Europe/Budapest'
    },
    'end': {
      'dateTime': '2016-01-14T11:00:00z',
      'timeZone': 'Europe/Budapest'
    }
  });

  request.execute(function(resp) {
      console.log('Added a new event - ' + resp.summary);
  });

  listGardenPlannerEvents(gardenPlannerCalendarId);

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
      console.warn('No events found.');
    }
  });

}