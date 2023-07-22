/***************************************************************
 Import classes and data types
 ***************************************************************/
 import Application, {ApplicationStatusEL} from "../../m/Application.mjs";
 import Job from "../../m/Job.mjs";
 import Applicant from "../../m/Applicant.mjs";
 import { handleAuthentication } from "../accessControl.mjs";
 import { fillSelectWithOptions, showProgressBar, hideProgressBar } from "../../lib/util.mjs";
 import { createListFromMap, createMultiSelectionWidget } from "../../lib/util_2.mjs";

 
 /***************************************************************
  Setup and handle UI Authentication
  ***************************************************************/
 handleAuthentication();
 
 /***************************************************************
  Declare variables for accessing UI elements
  ***************************************************************/
 const formEl = document.forms["Application"],
   createButton = formEl["commit"],
   progressEl = document.querySelector("progress"),
   statusEl = formEl["status"],
   createApplicantWidget = formEl.querySelector(".MultiSelectionWidget");
  
 /***************************************************************
  Set up (choice) widgets
  ***************************************************************/
 // Set up the status selection list
//  const statusOptions = ["Pending", "Approved", "Rejected"];
 await createMultiSelectionWidget (formEl, [], "applicants",
 "id", "applicantID", Applicant.checkApplicantIDAsIdRef, Applicant.retrieve);
 fillSelectWithOptions(statusEl, ApplicationStatusEL.labels);
 formEl.reset();
 
 
 /***************************************************************
  Add event listeners for input validation
  ***************************************************************/
  formEl["applicationID"].addEventListener("input", function () {
    const responseValidation = Application.checkApplicationID(formEl["applicationID"].value);
    formEl["applicationID"].setCustomValidity(responseValidation.message);
  });

  formEl["applicationName"].addEventListener("input", function () {
    formEl["applicationName"].setCustomValidity(Application.checkApplicationName(formEl["applicationName"].value).message);
  });

  formEl["applicationEmail"].addEventListener("input", function () {
    formEl["applicationEmail"].setCustomValidity(Application.checkApplicationEmail(formEl["applicationEmail"].value).message);
  });

  formEl["applicationPhoneNumber"].addEventListener("input", function () {
    formEl["applicationPhoneNumber"].setCustomValidity(Application.checkApplicationPhoneNumber(formEl["applicationPhoneNumber"].value).message);
  });

  formEl["description"].addEventListener("input", function () {
    formEl["description"].setCustomValidity(Application.checkDescription(formEl["description"].value).message);
  });

  statusEl.addEventListener("click", function () {
    formEl["status"].setCustomValidity(Application.checkStatus(statusEl.value).message);
  });


 
 
 /***************************************************************
  Add event listeners for the create/submit button
  ***************************************************************/
 createButton.addEventListener("click", async function () {
  if (!formEl["applicationID"].value) return;
  
  const addedApplicantListEl = createApplicantWidget.children[1],
     slots = {
       applicationID: formEl["applicationID"].value,
       applicationName: formEl["applicationName"].value,
       applicationEmail: formEl["applicationEmail"].value,
       applicationPhoneNumber: formEl["applicationPhoneNumber"].value,
       description: formEl["description"].value,
       status: formEl["status"].value,
       jobID: formEl["jobID"].value,
       applicantIDRefs: [],
     };
 
   showProgressBar(progressEl);
 
  formEl["applicationID"].setCustomValidity((await Application.checkApplicationIDAsId(slots.applicationID)).message);
  formEl["applicationName"].setCustomValidity(Application.checkApplicationName(slots.applicationName).message);
  formEl["applicationEmail"].setCustomValidity(Application.checkApplicationEmail(slots.applicationEmail).message);
  formEl["applicationPhoneNumber"].setCustomValidity(Application.checkApplicationPhoneNumber(slots.applicationPhoneNumber).message);
  formEl["description"].setCustomValidity(Application.checkDescription(slots.description).message);
  formEl["status"].setCustomValidity(Application.checkStatus(slots.status).message);

  if (addedApplicantListEl.children.length) {
    for (const applicantItemEl of addedApplicantListEl.children) {
      const applicant = JSON.parse(applicantItemEl.getAttribute("data-value"));
      const responseValidation = Applicant.checkApplicantIDAsIdRef(applicant.id);
      if (responseValidation.message) {
        formEl["applicants"].setCustomValidity(responseValidation.message);
        break;
      } else {
        slots.applicantIDRefs.push(applicant);
        formEl["applicants"].setCustomValidity("");
      }
    }
  } else formEl["applicants"].setCustomValidity
        (formEl["applicants"].value ? "" : "No Applicant Selected!");
    
   
 
   if (formEl.checkValidity()) {
     await Application.add(slots);
     formEl.reset();
     addedApplicantListEl.innerHTML = "";
   }
 
   hideProgressBar(progressEl);
 });