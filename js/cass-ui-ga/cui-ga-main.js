//**************************************************************************************************
// CASS UI Gap Analysis Main Functions
//**************************************************************************************************

//TODO openAdjustGapRulesModal
//TODO checkForGapContentsSearchbarEnter

//TODO multi-node competency clusters....
//TODO addChildToGapSummaryCompList construct list view for multi node competency cluster
//TODO getNumberOfProfilesWithAssertedCompetencyAndParents adjust for multi-node clusters
//TODO getProfilesWithAssertedCompetencyAndParents adjust for multi-node clusters
//TODO getAssertionsForD3NodeInclusive fix for multi node clusters

//TODO toggleGapSummaryCompChild figure out bug with this (same with Framework Explorer)

//**************************************************************************************************
// Constants

const CREATE_IMPLIED_RELATIONS_ON_COLLAPSE = true;

const MAX_FWK_SEARCH_SIZE = 10000;
const MAX_ASSR_SEARCH_SIZE = 10000;

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
var selectedFramework;

var hasSelectedFrameworkBeenProcessed = false;
var haveSelectedProfilesBeenProcessed = false;

var availableFrameworkList = [];
var frameworkIdFrameworkMap = {};
var frameworkNameFrameworkMap = {};

var assertionList = [];
var ecAssertionSearchReturnList;
var assertionEnvelopeEcAssertionList;
var assertionEnvelopeList;

var assertionMap;
var assertionNegativeMap;
var profileAssertionsMap;
var competencyAssertionMap;

var selectedFrameworkCompetencyData;
var selectedFrameworkNodePacketGraph;
var currentD3FrameworkNode;
var currentD3FrameworkNodeString;

var numCompsWithoutCoverage;

//**************************************************************************************************
// Utility Functions
//**************************************************************************************************

function initializeSelectedDataPoints() {
    selectedProfiles = [];
    selectedFramework = null;
    hasSelectedFrameworkBeenProcessed = false;
    haveSelectedProfilesBeenProcessed = false;
}

function getFrameworkName(frameworkId) {
    var fw = frameworkIdFrameworkMap[frameworkId];
    if (fw) return fw.name;
    else return "Framework not found";
}

function getCompetencyName(compId) {
    if (compId == selectedFramework.getName()) return selectedFramework.getName();
    if (selectedFrameworkCompetencyData.competencyPacketDataMap[compId]) {
        return selectedFrameworkCompetencyData.competencyPacketDataMap[compId].name;
    }
    else return "";
}

function getCassNodePacket(packetId) {
    if (selectedFrameworkCompetencyData && selectedFrameworkCompetencyData.competencyPacketDataMap &&
        selectedFrameworkCompetencyData.competencyPacketDataMap[packetId]) {
        return selectedFrameworkCompetencyData.competencyPacketDataMap[packetId].cassNodePacket;
    }
    else return null;
}

function getCompetencyD3NodeTracker(trackerId) {
    if (selectedFrameworkCompetencyData && selectedFrameworkCompetencyData.competencyD3NodeTrackerMap &&
        selectedFrameworkCompetencyData.competencyD3NodeTrackerMap[trackerId]) {
        return selectedFrameworkCompetencyData.competencyD3NodeTrackerMap[trackerId];
    }
    else return null;
}

function countNumberOfCompetenciesWithoutCoverage(cpdArray) {
    for (var i=0;i<cpdArray.length;i++) {
        var cpd = cpdArray[i];
        if (!cpd.hasAssertion) {
            numCompsWithoutCoverage++;
            countNumberOfCompetenciesWithoutCoverage(cpd.children);
        }
    }
}

function generateNumberOfCompetenciesWithoutCoverage() {
    numCompsWithoutCoverage = 0;
    countNumberOfCompetenciesWithoutCoverage(currentD3FrameworkNode.children);
}

function getAssertionsForCompetency(compId) {
    if (competencyAssertionMap[compId]) return competencyAssertionMap[compId];
    else return [];
}

