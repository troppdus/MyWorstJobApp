import { fsDb } from "../initFirebase.mjs";
import {
  collection as fsColl, doc as fsDoc, setDoc, getDoc, getDocs, orderBy, query as fsQuery,
  Timestamp, startAt, limit, deleteField, writeBatch, arrayUnion, arrayRemove
}
  from "https://www.gstatic.com/firebasejs/9.8.1/firebase-firestore.js";
import Job from "./Job.mjs";
import {
  IntervalConstraintViolation, MandatoryValueConstraintViolation,
  NoConstraintViolation, PatternConstraintViolation, RangeConstraintViolation,
  UniquenessConstraintViolation
} from "../lib/errorTypes.mjs";
import { isNonEmptyString } from "../lib/util.mjs";

class Company {
  // using a single record parameter with ES6 function parameter destructuring
  constructor({ companyID, companyName, description, postedJobs }) {
    // assign properties by invoking implicit setters
    this.companyID = companyID;
    this.companyName = companyName;
    this.description = description;
    this.postedJobs = postedJobs;
  };
  get companyID() {
    return this._companyID;
  };
  static checkCompanyID(companyID) {
    if (!companyID) {
      return new NoConstraintViolation();
    } else {
      companyID = parseInt(companyID);  // convert to integer
      if (isNaN(companyID) || !Number.isInteger(companyID) || companyID < 1) {
        return new RangeConstraintViolation(
          "The company ID must be a positive integer!");
      } else return new NoConstraintViolation();
    }
  };
  static async checkCompanyIDAsId(companyID) {
    let validationResult = Company.checkCompanyID(companyID);
    if ((validationResult instanceof NoConstraintViolation)) {
      if (!companyID) {
        validationResult = new MandatoryValueConstraintViolation(
          "A value for the company ID must be provided!");
      } else {
        const companyDocSn = await getDoc(fsDoc(fsDb, "companies", companyID));
        if (companyDocSn.exists()) {
          validationResult = new UniquenessConstraintViolation(
            `There is already an company record with company ID ${companyID}`);
        } else validationResult = new NoConstraintViolation();
      }
    }
    return validationResult;
  };
  static async checkCompanyIDAsIdRef(companyID) {
    let validationResult = Company.checkCompanyID(companyID);
    if ((validationResult instanceof NoConstraintViolation)) {
      if (!companyID) {
        validationResult = new MandatoryValueConstraintViolation(
          "A value for the Company ID must be provided!");
      } else {
        const companyDocSn = await getDoc(fsDoc(fsDb, "companies", companyID));
        console.log(companyDocSn);
        if (!companyDocSn.exists()) {
          validationResult = new UniquenessConstraintViolation(
            `There is no company record with this Company ID ${companyID}!`);
        } else validationResult = new NoConstraintViolation();
      }
    }
    return validationResult;
  };
  set companyID(n) {
    const validationResult = Company.checkCompanyID(n);
    if (validationResult instanceof NoConstraintViolation) this._companyID = n;
    else throw validationResult;
  };
  get companyName() {
    return this._companyName;
  };
  static checkCompanyName(n) {
    if (!n) {
      return new NoConstraintViolation();  // not mandatory
    } else {
      if (typeof n !== "string" || n.trim() === "") {
        return new RangeConstraintViolation(
          "The company name must be a non-empty string!");
      } else return new NoConstraintViolation();
    }
  };
  set companyName(a) {
    const constraintViolation = Company.checkCompanyName(a);
    if (constraintViolation instanceof NoConstraintViolation) {
      this._companyName = a;
    } else throw constraintViolation;
  };

  get description() {
    return this._description;
  };

  static checkDescription(description) {
    if (description && !isNonEmptyString(description)) {
      return new RangeConstraintViolation("The description must be a non-empty string!");
    } else {
      return new NoConstraintViolation();
    }
  };

  set description(description) {
    const validationResult = Company.checkDescription(description);
    if (validationResult instanceof NoConstraintViolation) {
      this._description = description;
    } else {
      throw validationResult;
    }
  };
  
  get postedJobs() {
    return this._postedJobs;
  };
  addJob(a) {
    this._postedJobs.push(a);
  };
  removeJob(a) {
    this._postedJobs = this._postedJobs.filter(d => d.id !== a.id);
  };
  set postedJobs(a) {
    this._postedJobs = a;
  };
}

Company.converter = {
  toFirestore: function (company) {
    const data = {
      companyID: parseInt(company.companyID),
      companyName: company.companyName,
      postedJobs: company.postedJobs
    };
    if (company.description) data.description = company.description;
    return data;
  },
  fromFirestore: function (snapshot, options) {
    const company = snapshot.data(options),
      data = {
        companyID: company.companyID,
        companyName: company.companyName,
        postedJobs: company.postedJobs
      };
    if (company.description) data.description = company.description;
    return new Company(data);
  },
};

