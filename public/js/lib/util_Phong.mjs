/**
 * @fileOverview  Defines utility procedures/functions
 * @author Gerd Wagner
 * @author Juan-Francisco Reyes
 */

/**
 * Verifies if a value represents an integer
 * @param x
 * @returns {boolean}
 */
function isNonEmptyString (x) {
    return typeof(x) === "string" && x.trim() !== "";
  }
  /**
   * Serialize a Date object as an ISO date string
   * @return  {string}
   */
  function createIsoDateString(d) {
    return d.toISOString().substring(0,10);
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
  
  // *************** D O M Related ****************************************
  /**
   * Create a Push Button
   * @param {string} txt [optional]
   * @return {object}
   */
  function createPushButton( txt) {
    const pB = document.createElement("button");
    pB.type = "button";
    if (txt) pB.textContent = txt;
    return pB;
  }
  /**
   * Create a DOM option element
   *
   * @param {string} val
   * @param {string} txt
   * @param {string} classValues [optional]
   * @return {object}
   */
  function createOption( val, txt, classValues) {
    const el = document.createElement("option");
    el.value = val;
    el.text = txt;
    if (classValues) el.className = classValues;
    return el;
  }
  /**
   * Create a time element from a Date object
   *
   * @param {object} d
   * @return {object}
   */
  function createTimeElem(d) {
    const tEl = document.createElement("time");
    tEl.textContent = d.toLocaleDateString();
    tEl.datetime = d.toISOString();
    return tEl;
  }
  /**
   * Create a list element from an map of objects
   *
   * @param {object} et  An entity table
   * @param {string} displayProp  The object property to be displayed in the list
   * @return {object}
   */
  
  /**
   * * Convert a map of values into a UL element
   * */
  function createListFromMap(et, displayProp) {
    const listEl = document.createElement("ul");
    fillListFromMap( listEl, et, displayProp);
    return listEl;
  }
  /**
   * Fill a list element with items from an entity table
   *
   * @param {object} listEl  A list element
   * @param {object} et  An entity table
   * @param {string} displayProp  The object property to be displayed in the list
   */
  function fillListFromMap(listEl, et, displayProp) {
    const keys = Object.keys( et);
    // delete old contents
    listEl.innerHTML = "";
    // create list items from object property values
    for (const key of keys) {
      const listItemEl = document.createElement("li");
      listItemEl.textContent = et[key][displayProp];
      listEl.appendChild( listItemEl);
    }
  }
  /**
   * Fill a select element with option elements created from a
   * map of objects
   *
   * @param {object} selectEl  A select(ion list) element
   * @param {array} selectionRange  An array list
   * @param {object} optPar [optional]  An optional parameter record including
   *     optPar.displayProp, optPar.valueProp and optPar.selection
   */
  function fillSelectWithOptions( selectEl, selectionRange, optPar) {
    // create option elements from array key and values
    const options = selectionRange.entries();
    // delete old contents
    selectEl.innerHTML = "";
    // create "no selection yet" entry
    if (!selectEl.multiple && optPar.blank) selectEl.add( createOption(""," --- "));
    //
    for (const [index, o] of options) {
      const key = index + 1,
        optionEl = createOption(
          optPar ? (o[optPar.valueProp] ? o[optPar.valueProp] : key) : key,
          optPar ? (o[optPar.displayProp] ? o[optPar.displayProp] : o) : o
        );
      if (selectEl.multiple && optPar && optPar.selection &&
        optPar.selection.includes(key)) {
        // flag the option element with this value as selected
        optionEl.selected = true;
      } else if (optPar.selection === o[optPar.valueProp]) optionEl.selected = true;
      selectEl.add( optionEl);
    }
  }
  // *************** Multiple Selection Widget ****************************************
  /**
   * Create an input/button elements combo that creates associations between a "domain
   * object" and a "target object". This UI component checks/retrieves target objects
   * and adds them to a list (ul element) of ID references.
   * 1) creates an input field of "number" type, where ID references are entered,
   * 2) creates a button that adds li elements with ID reference's data to the list (ul),
   * 3) creates a ul element containing the association list
   * 4) each list item includes a button allowing each item to remove itself from the
   *    association list
   * @param {object} formEl The container form
   * @param {array} idRefs A map of objects, which is used to create the list of ID references
   * @param {string} inputEl Input element's name attribute
   * @param {string} idRefDomainName Domain object's attribute
   * @param {string} idRefTargetName Target object's attribute
   * @param {function} checkerMethod Method to check target object
   * @param {function} retrieveMethod Method to retrieve data from target object
   * @returns {Promise<void>}
   */
  // set up event handler for adding/removing multiple ID reference to associate 2 objects
  async function createMultiSelectionWidget (formEl, idRefs, inputEl,
                                             idRefDomainName, idRefTargetName,
                                             checkerMethod, retrieveMethod ) {
    const widgetEl = formEl.querySelector(".MultiSelectionWidget");
    const labelEl = document.createElement("label");
    const inputNumEl = document.createElement("input");
    const btnEl = document.createElement("button");
    const listEl = document.createElement("ul");
    inputNumEl.setAttribute("type", "number");
    inputNumEl.setAttribute("placeholder", "Enter ID");
    inputNumEl.setAttribute("name", "authors");
    btnEl.textContent = "add";
    labelEl.appendChild( inputNumEl);
    labelEl.appendChild( btnEl);
    labelEl.prepend("Authors: ");
    widgetEl.appendChild( labelEl);
    widgetEl.appendChild( listEl);
    // setup event handler for adding a new ID reference
    btnEl.addEventListener("click", async function () {
      const listEl = widgetEl.children[1]; // ul
      const idReference = formEl[inputEl].value;
      // if new ID reference is not empty or zero
      if (idReference && parseInt(idReference) !== 0) {
        let responseValidation = await checkerMethod( idReference); // invoke checker
        if (responseValidation.message) {
          formEl[inputEl].setCustomValidity( responseValidation.message);
        } else { // if checker passes
          // check if new ID reference has been already added
          const listOfIdRefs = getListOfIdRefs( listEl),
            alreadyAdded = !!listOfIdRefs
              .find( a => a[idRefDomainName] === parseInt( idReference));
          if (!alreadyAdded) { // if new ID reference has not yet added
            formEl[inputEl].setCustomValidity("");
            // retrieve target object
            const targetObjt = await retrieveMethod( idReference);
            // if target object is retrieved successfully, add ID reference to list
            if (targetObjt) {
              listEl.appendChild( addItemToListOfSelectedItems( targetObjt, idRefTargetName, "added"));
              formEl[inputEl].value = "";
              formEl[inputEl].focus();
            }
          } else { // if ID reference was already added
            formEl[inputEl].setCustomValidity("ID reference has been already added!");
          }
        }
      } else { // clear form if ID reference is not allowed
        formEl[inputEl].value = "";
      }
    });
    // setup event handler for removing an ID reference from list
    listEl.addEventListener( "click", function (e) {
      if (e.target.tagName === "BUTTON") {  // delete button
        const btnEl = e.target,
          listItemEl = btnEl.parentNode;
        if (listItemEl.classList.contains("removed")) {
          // undoing a previous removal
          listItemEl.classList.remove("removed");
          // change button text
          btnEl.textContent = "✕";
        } else if (listItemEl.classList.contains("added")) {
          listItemEl.remove();
        } else {
          // removing an ordinary item
          listItemEl.classList.add("removed");
          // change button text
          btnEl.textContent = "undo";
        }
      }
    });
    // fill loaded target ID references with
    if (idRefs.length) {
      for (const aId of idRefs) {
        const listEl = widgetEl.children[1];
        listEl.appendChild( addItemToListOfSelectedItems( aId, "id"));
      }
    }
    /** get references of associated objects from list **/
    function getListOfIdRefs (listEl) {
      const listItemEls = Array.from( listEl.children);
      return listItemEls.map( a => JSON.parse(a.getAttribute("data-value")));
    }
  }
  
  /**
   * Fill the select element of an Multiple Choice Widget with option elements created
   * from the selectionRange minus an optional selection set specified in optPar
   *
   * @param {object} selectionRange  An map of objects
   * @param {object} selectEl  A select(ion list) element
   * @param {string} keyProp  The standard identifier property
   * @param {object} optPar [optional]  An record of optional parameter slots
   *                 including optPar.displayProp and optPar.selection
   */
  function fillMultipleChoiceWidgetWithOptions(selectEl, selectionRange, keyProp, optPar) {
    // delete old contents
    selectEl.innerHTML = "";
    // create "no selection yet" entry
    selectEl.add( createOption(""," --- "));
    // create option elements
    for (const i of selectionRange) {
      const found = optPar.selection.some(a => a[keyProp] === i[keyProp]);
      // if invoked with a selection argument, only add options for items
      // that are not yet selected
      if (!found) {
        selectEl.add(createOption(i[keyProp], i[optPar.displayProp]));
      }
    }
  }
  /**
   * Fill a Choice Set element with items
   *
   * @param {object} listEl  A list element
   * @param {object} selection  An entity table for filling the Choice Set
   * @param {string} keyProp  The standard ID property of the entity table
   * @param {string} displayProp  A text property of the entity table
   */
  function fillChoiceSet( listEl, selection, keyProp, displayProp) {
    let options = [], obj = null;
    // delete old contents
    listEl.innerHTML = "";
    // create list items from object property values
    options = Object.keys( selection);
    for (const j of options.keys()) {
      obj = selection[options[j]];
      addItemToChoiceSet( listEl, obj[keyProp], obj[displayProp]);
    }
  }
  
  /**
   * Add an item to a list element showing selected objects
   *
   * @param {object} targetObjt  Referenced target object
   * @param {string} idRefTargetName  ID reference of target
   * @param {string} classValue  CSS class name
   */
  function addItemToListOfSelectedItems( targetObjt, idRefTargetName , classValue) {
    const listItemEl = document.createElement("li"),
      removeBtn = createPushButton("x");
    // add first 18 chars in list item
    listItemEl.innerText = `${targetObjt[idRefTargetName]}: ${targetObjt.name}`.substring(0, 16);
    // convert target object into text
    const targetObjText = JSON.stringify({id: targetObjt[idRefTargetName], name: targetObjt.name});
    // embed target object in list item (li element)
    listItemEl.setAttribute("data-value", targetObjText);
    if (classValue) listItemEl.classList.add( classValue);
    listItemEl.appendChild( removeBtn);
    return listItemEl;
  }
  
  /**
   * Add an item to a Choice Set element
   *
   * @param {object} listEl  A list element
   * @param {string} stdId  A standard identifier of an object
   * @param {string} humanReadableId  A human-readable ID of the object
   */
  function addItemToChoiceSet(listEl, stdId, humanReadableId, classValue) {
    let listItemEl = null, el = null;
    listItemEl = document.createElement("li");
    listItemEl.setAttribute("data-value", stdId);
    el = document.createElement("span");
    el.textContent = humanReadableId;
    listItemEl.appendChild( el);
    el = createPushButton("✕");
    listItemEl.appendChild( el);
    if (classValue) listItemEl.classList.add( classValue);
    listEl.appendChild( listItemEl);
  }
  /**
   * Show or hide progress bar element
   * @param {object} elementId  A node object
   */
  function showProgressBar (elementId) {
    const section = document.querySelector( `section#${elementId}`),
      progressEl = section.querySelector( "progress");
    progressEl.hidden = false;
  }
  /**
   * Hide progress bar element
   * @param {object} elementId  A node object
   */
  function hideProgressBar (elementId) {
    const section = document.querySelector( `section#${elementId}`),
      progressEl = section.querySelector( "progress");
    progressEl.hidden = true;
  }
  
  export { fillSelectWithOptions, createListFromMap, createMultiSelectionWidget,
    isNonEmptyString, date2IsoDateString, nextYear, showProgressBar, hideProgressBar };  