//TODO getAssertionsForD3NodeInclusive fix for multi node clusters
function getAssertionsForD3NodeInclusive(d3Node) {
    var d3nt = selectedFrameworkCompetencyData.competencyD3NodeTrackerMap[d3Node.data.name.trim()];
    var asArray = getAssertionsForCompetency(d3nt.id);
    if (!d3nt.d3Node || !d3nt.d3Node.parent || d3nt.d3Node.parent == null) return asArray;
    else return asArray.concat(getAssertionsForD3NodeInclusive(d3nt.d3Node.parent));
}

function getAssertionsForCompetencyPacketDataInclusive(cpd) {
    var asArray = getAssertionsForCompetency(cpd.id);
    var d3nt = selectedFrameworkCompetencyData.competencyD3NodeTrackerMap[cpd.id];
    if (!d3nt || !d3nt.d3Node || !d3nt.d3Node.parent || d3nt.d3Node.parent == null) return asArray;
    else return asArray.concat(getAssertionsForD3NodeInclusive(d3nt.d3Node.parent));
}

function getUniqueProfilesForAssertions(asArray) {
    var upo = {};
    for (var i=0;i<asArray.length;i++) {
        var sp = asArray[i].getSubject().toPem();
        if (selectedProfiles.includes(sp)) {
            upo[sp] = sp;
        }
    }
    var upoa = [];
    for (var prof in upo) {
        if (upo.hasOwnProperty(prof)) upoa.push(prof);
    }
    return upoa;
}

//TODO getProfilesWithAssertedCompetencyAndParents adjust for multi-node clusters
function getProfilesWithAssertedCompetencyAndParents(compId) {
    var cpd = selectedFrameworkCompetencyData.competencyPacketDataMap[compId];
    if (!cpd) return [];
    else {
        var asArray =  getAssertionsForCompetencyPacketDataInclusive(cpd);
        if (!asArray || asArray.length == 0) return [];
        else return getUniqueProfilesForAssertions(asArray);
    }
}

//TODO getNumberOfProfilesWithAssertedCompetencyAndParents adjust for multi-node clusters
function getNumberOfProfilesWithAssertedCompetencyAndParents(compId) {
    var cpa = getProfilesWithAssertedCompetencyAndParents(compId);
    if (cpa) return cpa.length;
    else return 0;
}