Company.add = async function (slots) {
  let company = null;
  try {
    // Create Company instance
    company = new Company(slots);
    console.log("company", company);
    const companyDocRef = fsDoc(fsDb, "companies", String(company.companyID)).withConverter(Company.converter);

    const batch = writeBatch(fsDb); // initiate batch write object
    await batch.set(companyDocRef, company); // create company record

    await batch.commit(); // commit batch write
    console.log(`Company record "${company.companyID}" created!`);
  } catch (e) {
    console.error(`${e.constructor.name}: ${e.message}`);
  }
};

Company.retrieve = async function (companyID) {
  try {
    const companyRec = (await getDoc(fsDoc(fsDb, "companies", companyID)
      .withConverter(Company.converter))).data();
    if (companyRec) console.log(`Company record "${companyID}" retrieved.`);
    return companyRec;
  } catch (e) {
    console.error(`Error retrieving company record: ${e}`);
  }
};

Company.retrieveBlock = async function (params) {
  try {
    let companiesCollRef = fsColl(fsDb, "companies");
    // set limit and order in query
    companiesCollRef = fsQuery(companiesCollRef, limit(21));
    if (params.order) companiesCollRef = fsQuery(companiesCollRef, orderBy(params.order));
    // set pagination "startAt" cursor
    if (params.cursor) {
      companiesCollRef = fsQuery(companiesCollRef, startAt(params.cursor));
    }
    const companyRecs = (await getDocs(companiesCollRef
      .withConverter(Company.converter))).docs.map(d => d.data());
    if (companyRecs.length) {
      console.log(`Block of company records retrieved! (cursor: ${companyRecs[0][params.order]})`);
    }
    return companyRecs;
  } catch (e) {
    console.error(`Error retrieving all company records: ${e}`);
  }
};

Company.update = async function ({ companyID, companyName, postedJobsToAdd, postedJobsToRemove, description }) {
  let validationResult = null,
    companyBeforeUpdate = null;
  const companyDocRef = fsDoc(fsDb, "companies", companyID).withConverter(Company.converter),
    updatedSlots = {};
  try {
    // retrieve up-to-date company record
    companyBeforeUpdate = (await getDoc(companyDocRef)).data();
  } catch (e) {
    console.error(`${e.constructor.name}: ${e.message}`);
  }
  // evaluate if slots contains updates, while building "updatedSlots" object
  if (companyBeforeUpdate) {
    if (companyBeforeUpdate.companyName !== companyName) updatedSlots.companyName = companyName;
    if (companyBeforeUpdate.description !== description) updatedSlots.description = description;
    if (postedJobsToAdd) for (const jobIdRef of postedJobsToAdd)
      companyBeforeUpdate.addJob(jobIdRef);
    if (postedJobsToRemove) for (const jobIdRef of postedJobsToRemove)
      companyBeforeUpdate.removeJob(jobIdRef);
    if (postedJobsToAdd || postedJobsToRemove)
      updatedSlots.postedJobs = companyBeforeUpdate.postedJobs;
  }
  // if there are updates, update the company object
  const updatedProperties = Object.keys(updatedSlots);
  if (updatedProperties.length) {
    try {
      const batch = writeBatch(fsDb); // initiate batch write

      // update the company object
      batch.update(companyDocRef, updatedSlots);
      batch.commit(); // commit batch write
    } catch (e) {
      console.error(`${e.constructor.name}: ${e.message}`);
    }
    console.log(`Property(ies) "${updatedProperties.toString()}" modified for company record "${companyID}"`);
  } else {
    console.log(`No property value changed for company record "${companyID}"!`);
  }
};

Company.destroy = async function (companyID) {
  const companyDocRef = fsDoc(fsDb, "companies", companyID).withConverter(Company.converter);
  try {
    const batch = writeBatch(fsDb); // initiate batch write

    batch.delete(companyDocRef);
    await batch.commit();
    
    console.log(`Company record "${companyID}" deleted!`);
  } catch (e) {
    console.error(`Error deleting company record: ${e}`);
  }
};

Company.generateTestData = async function () {
  try {
    console.log("Generating test data...");
    const response = await fetch("../../test-data/companies.json");
    const compRecs = await response.json();

    // save all company record/documents
    await Promise.all(compRecs.map(d => Company.add( d)));
    console.log(`${Object.keys(compRecs).length} company records saved.`);
  }
  catch (e) {
    console.error(`${e.constructor.name}: ${e.message}`);
  }
};
/**
 * Clear database
 */
Company.clearData = async function () {
  if (confirm("Do you really want to delete all company records?")) {
    // retrieve all company documents from Firestore
    const compRecs = await Company.retrieveAll();
    // delete all documents
    await Promise.all(compRecs.map(d => Company.destroy(d.companyID.toString())));
    // ... and then report that they have been deleted
    console.log(`${Object.values(compRecs).length} company records deleted.`);
  }
};

export default Company;