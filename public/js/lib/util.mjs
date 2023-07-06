/**
 * Verifies if a value represents an integer
 * @param {string} x
 * @return {boolean}
 */
function isNonEmptyString( x) {
    return typeof (x) === "string" && x.trim() !== "";
  }
  
  /**
   * Return the next year value (e.g. if now is 2013 the function will return 2014)
   * @return {number}  the integer representing the next year value
   */
  function nextYear() {
    const date = new Date();
    return (date.getFullYear() + 1);
  }
  
  /**
   * Convert Firestore timeStamp object to Date string in format YYYY-MM-DD
   * @param {object} timeStamp A Firestore timeStamp object
   */
  function date2IsoDateString (timeStamp) {
    const dateObj = timeStamp.toDate();
    let  y = dateObj.getFullYear(),
      m = "" + (dateObj.getMonth() + 1),
      d = "" + dateObj.getDate();
    if (m.length < 2) m = "0" + m;
    if (d.length < 2) d = "0" + d;
    return [y, m, d].join("-");
  }
  
  /**
   * Verifies if a value represents an integer or integer string
   * @param {string} x
   * @return {boolean}
   */
  function isIntegerOrIntegerString( x) {
    return typeof (x) === "number" && x.toString().search(/^-?[0-9]+$/) === 0 ||
      typeof (x) === "string" && x.search(/^-?[0-9]+$/) === 0;
  }
  
  /**
   * Creates a typed "data clone" of an object
   * @param {object} obj
   */
  function cloneObject( obj) {
    const clone = Object.create( Object.getPrototypeOf( obj));
    for (const p in obj) {
      if (obj.hasOwnProperty(p) && typeof obj[p] !== "object") clone[p] = obj[p];
    }
    return clone;
  }
  
  /** Create option elements from a map of objects
   * and insert them into a selection list element
   *
   * @param {object} objColl  A collection (list or map) of objects
   * @param {object} selEl  A select(ion list) element
   * @param {string} stdIdProp  The standard identifier property
   * @param {string} displayProp [optional]  A property supplying the text
   *                 to be displayed for each object
   */
  function fillSelectWithOptions( objColl, selEl, stdIdProp, displayProp) {
    if (Array.isArray(objColl)) {
      for (const obj of objColl) {
        const optionEl = document.createElement("option");
        optionEl.value = obj[stdIdProp];
        optionEl.text = displayProp ? obj[displayProp] : obj[stdIdProp];
        selEl.add(optionEl, null)
      }
    } else {
      for (const key of Object.keys( objColl)) {
        const obj = objColl[key];
        const optionEl = document.createElement("option");
        optionEl.value = obj[stdIdProp];
        optionEl.text = displayProp ? obj[displayProp] : obj[stdIdProp];
        selEl.add(optionEl, null)
      }
    }
  }
  
  /**
   * Show progress bar element
   * @param {object} progressEl
   */
  function showProgressBar (progressEl) {
    progressEl.hidden = false;
  }
  
  /**
   * Hide progress bar element
   * @param {object} progressEl
   */
  function hideProgressBar (progressEl) {
    progressEl.hidden = true;
  }
  
  export { isNonEmptyString, nextYear, isIntegerOrIntegerString, cloneObject,
    fillSelectWithOptions, showProgressBar, hideProgressBar };
  