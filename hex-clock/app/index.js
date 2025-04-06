import clock from "clock";
import * as document from "document";
import { me as appbit } from "appbit";
import { preferences } from "user-settings";

// Update the clock every second
clock.granularity = "minutes";

// Get a handle on the <text> elements
const clockLabel = document.getElementById("clockLabel");


/**
 * Update the display of clock values.
 * @param {*} evt 
 */
clock.ontick = (evt) => {
  
    // get time information from API
    let todayDate = evt.date;
    let rawHours = todayDate.getHours();
  
    let hours;
    if (preferences.clockDisplay === "12h") {
      // 12 hour format
      hours = rawHours % 12 || 12;
    } else {
      // 24 hour format
      if (rawHours > 9) {
        hours = zeroPad(rawHours);
      } else {
        hours = rawHours;
      }
    }
  
    let mins = todayDate.getMinutes();
    let displayMins = zeroPad(mins);
  
    // display time on main clock
    clockLabel.text = `${hours}:${displayMins}`;

  };

  
/**
 * Front appends a zero to an integer if less than ten.
 * @param {*} i 
 * @returns 
 */
function zeroPad(i) {
    if (i < 10) {
      i = "0" + i;
    }
    return i;
  }