/**
 * @fileOverview  Contains various view functions for managing applicants
 * @dokument Gerd Wagner
 * @dokument Juan-Francisco Reyes
 */
/***************************************************************
 Import classes, data types and utility procedures
 ***************************************************************/
import { handleAuthentication } from "./accessControl_Phong.mjs";
import Applicant from "../m/Applicant.mjs";
import Dokument from "../m/Dokument.mjs";
import { createListFromMap, hideProgressBar, showProgressBar, createMultiSelectionWidget }
  from "../lib/util_Phong.mjs";

/***************************************************************
 Setup and handle UI Access Control
 ***************************************************************/
handleAuthentication();

/***************************************************************
 Declare variables for accessing main UI elements
 ***************************************************************/
const applicantMSectionEl = document.getElementById("Applicant-M"),
  applicantRSectionEl = document.getElementById("Applicant-R"),
  applicantCSectionEl = document.getElementById("Applicant-C"),
  applicantUSectionEl = document.getElementById("Applicant-U"),
  applicantDSectionEl = document.getElementById("Applicant-D");

/***************************************************************
 Set up general use-case-independent event listeners
 ***************************************************************/
// set up back-to-menu buttons for all use cases
for (const btn of document.querySelectorAll("button.back-to-menu")) {
  btn.addEventListener("click", refreshManageDataUI);
}
// neutralize the submit event for all use cases
for (const frm of document.querySelectorAll("section > form")) {
  frm.addEventListener("submit", function (e) {
    e.preventDefault();
  });
}

/**********************************************
 * Use case Retrieve/List All Applicants
 **********************************************/
// initialize pagination mapping references
let cursor = null,
  previousPageRef = null,
  nextPageRef = null,
  startAtRefs = [];
let order = "applicantID"; // default order value
const tableBodyEl = applicantRSectionEl.querySelector("table > tbody");
const selectOrderEl = applicantRSectionEl.querySelector("div > label > select"),
  previousBtnEl = document.getElementById("previousPage"),
  nextBtnEl = document.getElementById("nextPage");
/**
 * event handler for main menu button
 */
document.getElementById("RetrieveAndListAll")
  .addEventListener("click", async function () {
    applicantMSectionEl.hidden = true;
    applicantRSectionEl.hidden = false;
    await createBlock();
    startAtRefs.push(cursor); // set "first" startAt page reference
    previousBtnEl.disabled = true;
  });
/**
 * create listing page
 */
async function createBlock(startAt) {
  tableBodyEl.innerHTML = "";
  showProgressBar("Applicant-R");
  const applicantRecs = await Applicant.retrieveBlock({ "order": order, "cursor": startAt });
  if (applicantRecs.length) {
    // set page references for current (cursor) page
    cursor = applicantRecs[0][order];
    // set next startAt page reference, if not next page, assign "null" value
    nextPageRef = (applicantRecs.length < 6) ? null : applicantRecs[applicantRecs.length - 1][order];
    for (const applicantRec of applicantRecs) {
      const listEl = createListFromMap(applicantRec.resumeIdRefs, "name");
      const row = tableBodyEl.insertRow(-1);
      row.insertCell(-1).textContent = applicantRec.applicantID;
      row.insertCell(-1).textContent = applicantRec.applicantName;
      row.insertCell(-1).textContent = applicantRec.address;
      row.insertCell(-1).textContent = applicantRec.email;
      row.insertCell(-1).textContent = applicantRec.phone;
      row.insertCell(-1).appendChild(listEl);
      if (applicantRec.applications && applicantRec.applications.length) {
        const listEl = createListFromMap( applicantRec.applications, "applicationName", "applicationID");
        row.insertCell().appendChild(listEl);
      }
    }
  }
  hideProgressBar("Applicant-R");
}
/**
 * "Previous" button
 */
previousBtnEl.addEventListener("click", async function () {
  // locate current page reference in index of page references
  previousPageRef = startAtRefs[startAtRefs.indexOf(cursor) - 1];
  // create new page
  await createBlock(previousPageRef);
  // disable "previous" button if cursor is first page
  if (cursor === startAtRefs[0]) previousBtnEl.disabled = true;
  // enable "next" button if cursor is not last page
  if (cursor !== startAtRefs[startAtRefs.length - 1]) nextBtnEl.disabled = false;
});
/**
 *  "Next" button
 */
nextBtnEl.addEventListener("click", async function () {
  await createBlock(nextPageRef);
  // add new page reference if not present in index
  if (!startAtRefs.find(i => i === cursor)) startAtRefs.push(cursor);
  // disable "next" button if cursor is last page
  if (!nextPageRef) nextBtnEl.disabled = true;
  // enable "previous" button if cursor is not first page
  if (cursor !== startAtRefs[0]) previousBtnEl.disabled = false;
});
/**
 * handle order selection events: when an order is selected,
 * populate the list according to the selected order
 */
