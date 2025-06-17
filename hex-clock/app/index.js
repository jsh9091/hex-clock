/*
 * MIT License
 *
 * Copyright (c) 2025 Joshua Horvath
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

import clock from "clock";
import * as document from "document";
import { me as appbit } from "appbit";
import { today as activity, goals } from "user-activity";
import { preferences, units } from "user-settings";
import { battery } from "power";
import * as newfile from "./newfile";
import * as simpleSettings from "./simple/device-settings";

let color = "aqua";
let mode = "Hexadecimal";
let fullHex = false;
let dateLastTick
let temperatureCurrent;

// Update the clock every second
clock.granularity = "minutes";

// Get a handle on the SVG elements
const topBox = document.getElementById("topBox");
const bottomBox = document.getElementById("bottomBox");
const stepsBarOutline = document.getElementById("stepsBarOutline");
const stepsProgressBar = document.getElementById("stepsProgressBar");
const dateLabel = document.getElementById("dateLabel");
const amPmLabel = document.getElementById("amPmLabel");
const hexLabel = document.getElementById("hexLabel");
const digitalClockLabel = document.getElementById("digitalClockLabel");
const hourHand = document.getElementById("hourHand");
const minuteHand = document.getElementById("minuteHand");
const clockHourHand = document.getElementById("clockHourHand");
const clockMinuteHand = document.getElementById("clockMinuteHand");
const clockCenter = document.getElementById("clockCenter");
const stepCountLabel = document.getElementById("stepCountLabel");

const batteryLabel = document.getElementById("batteryLabel");
const batteryIcon = document.getElementById("batteryIcon");
const tempLabel = document.getElementById("tempLabel");

/**
 * Get and process settings changes.
 * @param {*} data 
 * @returns 
 */
function settingsCallback(data) {
  if (!data) {
    return;
  }

  if (data.color) {
    color = data.color;

    topBox.style.fill = color;
    bottomBox.style.fill = color;
    stepsProgressBar.style.fill = color;
    amPmLabel.style.fill = color;
    hexLabel.style.fill = color;
    digitalClockLabel.style.fill = color;
    clockHourHand.style.fill = color;
    clockMinuteHand.style.fill = color;
    clockCenter.style.fill = color;
  }
  
  if (mode == null) {
    // set default mode
    mode = "Hexadecimal"
  }

  if (data.numberMode) {
    mode = data.numberMode;
    updateModeDisplay();
  }
}
simpleSettings.initialize(settingsCallback);

/**
 * Update display for number mode changes. 
 */
function updateModeDisplay() {
  // resets
  fullHex = false;
  hexLabel.style.textDecoration = "none";
  digitalClockLabel.style.fontFamily = "FBNucleon-Bold";
  digitalClockLabel.style.fontSize = 90;
  digitalClockLabel.x = 91;
  digitalClockLabel.y = 188;

  switch (mode) {
    case "Hexadecimal":
      hexLabel.text = "Hex:"
      break;
    case "Standard Decimal":
      hexLabel.text = "Dec:"
      break;
    case "Full Hexadecimal":
      hexLabel.style.textDecoration = "underline";
      hexLabel.text = "Hex:"
      fullHex = true;
      break;
  }
  if (dateLastTick != undefined) {
    updateDateField();
    updateTimeDisplay();
  }
  updateActivity();
  updateBattery();
  if (temperatureCurrent != undefined) {
    updateTemperatureLabel();
  }
}

/**
 * Update the display of clock values.
 * @param {*} evt 
 */
clock.ontick = (evt) => {
  // get time information from API, and store globally
  dateLastTick = evt.date;

  updateDateField();
  amPmDisplay();
  updateTimeDisplay();
  updateColor();
  updateAnalogClock();
  updateActivity();
  updateBattery();
};

/**
 * Updates the main time display label. 
 */
