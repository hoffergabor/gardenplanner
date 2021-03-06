/* what is the Id of the user's GardenPlanner calendar */
var gardenPlannerCalendarId = '';

/* List all calendars of the client */
function listCalendars() {
  var request = gapi.client.calendar.calendarList.list({
    'maxResults': 10
  });

  var gardenPlannerExists = false;

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
      listGardenPlannerEvents();
    }
  });

}

/* Inserts the GardenPlanner calendar */
function insertGardenPlannerCalendar() {
  var request = gapi.client.calendar.calendars.insert({
    'summary': 'GardenPlanner',
    'timeZone': 'Europe/Budapest'
  });

  request.execute(function(resp) {
      console.log(resp.summary + ' added - ' + resp.id);
      gardenPlannerCalendarId = resp.id;
      listGardenPlannerEvents();
  });

}

/* Array to hold all existing plantnames in */
var plantsArray = [];

/* Listing all GardenPlanner events */
function listGardenPlannerEvents() {
  var request = gapi.client.calendar.events.list({
    'calendarId': gardenPlannerCalendarId
  });

  request.execute(function(resp) {
    var events = resp.items;
    console.log('GardenPlanner Events:');
    if (events.length > 0) {
      for (i = 0; i < events.length; i++) {
        var event = events[i];
        var eventgroup = getFirstWord(event.summary);
        if (plantsArray.indexOf(eventgroup) == -1) {
          plantsArray.push(eventgroup);
        };
      }
    } else {
      console.warn('No events found in GardenPlanner.');
    }
    console.log('Plants in user calendar: ' + plantsArray);
    getPublicCalendars(plants);
  });

}

/* Fetching public calendars from the DB */
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

/* Displaying a plant category */
function displayCategory(categoryname,category) {
  $( "#plantList" ).append('<h3>' + categoryname + '</h3><ul id=\"' + category + '\"></ul>');
}

/* Displaying a plant on the canvas */
function displayPlant(plant,category) {
  if (plantsArray.indexOf(plant.name) > -1) {
    checked = "checked";
  }
  else {
    checked = "";
  }
  $( category ).append('<li class=\"col-lg-3 col-md-4 col-sm-6 col-xs-12\"><input type=\"checkbox\" id=\"' + plant.name + '\" value=\"' + plant.name + '\" ' + checked + ' class=\"plantcheckbox\"><label class=\"plantcheck\" onclick=\"$(this).removeClass().addClass(\'pulse animated\').one(\'webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend\',function(){$(this).removeClass();});\" for=\"' + plant.name + '\"><img src=\"' + plant.img + '\"/><name>' + plant.name + '</name></label></li>');
}

function saveToCalendar() {
  console.log('Preferred time - ' + $('.whentogarden').find(":selected").text());
  $('input:checkbox.notification').each(function () {
       if (this.checked) {
         console.log('Notify - ' + $(this).val());
       }
       else {
         console.log('Don\'t notify - ' + $(this).val());
       }
  });
  $('input:checkbox.plantcheckbox').each(function () {
       if (this.checked) {
         importGardenPlannerEvents($(this).val());
       }
       else {
         console.log('Attempting to delete - ' + $(this).val());
         deleteGardenPlannerEvents($(this).val());
       }
  });
}

/* Import GardenPlanner events */
function importGardenPlannerEvents(eventName) {
  calendarId = plants({name:eventName}).first().calendarId;
  console.log('Attempting to import ' + eventName + ' from ' + calendarId);
  var request = gapi.client.calendar.events.list({
    'calendarId': calendarId
  });

  request.execute(function(resp) {
    var events = resp.items;
    if (events.length > 0) {
      for (i = 0; i < events.length; i++) {
        var event = events[i];
        importEvent(event);
      }
    } else {
      console.warn('No events to import.');
    }
  });

}

/* Delete GardenPlanner events */
function deleteGardenPlannerEvents(eventName) {
  var request = gapi.client.calendar.events.list({
    'calendarId': gardenPlannerCalendarId
  });

  var eventnamefirst = getFirstWord(eventName);

  request.execute(function(resp) {
    var events = resp.items;
    if (events.length > 0) {
      for (i = 0; i < events.length; i++) {
        var event = events[i];
        var eventfirst = getFirstWord(event.summary);
        if (eventfirst == eventnamefirst) {
          deleteEvent(event);
        };
      }
    } else {
      console.warn('No events to delete.');
    }
  });

}

/*  
  TODO 
  - (done) getting form details (selects and checkboxes)
  - (done) go through all checkboxes
  - (done) select what is needed to remove/import elements and set notif.
  - (done) delete unselected plants' events if any
  - (done) import selected plants' events
  - reset calendar notifications
  - show progress
  - show end message (success/failure)
*/

/* Imports a calendar event */
function importEvent(event) {
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

/* Deletes an event */
function deleteEvent(event) {
  console.log('Deleting ' + event.summary + ' - ' + event.id + ' from ' + gardenPlannerCalendarId);
  var request = gapi.client.calendar.events.delete({
    'calendarId': gardenPlannerCalendarId,
    'eventId': event.id
  });

  request.execute(function(resp) {
      console.log('Deleted event - ' + resp.summary);
  });

}

/* ADDITIONAL FUNCTIONS */

/* Get the first word from the event name */
function getFirstWord(string) {
  return (ret = string.substr(0, string.indexOf(" "))) ? ret : string;
}

/* Append a pre element to the body containing the given message as its text node. */
function appendPre(message) {
  var pre = document.getElementById('output');
  var textContent = document.createTextNode(message + '\n');
  pre.appendChild(textContent);
}

/* Handling opening of the info popup */
function handleOpenInfo(event) {
  $( ".overlay" ).removeClass( "hiddenoverlay" )
  $( ".infopopup" ).removeClass( "hiddeninfo" )
  return false;
}

/* Handling closing of the info popup */
function handleCloseInfo(event) {
  $( ".overlay" ).addClass( "hiddenoverlay" )
  $( ".infopopup" ).addClass( "hiddeninfo" )
  return false;
}