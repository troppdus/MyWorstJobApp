/**
 * @fileOverview  Auxiliary data management procedures
 * @dokument Gerd Wagner
 * @dokument Juan-Francisco Reyes
 */
import { fsDb } from "./initFirebase.mjs";
import { collection as fsColl, getDocs, orderBy }
  from "https://www.gstatic.com/firebasejs/9.8.1/firebase-firestore.js";
import Application from "./m/Application.mjs";
// import Application from "./m/Application.mjs";

/*******************************************
 *** Auxiliary methods for testing **********
 ********************************************/
/**
 *  Load and save test data
 */
async function generateDataApplications () {
  try {
    let response;
    console.log("Generating application records...");
    response = await fetch( "../test-data/applications_test.json");
    const applicationRecs = await response.json();
    await Promise.all( applicationRecs.map( d => Application.add( d)));
    console.log(`${applicationRecs.length} application records saved.`);
  } catch (e) {
    console.error(`${e.constructor.name}: ${e.message}`);
  }
}
/**
 * Clear data
 */
async function clearDataApplication () {
  try {
    if (confirm("Do you really want to delete all test data?")) {
      console.log("Clearing application records...");
      const applicationsCollRef = fsColl( fsDb, "applications");
      const applicationQrySns = (await getDocs( applicationsCollRef, orderBy( "applicationID")));
      await Promise.all( applicationQrySns.docs.map( d => Application.destroy( d.id)))
      console.log(`${applicationQrySns.docs.length} application records deleted.`);
    }
  } catch (e) {
    console.error(`${e.constructor.name}: ${e.message}`);
  }
}

export { generateDataApplications, clearDataApplication };