selectOrderEl.addEventListener("change", async function (e) {
  order = e.target.value;
  startAtRefs = [];
  await createBlock();
  startAtRefs.push(cursor);
  previousBtnEl.disabled = true;
  nextBtnEl.disabled = false;
});

/**********************************************
 * Use case Create Applicant
 **********************************************/
const createFormEl = applicantCSectionEl.querySelector("form"),
  createDokumentWidget = createFormEl.querySelector(".MultiSelectionWidget");
await createMultiSelectionWidget(createFormEl, [], "dokuments",
  "id", "dokumentID", Dokument.checkDokumentIDAsIdRef, Dokument.retrieve);
document.getElementById("Create").addEventListener("click", async function () {
  createFormEl.reset();
  applicantMSectionEl.hidden = true;
  applicantCSectionEl.hidden = false;
});
// set up event handlers for responsive constraint validation
createFormEl["applicantID"].addEventListener("input", async function () {
  const responseValidation = await Applicant.checkApplicantIDAsId(createFormEl["applicantID"].value);
  createFormEl["applicantID"].setCustomValidity(responseValidation.message);
});
// handle Create button click events
createFormEl["commit"].addEventListener("click", async function () {
  if (!createFormEl["applicantID"].value) return;
  const addedDokumentsListEl = createDokumentWidget.children[1], // ul
    slots = {
      applicantID: createFormEl["applicantID"].value,
      applicantName: createFormEl["applicantName"].value,
      address: createFormEl["address"].value,
      email: createFormEl["email"].value,
      phone: createFormEl["phone"].value,
      resumeIdRefs: []
    };
  // check all input fields and show error messages
  createFormEl["applicantID"].setCustomValidity(
    (await Applicant.checkApplicantIDAsId(slots.applicantID)).message);
  createFormEl["applicantName"].setCustomValidity(
    Applicant.checkApplicantName(slots.applicantName).message);
  createFormEl["phone"].setCustomValidity(
    Applicant.checkPhone(slots.phone).message);
  createFormEl["email"].setCustomValidity(
    Applicant.checkEmail(slots.email).message);
  createFormEl["address"].setCustomValidity(
    Applicant.checkAddress(slots.address).message);

  if (addedDokumentsListEl.children.length) {
    for (const dokumentItemEl of addedDokumentsListEl.children) {
      const dokument = JSON.parse(dokumentItemEl.getAttribute("data-value"));
      const responseValidation = await Dokument.checkDokumentIDAsIdRef(dokument.id);
      if (responseValidation.message) {
        createFormEl["dokuments"].setCustomValidity(responseValidation.message);
        break;
      } else {
        slots.resumeIdRefs.push(dokument);
        createFormEl["dokuments"].setCustomValidity("");
      }
    }
  } else createFormEl["dokuments"].setCustomValidity(
    createFormEl["dokuments"].value ? "" : "No dokument selected!");
  // save the input data only if all form fields are valid
  if (createFormEl.checkValidity()) {
    showProgressBar("Applicant-C");
    await Applicant.add(slots);
    createFormEl.reset();
    addedDokumentsListEl.innerHTML = "";
    hideProgressBar("Applicant-C");
  }
});

/**********************************************
 * Use case Update Applicant
 **********************************************/
const updateFormEl = applicantUSectionEl.querySelector("form"),
  updateDokumentWidget = updateFormEl.querySelector(".MultiSelectionWidget");
document.getElementById("Update").addEventListener("click", async function () {
  applicantMSectionEl.hidden = true;
  applicantUSectionEl.hidden = false;
  updateFormEl.reset();
  updateDokumentWidget.innerHTML = "";
});
/**
 * handle applicant APPLICANTID input: when a applicant APPLICANTID is entered, and the
 * user changes focus, the form is populated with applicant data
 */
