import { fsDb } from "../initFirebase.mjs";
import { collection as fsColl, doc as fsDoc, getDoc, getDocs, orderBy, query as fsQuery,
    setDoc, where, writeBatch, arrayRemove, arrayUnion }
    from "https://www.gstatic.com/firebasejs/9.8.1/firebase-firestore.js";
import Applicant from "./Applicant.mjs";
import {
    IntervalConstraintViolation, MandatoryValueConstraintViolation,
    NoConstraintViolation, PatternConstraintViolation, RangeConstraintViolation,
    UniquenessConstraintViolation
} from "../lib/errorTypes.mjs";

/**
 * Constructor function for the class Dokument
 * @constructor
 * @param {dokumentID: string, fileTitle: string, filePath: string} slots - Object creation slots.
 */
class Dokument {
    // using a single record parameter with ES6 function parameter destructuring
    constructor({ dokumentID, fileTitle, filePath }) {
        // assign properties by invoking implicit setters
        this.dokumentID = dokumentID;
        this.fileTitle = fileTitle;
        this.filePath = filePath;
    };
    get dokumentID() {
        return this._dokumentID;
    };
    static checkDokumentID(id) {
        if (!id) {
            return new NoConstraintViolation();  // may be optional as an IdRef
        } else {
            id = parseInt(id);  // convert to integer
            if (isNaN(id) || !Number.isInteger(id) || id < 1) {
                return new RangeConstraintViolation(
                    "The dokument ID must be a positive integer!");
            } else return new NoConstraintViolation();
        }
    };
    static async checkDokumentIDAsId(id) {
        let constraintViolation = Dokument.checkDokumentID(id);
        if ((constraintViolation instanceof NoConstraintViolation)) {
            id = parseInt(id);  // convert to integer
            if (isNaN(id)) {
                return new MandatoryValueConstraintViolation(
                    "A positive integer value for the dokument ID is required!");
            } else {
                const dokumentDocSn = await getDoc(fsDoc(fsDb, "dokuments", String(id)));
                if (dokumentDocSn.exists()) {
                    constraintViolation = new UniquenessConstraintViolation(
                        "There is an dokument record with this dokument ID!");
                } else constraintViolation = new NoConstraintViolation();
            }
        }
        return constraintViolation;
    };
    static async checkDokumentIDAsIdRef(id) {
        let constraintViolation = Dokument.checkDokumentID(id);
        if ((constraintViolation instanceof NoConstraintViolation) && id) {
            const dokumentDocSn = await getDoc(fsDoc(fsDb, "dokuments", String(id)));
            if (!dokumentDocSn.exists()) {
                constraintViolation = new ReferentialIntegrityConstraintViolation(
                    `There is no dokument record with this dokument ID ${id}!`);
            }
        }
        return constraintViolation;
    };
    set dokumentID(id) {
        const constraintViolation = Dokument.checkDokumentID(id);
        if (constraintViolation instanceof NoConstraintViolation) {
            this._dokumentID = id;
        } else throw constraintViolation;
    };
    static checkFileTitle(n) {
        if (!n) {
            return new NoConstraintViolation();  // not mandatory
        } else {
            if (typeof n !== "string" || n.trim() === "") {
                return new RangeConstraintViolation(
                    "The file title must be a non-empty string!");
            } else return new NoConstraintViolation();
        }
    };
    get fileTitle() {
        return this._fileTitle;
    };
    set fileTitle(a) {
        const constraintViolation = Dokument.checkFileTitle(a);
        if (constraintViolation instanceof NoConstraintViolation) {
            this._fileTitle = a;
        } else throw constraintViolation;
    };
    static checkFilePath(n) {
        if (!n) {
            return new NoConstraintViolation();  // not mandatory
        } else {
            if (typeof n !== "string" || n.trim() === "") {
                return new RangeConstraintViolation(
                    "The file title must be a non-empty string!");
            } else return new NoConstraintViolation();
        }
    };
    get filePath() {
        return this._filePath;
    };
    set filePath(a) {
        const constraintViolation = Dokument.checkFilePath(a);
        if (constraintViolation instanceof NoConstraintViolation) {
            this._filePath = a;
        } else throw constraintViolation;
    };
    get dokumentOwner() {
        return this._dokumentOwner;
    };
}

/*********************************************************
 ***  Class-level ("static") storage management methods ***
 **********************************************************/
/**
 * Conversion between a Applicant object and a corresponding Firestore document
 * @type {{toFirestore: (function(*): {dokumentID: *, fileTitle: *, filePath: *}),
 * fromFirestore: (function(*, *=): Dokument)}}
 */
Dokument.converter = {
    toFirestore: function (dokument) { // setter
        return {
            dokumentID: parseInt(dokument._dokumentID),
            fileTitle: dokument.fileTitle,
            filePath: dokument.filePath
        };
    },
    fromFirestore: function (snapshot, options) {
        const data = snapshot.data(options),
            dokument = new Dokument(data);
        dokument._dokumentOwner = data.dokumentOwner;
        return dokument;
    },
};
/**
 * Create a Firestore document in the Firestore collection "dokuments"
 * @param slots: {object}
 * @returns {Promise<void>}
 */
Dokument.add = async function (slots) {
    let dokument = null, validationResult = null;
    try {
        dokument = new Dokument(slots);
        validationResult = Dokument.checkDokumentIDAsId(slots.dokumentID);
        if (!validationResult instanceof NoConstraintViolation) throw validationResult;
        validationResult = Dokument.checkDokumentIDAsIdRef(slots.dokumentID);
        if (!validationResult instanceof NoConstraintViolation) throw validationResult;
    } catch (e) {
        console.error(`${e.constructor.name}: ${e.message}`);
        dokument = null;
    }
    try {
        if(dokument) {
            const dokumentDocRef = fsDoc(fsDb, "dokuments", String(dokument.dokumentID)).withConverter(Dokument.converter);
            await setDoc(dokumentDocRef, dokument);
            console.log(`Dokument record "${dokument.dokumentID}" created!`);
        }
    }
    catch (e) {
            console.error(`Error when adding dokument record: ${e}`);
    }
};
/**
 * Load a dokument record from Firestore
 * @param dokumentID: {string}
 * @returns {Promise<*>} dokumentRec: {array}
 */
