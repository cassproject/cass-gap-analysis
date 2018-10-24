//**************************************************************************************************
// CASS UI Gap Analysis Main Functions
//**************************************************************************************************

//TODO openAdjustGapRulesModal
//TODO checkForGapContentsSearchbarEnter

//**************************************************************************************************
// Constants

const CREATE_IMPLIED_RELATIONS_ON_COLLAPSE = true;

const MAX_FWK_SEARCH_SIZE = 10000;

const IND_PRF_TYPE = "individuals";
const TEAM_PRF_TYPE = "teams";

const TITLE_FWK_FLTR_TYPE = "title";
const DESC_FWK_FLTR_TYPE = "desc";

const INIT_MODE = "init";
const ADD_MODE = "add";

//**************************************************************************************************
// Variables

var currentAddMode = INIT_MODE;
var selectedProfiles = [];
var selectedFrameworks = [];

var availableFrameworkList = [];
var frameworkIdFrameworkMap = {};
var frameworkNameFrameworkMap = {};

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

function initializeSelectedDataPoints() {
    selectedProfiles = [];
    selectedFrameworks = [];
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

function addSelectedFrameworks() {
    //TODO parse selected frameworks
    currentAddMode = ADD_MODE;
    $(ADD_FWK_MODAL).foundation('close');
}

function filterAddFwkResults() {
    var fwkFltType = $(ADD_FWK_FLTR_TYPE_SELECT).val();
    var filter = $(ADD_FWK_RES_FLTR).val();
    if (!filter || filter.trim().length == 0) {
        //TODO remove filter
        setAddFwkResultsDesc("All Frameworks");
    }
    else {
        //TODO Filter Results
        if (fwkFltType == TITLE_FWK_FLTR_TYPE) {
            setAddFwkResultsDesc("Frameworks with titles containing '" + filter + "'");
        }
        else if (fwkFltType == DESC_FWK_FLTR_TYPE) {
            setAddFwkResultsDesc("Frameworks with descriptions containing '" + filter + "'");
        }
    }
    //TODO filter results
}

function changeAddFwkFilterType() {
    var fwkFltType = $(ADD_FWK_FLTR_TYPE_SELECT).val();
    var filter = $(ADD_FWK_RES_FLTR).val();
    //TODO filter results
}

function fillInAddFwkResults() {
    $(ADD_FWK_RES_SELECT).empty();
    $(ADD_FWK_RES_FLTR).val("");
    setAddFwkResultsDesc("All Frameworks");
    for (var i=0;i<availableFrameworkList.length;i++) {
        var f = availableFrameworkList[i];
        $('<option>').val(buildIDableString(f.shortId())).text(f.getName()).appendTo(ADD_FWK_RES_SELECT);
    }
}

function openAddFrameworkModal() {
    $(ADD_FWK_FLTR_TYPE_SELECT).val(TITLE_FWK_FLTR_TYPE);
    fillInAddFwkResults();
    $(ADD_FWK_MODAL).foundation('open');
}

//**************************************************************************************************
// Add Profile Modal
//**************************************************************************************************

function addSelectedProfiles() {
    //TODO parse selected profiles
    if (currentAddMode == INIT_MODE) {
        openAddFrameworkModal();
    }
}

function filterAddProfResults() {
    var profType = $(ADD_PRF_TYPE_SELECT).val();
    var filter = $(ADD_PRF_RES_FLTR).val();
    if (!filter || filter.trim().length == 0) {
        //TODO remove filter
        if (profType == IND_PRF_TYPE) {
            setAddProfResultsDesc("All Individuals");
        }
        else if (profType == TEAM_PRF_TYPE) {
            setAddProfResultsDesc("All Teams");
        }
    }
    else {
        //TODO Filter Results
        if (profType == IND_PRF_TYPE) {
            setAddProfResultsDesc("Individuals with names containing '" + filter + "'");
        }
        else if (profType == TEAM_PRF_TYPE) {
            setAddProfResultsDesc("Teams  with names containing '" + filter + "'");
        }
    }
}

function fillInAddProfIndividualsResults() {
    for (var i=0;i<contactDisplayList.length;i++) {
        var c = contactDisplayList[i];
        $('<option>').val(buildIDableString(c.pkPem)).text(c.displayName).appendTo(ADD_PRF_RES_SELECT);
    }
}

function fillInAddProfResults(profType) {
    $(ADD_PRF_RES_SELECT).empty();
    $(ADD_PRF_RES_FLTR).val("");
    if (profType == IND_PRF_TYPE) {
        setAddProfResultsDesc("All Individuals");
        fillInAddProfIndividualsResults();
    }
    else if (profType == TEAM_PRF_TYPE) {
        setAddProfResultsDesc("All Teams");
        $('<option>').val("na").text("TODO: Build Team Interface").appendTo(ADD_PRF_RES_SELECT);
    }
    else {
        $('<option>').val("na").text("Unknown Profile Type").appendTo(ADD_PRF_RES_SELECT);
    }
}

function changeAddProfType() {
    var profType = $(ADD_PRF_TYPE_SELECT).val();
    if (profType) fillInAddProfResults(profType);
}

function openAddProfileModal() {
    if (currentAddMode == INIT_MODE) initializeSelectedDataPoints();
    $(ADD_PRF_TYPE_SELECT).val(IND_PRF_TYPE);
    fillInAddProfResults(IND_PRF_TYPE);
    $(ADD_PRF_MODAL).foundation('open');
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
        currentAddMode = INIT_MODE;
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
