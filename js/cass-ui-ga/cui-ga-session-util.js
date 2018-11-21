//**************************************************************************************************
// CASS UI Gap Analysis Session Functions
//**************************************************************************************************


//**************************************************************************************************
// Constants

const MAX_PRS_SEARCH_SIZE = 10000;
const MAX_ORG_SEARCH_SIZE = 10000;

//**************************************************************************************************
// Variables

var repo;
var selectedServer;
var loggedInIdentityName;
var loggedInPk;
var loggedInPkPem;
var loggedInPpkPem;

var contactsByNameMap;
var contactsByPkPemMap;
var contactDisplayList;

var personContactsByPkPemMap;
var personPemsByPersonIdMap;

var profileGroupList;
var profileGroupMapByIDableString;

//**************************************************************************************************
// Data Structures
//**************************************************************************************************

function contactDisplayObj(contact) {
    this.displayName = contact.displayName;
    this.pk = contact.pk;
    this.pkPem = contact.pk.toPem();
    this.hide = false;
}

//**************************************************************************************************
// Organizations/Profile Groups
//**************************************************************************************************

function buildProfileGroupData(ecoa) {
    profileGroupMapByIDableString = {};
    profileGroupList = [];
    for (var i=0;i<ecoa.length;i++) {
        if (ecoa[i].hasOwner(loggedInPk)) {
            profileGroupMapByIDableString[buildIDableString(ecoa[i].shortId())] = ecoa[i];
            profileGroupList.push(ecoa[i]);
        }
    }
    profileGroupList.sort(function(a, b) {return a.name.localeCompare(b.name);})
}

function handleFetchOrganizationsSuccess(ecoa,callback) {
    debugMessage("handleFetchOrganizationsSuccess: " + ecoa.length);
    buildProfileGroupData(ecoa);
    callback();
}

function handleFetchOrganizationsFailure(err) {
    debugMessage("handleFetchOrganizationsFailure: " + err);
    showPageError("Could not fetch EcOrganization list: " + err);
}

function findProfileGroups(callback) {
    debugMessage("Finding repo Organzation objects...");
    EcOrganization.search(repo,"",
        function(ecoa){
            handleFetchOrganizationsSuccess(ecoa,callback);
        },
        handleFetchOrganizationsFailure,
        {'size':MAX_ORG_SEARCH_SIZE}
    );
}

//**************************************************************************************************
// Persons
//**************************************************************************************************

function isPersonAContact(personId) {
    var pkPem = personPemsByPersonIdMap[personId];
    if (pkPem) {
        if (personContactsByPkPemMap.hasOwnProperty(pkPem)) return true;
        else return false;
    }
    else return false;
}

function getPkPemsForPersonIds(pida) {
    var pkPems = [];
    for (var i=0;i<pida.length;i++) {
        var pkp = personPemsByPersonIdMap[pida[i]];
        if (pkp) pkPems.push(pkp);
    }
    return pkPems;
}

function isPkPemAPerson(pkPem) {
    if (personContactsByPkPemMap.hasOwnProperty(pkPem)) return true;
    else return false;
}

function buildContactsFingerprintMap() {
    var cfm = {};
    for (var pkPem in contactsByPkPemMap) {
        if (contactsByPkPemMap.hasOwnProperty(pkPem)) {
            var fp = contactsByPkPemMap[pkPem].pk.fingerprint();
            cfm[fp] = pkPem;
        }
    }
    return cfm;
}

function buildPersonFingerprintMap(ecpa) {
    var pfpm = [];
    for (var i=0;i<ecpa.length;i++) {
        var pfp = ecpa[i].getFingerprintFromId();
        if (pfp) pfpm[pfp] = ecpa[i];
    }
    return pfpm;
}

function buildPersonData(ecpa) {
    personContactsByPkPemMap = {};
    personPemsByPersonIdMap = {};
    var pfpm = buildPersonFingerprintMap(ecpa);
    var cfm = buildContactsFingerprintMap();
    for (var fp in cfm) {
        if (cfm.hasOwnProperty(fp)) {
            if (pfpm.hasOwnProperty(fp)) {
                personContactsByPkPemMap[cfm[fp]] = pfpm[fp];
                personPemsByPersonIdMap[pfpm[fp].shortId()] = cfm[fp];
            }
        }
    }
}

function handleFetchPersonsSuccess(ecpa,callback) {
    debugMessage("handleFetchPersonsSuccess: " + ecpa.length);
    buildPersonData(ecpa);
    callback();
}

function handleFetchPersonsFailure(err) {
    debugMessage("handleFetchPersonsFailure: " + err);
    showPageError("Could not fetch EcPerson list: " + err);
}

function identifyEcPersons(callback) {
    debugMessage("Finding repo Person objects...");
    EcPerson.search(repo,"",
        function(ecpa){
            handleFetchPersonsSuccess(ecpa,callback);
        },
        handleFetchPersonsFailure,
        {'size':MAX_PRS_SEARCH_SIZE}
    );
}

//**************************************************************************************************
// Contacts
//**************************************************************************************************

function buildContactDisplayList() {
    contactDisplayList = [];
    for (var cPkPem in contactsByPkPemMap) {
        if (contactsByPkPemMap.hasOwnProperty(cPkPem)) {
            var cdo = new contactDisplayObj(contactsByPkPemMap[cPkPem]);
            //applySamanthaContactsDisplayFilter(cdo);
            contactDisplayList.push(cdo);
        }
    }
    if (contactDisplayList.length > 1) {
        contactDisplayList.sort(function (a, b) {
            return a.displayName.localeCompare(b.displayName);
        });
    }
}

function buildContactsMaps() {
    contactsByNameMap = {};
    contactsByPkPemMap = {};
    for (var i = 0; i < EcIdentityManager.contacts.length; i++) {
        contactsByNameMap[EcIdentityManager.contacts[i].displayName] = EcIdentityManager.contacts[i];
        contactsByPkPemMap[EcIdentityManager.contacts[i].pk.toPem()] = EcIdentityManager.contacts[i];
    }
    buildContactDisplayList();
}

//**************************************************************************************************
// Repository Intialization
//**************************************************************************************************
function initRepo() {
    debugMessage("Initializing repository...");
    repo = new EcRepository();
    repo.selectedServer = selectedServer;
    debugMessage("Repository initialized.");
}

//**************************************************************************************************
// Identity Intialization
//**************************************************************************************************
function initSessionIdentity() {
    debugMessage("Initializing identity...");
    var eci = new EcIdentity();
    eci.source = selectedServer;
    eci.displayName = loggedInIdentityName;
    var eciPpk = EcPpk.fromPem(loggedInPpkPem);
    eci.ppk = eciPpk;
    EcIdentityManager.ids.push(eci);
    loggedInPk = EcIdentityManager.ids[0].ppk.toPk();
    loggedInPkPem = loggedInPk.toPem();
    debugMessage("Identity intialized:");
    debugMessage("Display Name: " + EcIdentityManager.ids[0].displayName);
    debugMessage("Public Key: " + loggedInPkPem);
}

function setupIdentity(serverParm,nameParm,pemParm) {
    debugMessage("Setting up identity...");
    selectedServer = serverParm;
    initRepo();
    loggedInIdentityName = nameParm;
    loggedInPpkPem = pemParm;
    initSessionIdentity();
    buildContactsMaps();
    debugMessage("Identity set up.");
}