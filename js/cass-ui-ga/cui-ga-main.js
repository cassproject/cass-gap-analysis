//**************************************************************************************************
// CASS UI Gap Analysis Main Functions
//**************************************************************************************************

//TODO openAdjustGapRulesModal
//TODO checkForGapContentsSearchbarEnter

//**************************************************************************************************
// Constants

const CREATE_IMPLIED_RELATIONS_ON_COLLAPSE = true;

const MAX_FWK_SEARCH_SIZE = 10000;

//**************************************************************************************************
// Variables

var availableFrameworkList = [];
var frameworkIdFrameworkMap = {};
var frameworkNameFrameworkMap = {};

var currentFrameworkName;
var currentFrameworkId;
var currentFrameworkFull;

//**************************************************************************************************
// Utility Functions
//**************************************************************************************************

//TODO checkForGapContentsSearchbarEnter
function checkForGapContentsSearchbarEnter(event) {
    // if (event.which == 13 || event.keyCode == 13) {
    //     $(FWK_CONT_SRCH_INPT).autocomplete("close");
    //     findItemByFrameworkContentsSearchBar($(FWK_CONT_SRCH_INPT).val().trim());
    // }
}

//**************************************************************************************************
// Adjust Gap Rules Modal
//**************************************************************************************************

function openAdjustGapRulesModal() {
    //TODO openAdjustGapRulesModal
}

//**************************************************************************************************
// Add Framework Modal
//**************************************************************************************************

//**************************************************************************************************
// Add Profile Modal
//**************************************************************************************************

function openAddProfileModal() {
}

//**************************************************************************************************
// Explorer Circle Graph Supporting Functions
//**************************************************************************************************


//**************************************************************************************************
// Available Framework Fetching
//**************************************************************************************************

function createSortedAvailableFrameworkList(ownedFrameworkList,unownedFrameworkList) {
    availableFrameworkList = [];
    ownedFrameworkList.sort(function (a, b) {return a.name.localeCompare(b.name);});
    unownedFrameworkList.sort(function (a, b) {return a.name.localeCompare(b.name);});
    for (var i=0;i<ownedFrameworkList.length;i++) {
        availableFrameworkList.push(ownedFrameworkList[i]);
    }
    for (var i=0;i<unownedFrameworkList.length;i++) {
        availableFrameworkList.push(unownedFrameworkList[i]);
    }
}

function buildFrameworkLists(arrayOfEcFrameworks) {
    var ownedFrameworkList = [];
    var unownedFrameworkList = [];
    frameworkIdFrameworkMap = {};
    for (var i=0;i<arrayOfEcFrameworks.length;i++) {
        var cecf = arrayOfEcFrameworks[i];
        if (cecf.name && cecf.name.trim().length > 0) {
            frameworkIdFrameworkMap[cecf.shortId()] = cecf;
            if (!frameworkNameFrameworkMap[cecf.name.trim()]) {
                frameworkNameFrameworkMap[cecf.name.trim()] = [];
            }
            frameworkNameFrameworkMap[cecf.name.trim()].push(cecf);
            if (cecf.hasOwner(loggedInPk)) {
                ownedFrameworkList.push(cecf);
            }
            else unownedFrameworkList.push(cecf);
        }
    }
    if ((ownedFrameworkList.length + unownedFrameworkList.length) <= 0) {
        showNoFrameworksAvailableWarning();
    }
    else {
        createSortedAvailableFrameworkList(ownedFrameworkList,unownedFrameworkList);
        showGapWelcome();
    }
}

function handleFetchFrameworksFromRepositorySuccess(arrayOfEcFrameworks) {
    buildFrameworkLists(arrayOfEcFrameworks);
    //fillInOpenFrameworkSearchAutoComplete();
}

function handleFetchFrameworksFromRepositoryFailure(err) {
    showPageError("Could not fetch framework list: " + err);
}

function fetchAvailableFrameworks() {
    disableAddItemButtons();
    hideGapAnalysisTools();
    hideGapContentsSearchBar();
    showPageAsBusy("Loading available frameworks...");
    EcFramework.search(repo, null, handleFetchFrameworksFromRepositorySuccess, handleFetchFrameworksFromRepositoryFailure, {'size':MAX_FWK_SEARCH_SIZE});
}


//**************************************************************************************************
// Page Load
//**************************************************************************************************

//setPageColorTheme();

function loadPageContents() {
    fetchAvailableFrameworks();
}
