import clock from "clock";
import * as document from "document";
import { me as appbit } from "appbit";
import { preferences } from "user-settings";

// Update the clock every second
clock.granularity = "minutes";

// Get a handle on the <text> elements
const clockLabel = document.getElementById("clockLabel");
let hourHand = document.getElementById("hourHand");
let minuteHand = document.getElementById("minuteHand");


/**
 * Update the display of clock values.
 * @param {*} evt 
 */
clock.ontick = (evt) => {

    // get time information from API
    let todayDate = evt.date;
    let rawHours = todayDate.getHours();

    // 12 hour format
    let hours = rawHours % 12 || 12;

    let mins = todayDate.getMinutes();

    // convert to hex
    let dhours = hours.toString(16);
    let dmins = mins.toString(16);


    // display time on main clock
    clockLabel.text = `${decimalToHexString(hours)}:${decimalToHexString(mins)}`;

    updateClock();
};

/**
 * Converts a decimal number to a hexadecimal number. 
 * @param {*} number 
 * @returns 
 */
function decimalToHexString(number) {
  return number.toString(16).toUpperCase();
}

  
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

  /**
 * Rotates the clock hands to show the curent time.
 */
function updateClock() {
    let today = new Date();
    let hours = today.getHours() % 12;
    let mins = today.getMinutes();
    let secs = today.getSeconds();
  
    hourHand.groupTransform.rotate.angle = hoursToAngle(hours, mins);
    minuteHand.groupTransform.rotate.angle = minutesToAngle(mins);
  }

  
/**
 * Returns an angle (0-360) for the current hour in the day.
 * Also adjust the hour hand for minutes past the hour.
 * @param {*} hours
 * @param {*} minutes
 * @returns
 */
function hoursToAngle(hours, minutes) {
    let hourAngle = (360 / 12) * hours;
    let minAngle = (360 / 12 / 60) * minutes;
    return hourAngle + minAngle;
  }
  
  /**
   * Returns an angle (0-360) for minutes
   * @param {*} minutes
   * @returns
   */
  function minutesToAngle(minutes) {
    return (360 / 60) * minutes;
  }