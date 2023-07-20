/**
 * @fileOverview  Auxiliary data management procedures
 * @dokument Gerd Wagner
 * @dokument Juan-Francisco Reyes
 */
import { fsDb } from "./initFirebase.mjs";
import { collection as fsColl, getDocs, orderBy }
  from "https://www.gstatic.com/firebasejs/9.8.1/firebase-firestore.js";
import Dokument from "./m/Dokument.mjs";
import Applicant from "./m/Applicant.mjs";

/*******************************************
 *** Auxiliary methods for testing **********
 ********************************************/
/**
 *  Load and save test data
 */
async function generateData () {
  try {
    let response;
    console.log("Generating dokuments records...");
    response = await fetch( "../test-data/dokuments.json");
    const dokumentRecs = await response.json();
    await Promise.all( dokumentRecs.map( d => Dokument.add( d)));
    console.log(`${dokumentRecs.length} dokument records saved.`);

    console.log("Generating applicants records...");
    response = await fetch( "../test-data/applicants.json");
    const applicantRecs = await response.json();
    await Promise.all( applicantRecs.map( d => Applicant.add( d)));
    console.log(`${applicantRecs.length} applicant records saved.`);
  } catch (e) {
    console.error(`${e.constructor.name}: ${e.message}`);
  }
}
/**
 * Clear data
 */
async function clearData () {
  try {
    if (confirm("Do you really want to delete all test data?")) {
      console.log("Clearing applicants records...");
      const applicantsCollRef = fsColl( fsDb, "applicants");
      const applicantQrySns = (await getDocs( applicantsCollRef, orderBy( "applicantID")));
      await Promise.all( applicantQrySns.docs.map( d => Applicant.destroy( d.id)))
      console.log(`${applicantQrySns.docs.length} applicant records deleted.`);

      console.log("Clearing dokument records...");
      const dokumentsCollRef = fsColl( fsDb, "dokuments");
      const dokumentQrySns = (await getDocs( dokumentsCollRef, orderBy( "dokumentId")));
      await Promise.all( dokumentQrySns.docs.map( d => Dokument.destroy( d.data())))
      console.log(`${dokumentQrySns.docs.length} dokument records deleted.`);
    }
  } catch (e) {
    console.error(`${e.constructor.name}: ${e.message}`);
  }
}

export { generateData, clearData };