function updateTimeDisplay() {
  
  let rawHours = dateLastTick.getHours();

  let hours;
  if (preferences.clockDisplay === "12h") {
    // 12 hour format
    hours = rawHours % 12 || 12;
  } else {
    // 24 hour format
    hours = rawHours;
  }

  let mins = dateLastTick.getMinutes();;
  
  if (mode === "Standard Decimal") {
    // display decimal time on main digital clock
    digitalClockLabel.text = `${hours}:${ zeroPad(mins)}`;
  } else {
    // display Hex time on main digital clock
    digitalClockLabel.text = `${decimalToHexString(hours)}:${decimalToHexString(mins)}`;
  }
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
 * Updates the color of the watch display. 
 */
function updateColor() {
  topBox.style.fill = color;
  stepsProgressBar.style.fill = color;
  amPmLabel.style.fill = color;
  hexLabel.style.fill = color;
  digitalClockLabel.style.fill = color;
  bottomBox.style.fill = color;
  clockHourHand.style.fill = color;
  clockMinuteHand.style.fill = color;
  clockCenter.style.fill = color;
}

/**
 * Converts a decimal number to a hexadecimal number. 
 * @param {*} number 
 * @returns 
 */
function decimalToHexString(number) {
  return number.toString(16).toUpperCase();
}

/**
 * Updates user physical activty displays. 
 */
function updateActivity() {
  // handle case of user permission for step counts is not there
  if (appbit.permissions.granted("access_activity")) {
    if (fullHex) {
      // display steps in hex
      stepCountLabel.text = decimalToHexString(getSteps().raw)
    } else {
      // display steps with normal decimal numbers
      stepCountLabel.text = getSteps().formatted;
    }
    
    updateStepsProgressBar();
    stepsBarOutline.style.fill = "black";

  } else {
    stepCountLabel.text = "-----";
    stepsBarOutline.style.fill = color; 
  }
}

/**
 * Updates the steps goal progress bar. 
 */
function updateStepsProgressBar() {
  const barMaxWidth = 230;

  let steps = getSteps().raw;
  let stepGoal = getValidatedStepGoal();

  const stepGoalPercentage = steps * 100 / stepGoal;
  let barWidth = (stepGoalPercentage / 100) * barMaxWidth;

  // bar should not exceed max width
  barWidth = barWidth > barMaxWidth ? barMaxWidth : barWidth;

  stepsProgressBar.width = barWidth;
}

/**
 * Rotates the clock hands to show the curent time.
 */
function updateAnalogClock() {
    let today = new Date();
    let hours = today.getHours() % 12;
    let mins = today.getMinutes();
  
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

/**
 * Gets and formats user step count for the day.
 * @returns 
 */
function getSteps() {
    let val = activity.adjusted.steps || 0;
    return {
      raw: val,
      formatted:
        val > 999
          ? `${Math.floor(val / 1000)},${("00" + (val % 1000)).slice(-3)}`
          : val,
    };
}

/**
 * Gets step goal and validate the value. 
 * If there is a problem a default value is returned.
 * @returns 
 */
function getValidatedStepGoal() {
  const defaultGoal = 10000;
  let stepGoal = goals.steps;

  // validate steps goal value
  if (stepGoal == null || stepGoal == undefined || stepGoal < 1) {
    // if there was a problem, use default value
    stepGoal = defaultGoal;
  }
  return stepGoal;
}

/**
 * Update the displayed battery level. 
 * @param {*} charger 
 * @param {*} evt 
 */
battery.onchange = (charger, evt) => {
    updateBattery();
};

/**
 * Updates the battery battery icon and label.
 */
function updateBattery() {
    updateBatteryLabel();
    updateBatteryIcon();
}
  
/**
 * Updates the battery lable GUI for battery percentage. 
 */
function updateBatteryLabel() {
    let percentSign = "&#x25";
    if (fullHex) {
      // display battery percentage in hex 
      batteryLabel.text = decimalToHexString(battery.chargeLevel) + percentSign;
    } else {
      // display battery percentage with normal decimal numbers
      batteryLabel.text = battery.chargeLevel + percentSign;
    }
}

/**
 * Updates what battery icon is displayed. 
 */
function updateBatteryIcon() {
    const minFull = 70;
    const minHalf = 30;

    if (battery.charging) {
        batteryIcon.image = "battery-charging.png"
    } else if (battery.chargeLevel > minFull) {
        batteryIcon.image = "battery-full.png"
    } else if (battery.chargeLevel < minFull && battery.chargeLevel > minHalf) {
        batteryIcon.image = "battery-half.png"
    } else if (battery.chargeLevel < minHalf) {
        batteryIcon.image = "battery-low.png"
    }
}

/**
 * Updates display of AM and PM indicators. 
 */
function amPmDisplay() {
    let rawHours = dateLastTick.getHours();

    if (rawHours < 12) {
        amPmLabel.text = "AM";
      } else {
        amPmLabel.text = "PM";
      }
}

/**
 * Sets current date in GUI. 
 */
function updateDateField() {
    let day = getDayField(dateLastTick);
    let dayOfMonth = dateLastTick.getDate();
    let month = getMonth();
    let year = dateLastTick.getUTCFullYear();

    if (fullHex) {
      dayOfMonth = decimalToHexString(dayOfMonth);
      year = decimalToHexString(year);
    }

    dateLabel.text =  `${day}` + " | " +  `${month}` + " " + `${dayOfMonth}` + ", " + `${year}`;
}

/**
 * Gets the current month.
 * @returns 
 */
function getMonth() {
  const monthNames = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  return monthNames[dateLastTick.getMonth()];
}

/**
 * Updates day of week displayed. 
 * @returns 
 */
function getDayField() {
    const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    let index = dateLastTick.getDay();
    return dayNames[index];
}

/**
 * Receive and process new tempature data. 
 */
newfile.initialize(data => {
    if (appbit.permissions.granted("access_location")) {
      temperatureCurrent = units.temperature === "C" ? data : toFahrenheit(data);
      updateTemperatureLabel();
    }

    updateTemperatureLabel();
  });

  /**
   * Updates the temperature label. 
   */
  function updateTemperatureLabel() {
    if (appbit.permissions.granted("access_location")) {
      let degreeSymbol = "\u00B0";
      let lettertMarker = units.temperature === "C" ? `C` : `F`;
      
      // set values in GUI
      tempLabel.text = `${temperatureCurrent.temperature}` + degreeSymbol + lettertMarker;

      if (fullHex) {
        // display temperature in hex
        let tempValue = decimalToHexString(temperatureCurrent.temperature);
        tempLabel.text = `${tempValue}` + degreeSymbol + lettertMarker;
      } else {
        // display temperature in normal decimal numbers
        tempLabel.text = `${temperatureCurrent.temperature}` + degreeSymbol + lettertMarker;
      }
    } else {
      tempLabel.text = "----";
    }
  }
  
  /**
  * Convert temperature value to Fahrenheit
  * @param {object} data WeatherData
  */
  function toFahrenheit(data) {
    if (data.unit.toLowerCase() === "celsius") {
       data.temperature =  Math.round((data.temperature * 1.8) + 32);
       data.unit = "Fahrenheit";
    }
    return data
  }