// set up event handlers for responsive constraint validation
updateFormEl["applicantID"].addEventListener("input", async function () {
  const responseValidation = await Applicant.checkApplicantIDAsIdRef(updateFormEl["applicantID"].value);
  if (responseValidation) updateFormEl["applicantID"].setCustomValidity(responseValidation.message);
  if (!updateFormEl["applicantID"].value) {
    updateFormEl.reset();
    updateDokumentWidget.innerHTML = "";
  }
});
updateFormEl["applicantID"].addEventListener("blur", async function () {
  if (updateFormEl["applicantID"].checkValidity() && updateFormEl["applicantID"].value) {
    const applicantRec = await Applicant.retrieve(updateFormEl["applicantID"].value);
    updateFormEl["applicantID"].value = applicantRec.applicantID;
    updateFormEl["applicantName"].value = applicantRec.applicantName;
    updateFormEl["address"].value = applicantRec.address;
    updateFormEl["email"].value = applicantRec.email;
    updateFormEl["phone"].value = applicantRec.phone;
    updateDokumentWidget.innerHTML = "";
    await createMultiSelectionWidget(updateFormEl, applicantRec.resumeIdRefs,"dokuments", "id", "dokumentID",Dokument.checkDokumentIDAsIdRef, Dokument.retrieve);
  } else {
    updateFormEl.reset();
  }
});
// handle Update button click events
updateFormEl["commit"].addEventListener("click", async function () {
  if (!updateFormEl["applicantID"].value) return;
  const addedDokumentsListEl = updateDokumentWidget.children[1], // ul
    slots = {
      applicantID: updateFormEl["applicantID"].value,
      applicantName: updateFormEl["applicantName"].value,
      address: updateFormEl["address"].value,
      email: updateFormEl["email"].value,
      phone: updateFormEl["phone"].value
    };
  // check all input fields and show error messages
  updateFormEl["applicantName"].setCustomValidity(
    Applicant.checkApplicantName(slots.applicantName).message);
  updateFormEl["address"].setCustomValidity(
    Applicant.checkAddress(slots.address).message);
  updateFormEl["email"].setCustomValidity(
    Applicant.checkEmail(slots.email).message);
  updateFormEl["phone"].setCustomValidity(
    Applicant.checkPhone(slots.phone).message);

  if (addedDokumentsListEl.children.length) {
    // construct resumeIdRefs-ToAdd/ToRemove lists
    const resumeIdRefsToAdd = [], resumeIdRefsToRemove = [];
    for (const dokumentItemEl of addedDokumentsListEl.children) {
      if (dokumentItemEl.classList.contains("added")) {
        const dokument = JSON.parse(dokumentItemEl.getAttribute("data-value"));
        const responseValidation = await Dokument.checkDokumentIDAsIdRef(dokument.id);
        if (responseValidation.message) {
          updateFormEl["dokuments"].setCustomValidity(responseValidation.message);
          break;
        } else {
          resumeIdRefsToAdd.push(dokument);
          updateFormEl["dokuments"].setCustomValidity("");
        }
      }
      if (dokumentItemEl.classList.contains("removed")) {
        const dokument = JSON.parse(dokumentItemEl.getAttribute("data-value"));
        resumeIdRefsToRemove.push(dokument);
      }
    }
    // if the add/remove list is non-empty, create a corresponding slot
    if (resumeIdRefsToRemove.length > 0) {
      slots.resumeIdRefsToRemove = resumeIdRefsToRemove;
    }
    if (resumeIdRefsToAdd.length > 0) {
      slots.resumeIdRefsToAdd = resumeIdRefsToAdd;
    }
  } else updateFormEl["dokuments"].setCustomValidity(
    updateFormEl["dokuments"].value ? "" : "No dokument selected!");
  // commit the update only if all form field values are valid
  if (updateFormEl.checkValidity()) {
    showProgressBar("Applicant-U");
    await Applicant.update(slots);
    // drop widget content
    updateFormEl.reset();
    updateDokumentWidget.innerHTML = ""; // ul
    hideProgressBar("Applicant-U");
  }
});

/**********************************************
 * Use case Delete Applicant
 **********************************************/
const deleteFormEl = applicantDSectionEl.querySelector("form");
document.getElementById("Delete").addEventListener("click", async function () {
  deleteFormEl.reset();
  applicantMSectionEl.hidden = true;
  applicantDSectionEl.hidden = false;
});
deleteFormEl["applicantID"].addEventListener("input", async function () {
  const responseValidation = await Applicant.checkApplicantIDAsIdRef(deleteFormEl["applicantID"].value);
  deleteFormEl["applicantID"].setCustomValidity(responseValidation.message);
});
// commit delete only if all form field values are valid
if (deleteFormEl.checkValidity()) {
  // handle Delete button click events
  deleteFormEl["commit"].addEventListener("click", async function () {
    const applicantIdRef = deleteFormEl["applicantID"].value;
    if (!applicantIdRef) return;
    if (confirm("Do you really want to delete this applicant?")) {
      await Applicant.destroy(applicantIdRef);
      deleteFormEl.reset();
    }
  });
}

/**********************************************
 * Refresh the Manage Applicants Data UI
 **********************************************/
function refreshManageDataUI() {
  // show the manage applicant UI and hide the other UIs
  applicantMSectionEl.hidden = false;
  applicantRSectionEl.hidden = true;
  applicantCSectionEl.hidden = true;
  applicantUSectionEl.hidden = true;
  applicantDSectionEl.hidden = true;
}

/** Retrieve data and set up the applicant management UI */
// set up Manage Applicant UI
refreshManageDataUI(); 