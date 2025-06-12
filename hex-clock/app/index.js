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

let color = "yellow";

// Update the clock every second
clock.granularity = "minutes";

// Get a handle on the <text> elements
let topBox = document.getElementById("topBox");
let bottomBox = document.getElementById("bottomBox");
let stepsBarOutline = document.getElementById("stepsBarOutline");
let stepsProgressBar = document.getElementById("stepsProgressBar");
let dateLabel = document.getElementById("dateLabel");
const amPmLabel = document.getElementById("amPmLabel");
const hexLabel = document.getElementById("hexLabel");
const digitalClockLabel = document.getElementById("digitalClockLabel");
let hourHand = document.getElementById("hourHand");
let minuteHand = document.getElementById("minuteHand");
let clockHourHand = document.getElementById("clockHourHand");
let clockMinuteHand = document.getElementById("clockMinuteHand");
let clockCenter = document.getElementById("clockCenter");
const stepCountLabel = document.getElementById("stepCountLabel");

const batteryLabel = document.getElementById("batteryLabel");
const batteryIcon = document.getElementById("batteryIcon");
const tempLabel = document.getElementById("tempLabel");

/**
 * Update the display of clock values.
 * @param {*} evt 
 */
clock.ontick = (evt) => {
  updateDateField(evt);

  amPmDisplay(evt);

  // get time information from API
  let todayDate = evt.date;
  let rawHours = todayDate.getHours();

  let hours;
  if (preferences.clockDisplay === "12h") {
    // 12 hour format
    hours = rawHours % 12 || 12;
  } else {
    // 24 hour format
    hours = rawHours;
  }

  let mins = todayDate.getMinutes();

  // display time on main digital clock
  digitalClockLabel.text = `${decimalToHexString(hours)}:${decimalToHexString(mins)}`;

  updateColor();
  updateAnalogClock();
  updateActivity();
  updateBattery();
};

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
    stepCountLabel.text = getSteps().formatted;
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
  const defaultGoal = 10000;

  let steps = activity.adjusted["steps"];

  if (steps == null || steps == undefined) {
    steps = 0;
  } else if (steps > goals.steps) {
    steps = goals.steps;
  }

  let stepGoal = goals.steps;

  // validate steps goal value
  if (stepGoal == null || stepGoal == undefined || stepGoal < 1) {
    // if there was a problem, use default value
    stepGoal = defaultGoal;
  }

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
    batteryLabel.text = battery.chargeLevel + percentSign;
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
 * @param {*} evt 
 */
function amPmDisplay(evt) {
    let rawHours = evt.date.getHours();

    if (rawHours < 12) {
        amPmLabel.text = "AM";
      } else {
        amPmLabel.text = "PM";
      }
}

/**
 * Sets current date in GUI. 
 * @param {*} evt 
 */
function updateDateField(evt) {
    let day = getDayField(evt);
    let dayOfMonth = evt.date.getDate();
    let month = getMonth(evt);
    let year = evt.date.getUTCFullYear();

    dateLabel.text =  `${day}` + " | " +  `${month}` + " " + `${dayOfMonth}` + ", " + `${year}`;
}

/**
 * Gets the current month.
 * @param {*} evt 
 * @returns 
 */
function getMonth(evt) {
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
  return monthNames[evt.date.getMonth()];
}

/**
 * Updates day of week displayed. 
 * @param {*} evt 
 * @returns 
 */
function getDayField(evt) {
    const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    let index = evt.date.getDay();
    return dayNames[index];
}

/**
 * Receive and process new tempature data. 
 */
newfile.initialize(data => {
    if (appbit.permissions.granted("access_location")) {
      
      data = units.temperature === "C" ? data : toFahrenheit(data);
      let degreeSymbol = "\u00B0";
      let lettertMarker = units.temperature === "C" ? `C` : `F`;
      
      // set values in GUI
      tempLabel.text = `${data.temperature}` + degreeSymbol + lettertMarker;
    } else {
      tempLabel.text = "----";
    }
  });
  
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
