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
      listGardenPlannerSharedEvents(gardenPlannerCalendarId);
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
      listGardenPlannerSharedEvents(gardenPlannerCalendarId);
  });

}

/**
 * TODO: REMOVE - Inserting a test event
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
 * Listing all GardenPlannerShared public events
 */
function listGardenPlannerSharedEvents(gardenPlannerCalendarId) {
  var request = gapi.client.calendar.events.list({
    'calendarId': '2vl1lt3klk77dcfhhu93edl34o@group.calendar.google.com'
  });

  request.execute(function(resp) {
    var events = resp.items;
    console.log('GardenPlannerShared Events:');

    if (events.length > 0) {
      for (i = 0; i < events.length; i++) {
        var event = events[i];
        console.log(event.summary);
        importEvent(event,gardenPlannerCalendarId)
      }
    } else {
      console.warn('No events found in GardenPlannerShared.');
    }
  });

}

/**
 * Listing all GardenPlannerShared public events
 */
function importEvent(event,gardenPlannerCalendarId) {
  var request = gapi.client.calendar.events.import({
    'calendarId': gardenPlannerCalendarId,
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