Dokument.retrieve = async function (dokumentID) {
    try {
        const dokumentRec = (await getDoc(fsDoc(fsDb, "dokuments", dokumentID)
            .withConverter(Dokument.converter))).data();
        console.log(`Dokument record "${dokumentRec.fileTitle}" retrieved!`);
        return dokumentRec;
    } catch (e) {
        console.error(`Error retrieving dokument record: ${e}`);
    }
};
/**
 * Load all dokument records from Firestore
 * @returns {Promise<*>} dokumentRecs: {array}
 */
Dokument.retrieveAll = async function () {
    const dokumentsCollRef = fsColl(fsDb, "dokuments"),
        q = fsQuery(dokumentsCollRef, orderBy("dokumentID"));
    try {
        const dokumentRecs = (await getDocs(
            q.withConverter(Dokument.converter))).docs.map(d => d.data());
        console.log(`${dokumentRecs.length} dokument records retrieved!`);
        return dokumentRecs;
    } catch (e) {
        console.error(`Error retrieving all dokument records: ${e}`);
    }
};
/**
 * Update a Firestore document in the Firestore collection "dokuments"
 * @param slots: {object}
 * @returns {Promise<void>}
 */
Dokument.update = async function (slots) {
    let dokumentBeforeUpdate = null;
    const applicantsCollRef = fsColl (fsDb, "applicants"),
      dokumentDocRef = fsDoc( fsDb, "dokuments", slots.dokumentID)
        .withConverter( Dokument.converter),
      updatedSlots = {};
    try {
      // retrieve up-to-date dokument record
      const dokumentDocSn = await getDoc( dokumentDocRef);
      dokumentBeforeUpdate = dokumentDocSn.data();
    } catch (e) {
      console.error(`${e.constructor.name}: ${e.message}`);
    }
    if (dokumentBeforeUpdate) {
      if (dokumentBeforeUpdate.fileTitle !== slots.fileTitle) {
        const constraintViolation = Dokument.checkFileTitle(slots.fileTitle);
        if (constraintViolation instanceof NoConstraintViolation) {
            updatedSlots.fileTitle = slots.fileTitle;
        } else throw constraintViolation;
    }
    if (dokumentBeforeUpdate.filePath !== slots.filePath) {
        const constraintViolation = Dokument.checkFilePath(slots.filePath);
        if (constraintViolation instanceof NoConstraintViolation) {
            updatedSlots.filePath = slots.filePath;
        } else throw constraintViolation;
    }
    }
    const updatedProperties = Object.keys(updatedSlots);
    if (updatedProperties.length) { // execute only if there are updates
      try {
        const dokumentRefBefore
            = {id: parseInt(slots.dokumentID), name: dokumentBeforeUpdate.fileTitle},
          dokumentRefAfter = {id: String(slots.dokumentID), name: slots.fileTitle},
          q = fsQuery( applicantsCollRef, where("resumeIdRefs", "array-contains",
            dokumentRefBefore)),
          applicantQrySns = (await getDocs(q)),
          batch = writeBatch( fsDb); // initiate batch write
          console.log(`Number of applicants found: ${applicantQrySns.docs.length}`);
        // iterate ID references (foreign keys) of master class objects (applicants) and
        // update derived inverse reference properties, remove/add
        await Promise.all( applicantQrySns.docs.map( d => {
          const applicantDocRef = fsDoc(applicantsCollRef, d.id);
          console.log(`Updating applicant record "${d.id}" ...`)
          batch.update(applicantDocRef, {resumeIdRefs: arrayRemove( dokumentRefBefore)});
          batch.update(applicantDocRef, {resumeIdRefs: arrayUnion( dokumentRefAfter)});
        }));
        // update applicant object
        batch.update(dokumentDocRef, updatedSlots);
        batch.commit(); // commit batch write
      } catch (e) {
        console.error(`${e.constructor.name}: ${e.message}`);
      }
      console.log(`Property(ies) "${updatedProperties.toString()}" modified for dokument record "${slots.dokumentID}"`);
    } else {
      console.log(`No property value changed for dokument record "${slots.dokumentID}"!`);
    }
  };
/**
 * Delete a Firestore document from the Firestore collection "dokuments"
 * @param dokumentID: {string}
 * @returns {Promise<void>}
 */
Dokument.destroy = async function (dokumentID) {
    const applicantsCollRef = fsColl(fsDb, "applicants"),
        q = fsQuery(applicantsCollRef, where("dokument_id", "==", dokumentID)),
        dokumentDocRef = fsDoc(fsColl(fsDb, "dokuments"), dokumentID);
    try {
        const applicantQrySns = (await getDocs(q)),
            batch = writeBatch(fsDb); // initiate batch write
        // iterate ID references (foreign keys) of master class objects (applicants) and
        // update derived inverse reference property
        await Promise.all(applicantQrySns.docs.map(d => {
            batch.update(fsDoc(applicantsCollRef, d.id), {
                dokument_id: deleteField()
            });
        }));
        batch.delete(dokumentDocRef); // delete dokument record
        batch.commit(); // finish batch write
        console.log(`Dokument record "${dokumentID}" deleted!`);
    } catch (e) {
        console.error(`Error deleting dokument record: ${e}`);
    }
};

export default Dokument;