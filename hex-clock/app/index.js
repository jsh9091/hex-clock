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
import { preferences } from "user-settings";

// Update the clock every second
clock.granularity = "minutes";

// Get a handle on the <text> elements
const digitalClockLabel = document.getElementById("digitalClockLabel");
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

    // display time on main digital clock
    digitalClockLabel.text = `${decimalToHexString(hours)}:${decimalToHexString(mins)}`;

    updateAnalogClock();
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