function checkForGapContentsSearchbarEnter(event) {
    if (event.which == 13 || event.keyCode == 13) {
        $(GAP_CONT_SRCH_INPT).autocomplete("close");
        findItemByGapContentsSearchBar($(GAP_CONT_SRCH_INPT).val().trim());
    }
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

//Right now this only handles a single framework...may need to account for multiple frameworks at some point
function parseSelectedFramework(selectedFwk) {
    selectedFramework =  null;
    for (var i=0;i<availableFrameworkList.length;i++) {
        var f = availableFrameworkList[i];
        if (buildIDableString(f.shortId()) == selectedFwk) {
            selectedFramework = f;
        }
    }
}

function addSelectedFrameworks() {
    hideModalError(ADD_FWK_MODAL);
    var selectedFwk = $(ADD_FWK_RES_SELECT).val();
    if (!selectedFwk || selectedFwk.trim().length == 0) showModalError(ADD_FWK_MODAL,"You must select a framework");
    else {
        parseSelectedFramework(selectedFwk);
        hasSelectedFrameworkBeenProcessed = false;
        currentAddMode = ADD_MODE;
        $(ADD_FWK_MODAL).foundation('close');
        setCircleFocusSummaryHeader(selectedFramework.getName());
        buildGapAnalysisData();
    }
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
    hideModalError(ADD_FWK_MODAL);
    hideModalBusy(ADD_FWK_MODAL);
    enableModalInputsAndButtons();
    $(ADD_FWK_FLTR_TYPE_SELECT).val(TITLE_FWK_FLTR_TYPE);
    fillInAddFwkResults();
    $(ADD_FWK_MODAL).foundation('open');
}

//**************************************************************************************************
// Add Profile Modal
//**************************************************************************************************

function parseSelectedProfiles(selectedProfs) {
    selectedProfiles = [];
    for (var i=0;i<contactDisplayList.length;i++) {
        var c = contactDisplayList[i];
        if (selectedProfs.includes(buildIDableString(c.pkPem))) selectedProfiles.push(c.pkPem);
    }
}

function addSelectedProfiles() {
    hideModalError(ADD_PRF_MODAL);
    var selectedProfs = $(ADD_PRF_RES_SELECT).val();
    if (!selectedProfs || selectedProfs.length == 0) showModalError(ADD_PRF_MODAL,"You must select at least one profile");
    else {
        parseSelectedProfiles(selectedProfs);
        haveSelectedProfilesBeenProcessed = false;
        if (currentAddMode == INIT_MODE) openAddFrameworkModal();
        else {
            $(ADD_PRF_MODAL).foundation('close');
            buildGapAnalysisData();
        }
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
    hideModalError(ADD_PRF_MODAL);
    hideModalBusy(ADD_PRF_MODAL);
    enableModalInputsAndButtons();
    if (currentAddMode == INIT_MODE) initializeSelectedDataPoints();
    $(ADD_PRF_TYPE_SELECT).val(IND_PRF_TYPE);
    fillInAddProfResults(IND_PRF_TYPE);
    $(ADD_PRF_MODAL).foundation('open');
}

//**************************************************************************************************
// Gap Circle Graph Supporting Functions
//**************************************************************************************************
function getGapCgCircleText(d) {
    if (!d || !d.data || !d.data.name) return "UNDEFINED 'D'";
    else if (selectedFrameworkCompetencyData.competencyD3NodeTrackerMap[d.data.name]) {
        var text = getCompetencyName(d.data.name);
        if (text == "") text = "UNDEFINED NODE PACKET";
        return text;
    }
    return "UNDEFINED NAME";
}

//**************************************************************************************************
// Graph View Sidebar (Right-Hand Side)
//**************************************************************************************************

function buildSidebarDetailsProfileDisplayNameList(profPemList) {
    var dna = [];
    for (var i=0;i<profPemList.length;i++) {
        dna.push(contactsByPkPemMap[profPemList[i]].displayName);
    }
    dna.sort();
    return dna;
}

function buildSidebarDetailsProfileList(cpd) {
    var profs = getProfilesWithAssertedCompetencyAndParents(cpd.id);
    if (!profs || profs.length == 0) $(CIR_FCS_DTL_PROF_LIST_CTR).hide();
    else {
        $(CIR_FCS_DTL_PROF_LIST).empty();
        var dna = buildSidebarDetailsProfileDisplayNameList(profs);
        for (var i=0;i<dna.length;i++) {
            var pli = $("<li/>");
            pli.html("<span class=\"circleFocusOverviewField\">" + dna[i] + "</span>");
            $(CIR_FCS_DTL_PROF_LIST).append(pli);
        }
        $(CIR_FCS_DTL_PROF_LIST_CTR).show();
    }
}

//TODO showCircleGraphSidebarDetails handle multi node packets
function showCircleGraphSidebarDetails(compId) {
    hideCircleSidebarDetails();
    if (!compId || compId == null) return;
    else if (compId == selectedFramework.getName()) {
        //removeAllGraphViewSummaryHighLighting();
    }
    else {
        var cpd = selectedFrameworkCompetencyData.competencyPacketDataMap[compId];
        if (!cpd || cpd == null) debugMessage("Cannot locate competency data for: " + compId);
        else {
            $(CIR_FCS_DTL_SING_NAME).html(cpd.name);
            $(CIR_FCS_DTL_SING_DESC).html(cpd.description);
            buildSidebarDetailsProfileList(cpd);
            showCircleSidebarDetails();
        }
    }
}

//**************************************************************************************************
// Graph View Summary (Left-Hand Side)
//**************************************************************************************************

function buildGapSummaryCompItemElementId(compNode) {
    return buildIDableString(compNode.getId().trim()) + "_psi";
}

//TODO toggleGapSummaryCompChild figure out bug with this
function toggleGapSummaryCompChild(ce) {
    if (ce.find('i:first').hasClass("fa-chevron-circle-right")) {
        ce.find('i:first').attr("class", "fa fa-chevron-circle-down");
        ce.parent().find('ul:first').attr("style", "display:block");
    } else {
        ce.find('i:first').attr("class", "fa fa-chevron-circle-right");
        ce.parent().find('ul:first').attr("style", "display:none");
    }
}

function generateCompetencyLineItemHtmlForGapSummaryCompList(compNode, hasChildren) {
    var liHtml = "";
    if (hasChildren) {
        liHtml += "<a onclick=\"toggleGapSummaryCompChild($(this))\"><i class=\"fa fa-chevron-circle-right " + CIR_FCS_SUM_ITEM_CLASS_ID + "\" aria-hidden=\"true\"></i></a>";
    }
    else {
        liHtml += "<i class=\"fa fa-circle " + CIR_FCS_SUM_ITEM_CLASS_ID + "\" aria-hidden=\"true\"></i>";
    }
    var numberOfProfsWithComp = getNumberOfProfilesWithAssertedCompetencyAndParents(compNode.getId());
    liHtml += "&nbsp;&nbsp;<a class=\"psiItem\" id=\"" + buildGapSummaryCompItemElementId(compNode) + "\" " +
        "onclick=\"zoomGapCgByD3NodeId('" + escapeSingleQuote(compNode.getId().trim()) + "',true)\">" +
        compNode.getName().trim() + " <span class=\"gapSummaryCompCov\">" +
        numberOfProfsWithComp + "/" + selectedProfiles.length + " (" +
        generatePercentFromNumber(numberOfProfsWithComp/selectedProfiles.length) + ") </span></a>";
    return liHtml;
}

//TODO addChildToGapSummaryCompList construct list view for multi node competency cluster
function addChildToGapSummaryCompList(parentUl, childCcn, isRootComp) {
    var childLi = $("<li/>");
    if (isRootComp) childLi.addClass("gpsiRootComp");
    else childLi.addClass("gpsiNonRootComp");
    var cpd = selectedFrameworkCompetencyData.competencyPacketDataMap[childCcn.id];
    var compNode = cpd.cassNodePacket.getNodeList()[0];
    var hasChildren = childCcn.children && childCcn.children.length > 0;
    childLi.html(generateCompetencyLineItemHtmlForGapSummaryCompList(compNode, hasChildren));
    if (hasChildren) {
        childCcn.children.sort(function (a, b) {
            return a.name.localeCompare(b.name);
        });
        var childsChildUl = $("<ul/>");
        childsChildUl.attr("class", "fa-ul gpsiChild");
        childsChildUl.attr("style", "display:none");
        $(childCcn.children).each(function (i, cc) {
            addChildToGapSummaryCompList(childsChildUl, cc, false);
        });
        childLi.append(childsChildUl);
    }
    parentUl.append(childLi);
}

function buildGapSummaryCompetencyList() {
    $(CIR_FCS_SUM_COMP_LIST_CTR).empty();
    var d3fn = currentD3FrameworkNode;
    if (!d3fn || d3fn == null) return;
    if (d3fn.children && d3fn.children.length > 0) {
        d3fn.children.sort(function (a, b) {
            return a.name.localeCompare(b.name);
        });
        var childUl = $("<ul/>");
        childUl.attr("class", "no-bullets gpsiChild");
        $(d3fn.children).each(function (i, c) {
            addChildToGapSummaryCompList(childUl, c, true);
        });
        $(CIR_FCS_SUM_COMP_LIST_CTR).append(childUl);
    }
}

function buildGapSummaryOverview() {
    var numberOfComps = Object.keys(selectedFrameworkCompetencyData.competencyPacketDataMap).length;
    $(CIR_FCS_SUM_NUM_COMPS).html(numberOfComps);
    generateNumberOfCompetenciesWithoutCoverage();
    var numberOfCompsCovered = (numberOfComps - numCompsWithoutCoverage);
    $(CIR_FCS_SUM_COV).html(numberOfCompsCovered + "/" + numberOfComps + " (" + generatePercentFromNumber(numberOfCompsCovered/numberOfComps) + ")");
}

function buildSelectedProfileList() {
    $(CIR_FCS_SUM_SEL_PROF_LIST).empty();
    for (var i=0;i<selectedProfiles.length;i++) {
        var spLi = $("<li/>");
        spLi.html(contactsByPkPemMap[selectedProfiles[i]].displayName);
        $(CIR_FCS_SUM_SEL_PROF_LIST).append(spLi);
    }
}

function buildGraphProfileSummary() {
    buildSelectedProfileList();
    buildGapSummaryOverview();
    buildGapSummaryCompetencyList();
}

//**************************************************************************************************
// Gap Contents Search Auto Complete
//**************************************************************************************************

function findItemByGapContentsSearchBar(selectedValue) {
    if (competencySearchAutoCompleteMap.hasOwnProperty(selectedValue)) {
        zoomGapCircleGraphByAutoComplete(selectedValue);
    }
}

function buildGapContentsSearchAutoCompleteDataFromAutoCompleteMap() {
    var data = [];
    for (var property in competencySearchAutoCompleteMap) {
        if (competencySearchAutoCompleteMap.hasOwnProperty(property)) {
            if (property != "Framework not found") data.push(property);
        }
    }
    return data;
}

function fillInGapContentsSearchAutoComplete() {
    $(GAP_CONT_SRCH_INPT).autocomplete({
        source: buildGapContentsSearchAutoCompleteDataFromAutoCompleteMap(),
        select: function (event, ui) {
            findItemByGapContentsSearchBar(ui.item.label);
        }
    });
}


//**************************************************************************************************
// Gap Analysis Display
//**************************************************************************************************

function buildGapAnalysisDisplays() {
    showPageAsBusy("Building gap analysis display...");
    clearGapCircleSvg();
    buildGapGraphCircles(null, JSON.parse(currentD3FrameworkNodeString));
    markGapCompetencyNodes(currentD3FrameworkNode.children);
    buildGraphProfileSummary();
    hideCircleSidebarDetails();
    showPageMainContentsContainer();
    fillInGapContentsSearchAutoComplete();
    $(GAP_CONT_SRCH_INPT).val("");
    showGapContentsSearchBar();
    enableAddItemButtons();
    showMainMenu();
    showGapAnalysisTools();
}

//**************************************************************************************************
// Gap Analysis Display Prep
//**************************************************************************************************

function prepForGapAnalysisDisplay() {
    showPageAsBusy("Processing gap data...");
    selectedFrameworkCompetencyData = buildFrameworkCompetencyData(selectedFramework.shortId(),selectedFramework.getName(),selectedFrameworkNodePacketGraph,competencyAssertionMap);
    showPageAsBusy("Prepping framework display nodes...");
    currentD3FrameworkNode = setUpD3FrameworkNodes(selectedFramework.getName(),selectedFrameworkCompetencyData);
    currentD3FrameworkNodeString = buildD3JsonString(currentD3FrameworkNode);
    debugMessage("selectedFrameworkCompetencyData");
    debugMessage(selectedFrameworkCompetencyData);
    debugMessage("currentD3FrameworkNode:");
    debugMessage(currentD3FrameworkNode);
    debugMessage("currentD3FrameworkNode JSON String:");
    debugMessage(currentD3FrameworkNodeString);
    buildGapAnalysisDisplays();
}

//**************************************************************************************************
// Gap Analysis Functions
//**************************************************************************************************

function buildGapAnalysisData() {
    if (!haveSelectedProfilesBeenProcessed) fetchSelectedProfileAssertions();
    else if (!hasSelectedFrameworkBeenProcessed) collapseSelectedFramework();
    else prepForGapAnalysisDisplay();
}

//**************************************************************************************************
// Framework Collapsing
//**************************************************************************************************

function doesFrameworkHaveCircularDependency(fnpg) {
    for (var i=0;i<fnpg.getNodePacketList().length;i++) {
        var np = fnpg.getNodePacketList()[i];
        if (np.getNodeCount() > 1) return true;
    }
    return false;
}

function frameworkCollapsedCorrectly(fnpg) {
    if (!fnpg || fnpg == null || fnpg.getNodePacketList() == null || fnpg.getNodePacketList().length == 0) {
        return false;
    }
    return true;
}

function handleCollapseFrameworkSuccess(frameworkId,fnpg) {
    debugMessage("Framework collapsed:" + frameworkId);
    debugMessage(fnpg);
    if (!frameworkCollapsedCorrectly(fnpg)) {
        showPageError("Could not determine framework competencies.  Check framework permissions.<br><a onclick=\"openAddFrameworkModal()\">Try a Different Framework?</a>");
    }
    else if (doesFrameworkHaveCircularDependency(fnpg)) {
        showFrameworkHasCircularDependencyWarning();
    }
    else {
        hasSelectedFrameworkBeenProcessed = true;
        selectedFrameworkNodePacketGraph = fnpg;
        prepForGapAnalysisDisplay();
    }
}

function handleCollapseFrameworkFailure(err) {
    showPageError("Could not collapse framework (" + selectedFramework.getName() + "): " + err);
}

function collapseSelectedFramework() {
    showPageAsBusy("Collapsing selected framework...");
    var fc = new FrameworkCollapser();
    fc.collapseFramework(repo, selectedFramework, CREATE_IMPLIED_RELATIONS_ON_COLLAPSE, handleCollapseFrameworkSuccess, handleCollapseFrameworkFailure);
}

//**************************************************************************************************
// Assertion & Assertion Envelope Fetching
//**************************************************************************************************

function buildAssertionMaps() {
    showPageAsBusy("Processing assertions (step 2 of 2)...");
    assertionMap = {};
    competencyAssertionMap = {};
    profileAssertionsMap = {};
    assertionNegativeMap = {};
    $(assertionList).each(function (i, as) {
        assertionMap[as.shortId()] = as;
        assertionNegativeMap[as.shortId()] = as.getNegative();
        if (!competencyAssertionMap[as.competency] || competencyAssertionMap[as.competency] == null) {
            competencyAssertionMap[as.competency] = [];
        }
        competencyAssertionMap[as.competency].push(as);
        if (!profileAssertionsMap[as.getSubject().toPem()] || profileAssertionsMap[as.getSubject().toPem()] == null) {
            profileAssertionsMap[as.getSubject().toPem()] = [];
        }
        profileAssertionsMap[as.getSubject().toPem()].push(as);
    });
}

function sortAssertionList() {
    assertionList.sort(function (a, b) {
        return a.getAssertionDate() - b.getAssertionDate();
    });
}

function processRelevantAssertions() {
    if (assertionList.length > 0) {
        showPageAsBusy("Processing assertions (step 1 of 3)...");
        sortAssertionList();
        debugMessage(assertionList);
        buildAssertionMaps();    
    }
    haveSelectedProfilesBeenProcessed = true;
    if (!hasSelectedFrameworkBeenProcessed) collapseSelectedFramework();
    else prepForGapAnalysisDisplay();
}

function buildAssertionListFromSearchAndEnvelopes() {
    var ao = {};
    for (var i=0;i<assertionEnvelopeEcAssertionList.length;i++) {
        ao[assertionEnvelopeEcAssertionList[i].shortId()] = assertionEnvelopeEcAssertionList[i];
    }
    for (var i=0;i<ecAssertionSearchReturnList.length;i++) {
        ao[ecAssertionSearchReturnList[i].shortId()] = ecAssertionSearchReturnList[i];
    }
    for (var asid in ao) {
        if (ao.hasOwnProperty(asid)) {
            assertionList.push(ao[asid]);
        }
    }
}

function isEnvelopeOwnedBySelectedProfile(asrEnv) {
    if (!asrEnv.owner || asrEnv.owner == null) return false;
    for (var j=0;j<asrEnv.owner.length;j++) {
        if (selectedProfiles.includes(asrEnv.owner[j])) return true;
    }
    return false;
}

function isEncryptedAssertionEnvelope(asrEnv) {
    if (asrEnv.encryptedType && asrEnv.encryptedType == "AssertionEnvelope") return true;
    return false;
}

function registerAssertionEnvelopeAssertions(asrEnv) {
    if (asrEnv.assertion && asrEnv.assertion != null) {
        for (var i=0;i<asrEnv.assertion.length;i++) {
            var eca = new EcAssertion();
            eca.copyFrom(asrEnv.getAssertion(i));
            assertionEnvelopeEcAssertionList.push(eca);
        }
    }
}

function processPotentialAssertionEnvelope(potAsrEnv) {
    debugMessage("processPotentialAssertionEnvelope: " + potAsrEnv.id);
    if (isEncryptedAssertionEnvelope(potAsrEnv) && isEnvelopeOwnedBySelectedProfile(potAsrEnv)) {
        var nv = new EcEncryptedValue();
        nv.copyFrom(potAsrEnv);
        var aed = nv.decryptIntoObject();
        var realAsrEnv = new AssertionEnvelope();
        realAsrEnv.copyFrom(aed);
        assertionEnvelopeList.push(realAsrEnv);
        registerAssertionEnvelopeAssertions(realAsrEnv);
    }
}

function handleGetAssertionEnvelopesSuccess(ecRldArray) {
    debugMessage("handleGetAssertionEnvelopesSuccess: " + ecRldArray.length);
    if (ecRldArray && ecRldArray != null) {
        for (var i=0;i<ecRldArray.length;i++) {
            processPotentialAssertionEnvelope(ecRldArray[i]);
        }
    }
    buildAssertionListFromSearchAndEnvelopes();
    processRelevantAssertions();
}

function handleGetAssertionEnvelopesFailure(failMsg) {
    debugMessage("handleGetAssertionEnvelopesFailure: " + failMsg);
    showPageError("Portfolio fetch failed: " + failMsg);
}

function fetchAssertionEnvelopes() {
    showPageAsBusy("Fetching selected profile portfolios...");
    repo.searchWithParams(new AssertionEnvelope().getSearchStringByType(),{'size':MAX_ASSR_SEARCH_SIZE},null,handleGetAssertionEnvelopesSuccess,handleGetAssertionEnvelopesFailure);
}

function filterAssertionsBySubject(arrayOfEcAssertions) {
    var filteredEcAssertions = [];
    for (var i = 0; i < arrayOfEcAssertions.length; i++) {
        var ecaSubj = arrayOfEcAssertions[i].getSubject();
        if (ecaSubj && ecaSubj != null) {
            if (selectedProfiles.includes(ecaSubj.toPem())) {
                filteredEcAssertions.push(arrayOfEcAssertions[i]);
            }
        }
    }
    return filteredEcAssertions;
}

function handleGetAssertionsSuccess(arrayOfEcAssertions) {
    debugMessage("handleGetAssertionsSuccess: " + arrayOfEcAssertions.length);
    ecAssertionSearchReturnList = filterAssertionsBySubject(arrayOfEcAssertions);
    debugMessage("ecAssertionSearchReturnList(filtered): " + ecAssertionSearchReturnList.length);
    fetchAssertionEnvelopes();
}

function handleGetAssertionsFailure(failMsg) {
    debugMessage("handleGetAssertionsFailure: " + failMsg);
    showPageError("Assertion fetch failed: " + failMsg);
}

function getAssertionSearchQueryForSelectedProfiles() {
    var searchQuery = "";
    if (selectedProfiles.length > 1) searchQuery = "("
    for (var i=0;i<selectedProfiles.length;i++) {
        if (i > 0) searchQuery += " OR ";
        searchQuery += "(\\*@reader:\"" + selectedProfiles[i] + "\")";
    }
    if (selectedProfiles.length > 1) searchQuery += ")";
    debugMessage("Assertion search query: " + searchQuery);
    return searchQuery;
}

function fetchSelectedProfileAssertions() {
    showPageAsBusy("Fetching selected profile assertions...");
    assertionList = [];
    ecAssertionSearchReturnList = [];
    assertionEnvelopeEcAssertionList = [];
    assertionEnvelopeList = [];
    EcAssertion.search(repo, getAssertionSearchQueryForSelectedProfiles(), handleGetAssertionsSuccess, handleGetAssertionsFailure, {'size':MAX_ASSR_SEARCH_SIZE});
}

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
