//**************************************************************************************************
// CASS UI Framework Explorer UI Utility Functions
//**************************************************************************************************

//**************************************************************************************************
// Constants

const DEBUG_CONSOLE = true;
const DEBUG_ALERT = false;

// Color Themes
//const FRAMEWORK_EXP_THEME_CLASS = "theme-burgendy";
//const EXP_CIR_COLOR_RANGE = "burgendy";

// Various Page Element IDs
const CASSUI_MAIN_BUSY_CTR = "#cassUiMainBusyContainer";
const CASSUI_MAIN_BUSY_TXT = "#cassUiMainBusyText";
const CASSUI_MAIN_ERR_CTR = "#cassUiMainErrorContainer";
const CASSUI_MAIN_ERR_TXT = "#cassUiMainErrorText";
const CASSUI_HIGH_LVL_WARNING = ".cassUiHighLevelWarning";
const CASSUI_MAIN_CONTENTS_CTR = "#cassUiMainContentsContainer";

const CASSUI_MODAL_INPUT = ".cassUiModalInput";
const CASSUI_MODAL_BTN = ".cassUiModalButton";
const CASSUI_MODAL_BUSY_CTR = ".cassUiModalBusyCtr";
const CASSUI_MODAL_BUSY_TXT = ".cassUiModalBusyText";
const CASSUI_MODAL_ERROR_CTR = ".cassUiModalErrorCtr";
const CASSUI_MODAL_ERROR_TXT = ".cassUiModalErrorText";

//**************************************************************************************************
// Variables


//**************************************************************************************************
// General UI Utility Functions
//**************************************************************************************************

queryParams = function () {
    if (window.document.location.search == null)
        return {};
    var hashSplit = (window.document.location.search.split("?"));
    if (hashSplit.length > 1) {
        var o = {};
        var paramString = hashSplit[1];
        var parts = (paramString).split("&");
        for (var i = 0; i < parts.length; i++)
            o[parts[i].split("=")[0]] = decodeURIComponent(parts[i].replace(parts[i].split("=")[0] + "=", ""));
        return o;
    }
    return {};
};

queryParams = queryParams();

function debugMessage(msg) {
    if (DEBUG_CONSOLE) console.log(msg);
    if (DEBUG_ALERT) alert(msg);
}

function showScreen(newScreen) {
    $('.screen:visible').fadeOut('fast', function () {
        $('#' + newScreen).fadeIn('fast');
    });
}

function showPageMainContentsContainer() {
    if (!$(CASSUI_MAIN_CONTENTS_CTR).is(":visible")) {
        $(CASSUI_MAIN_BUSY_CTR).hide();
        $(CASSUI_MAIN_ERR_CTR).hide();
        $(CASSUI_MAIN_CONTENTS_CTR).show();
    }
}

function hidePageMainContentsContainer() {
    $(CASSUI_MAIN_CONTENTS_CTR).hide();
}


function showPageAsBusy(text) {
    $(CASSUI_MAIN_ERR_CTR).hide();
    $(CASSUI_HIGH_LVL_WARNING).hide();
    hidePageMainContentsContainer();
    $(CASSUI_MAIN_BUSY_TXT).html(text);
    $(CASSUI_MAIN_BUSY_CTR).show();
}

function showPageError(text) {
    console.error(text);
    $(CASSUI_MAIN_BUSY_CTR).hide();
    $(CASSUI_HIGH_LVL_WARNING).hide();
    hidePageMainContentsContainer();
    $(CASSUI_MAIN_ERR_TXT).html(text);
    $(CASSUI_MAIN_ERR_CTR).show();
}

function disableModalInputsAndButtons() {
    $(CASSUI_MODAL_INPUT).attr("disabled", "true");
    $(CASSUI_MODAL_BTN).attr("disabled", "true");
}

function enableModalInputsAndButtons() {
    $(CASSUI_MODAL_INPUT).removeAttr("disabled");
    $(CASSUI_MODAL_BTN).removeAttr("disabled");
}

function showModalBusy(modalId,busyHtml) {
    hideModalError(modalId);
    disableModalInputsAndButtons();
    $(modalId + ' ' + CASSUI_MODAL_BUSY_TXT).html(busyHtml);
    $(modalId + ' ' + CASSUI_MODAL_BUSY_CTR).show();
}

function hideModalBusy(modalId) {
    $(modalId + ' ' + CASSUI_MODAL_BUSY_CTR).hide();
}

function showModalError(modalId,errorHtml) {
    hideModalBusy(modalId);
    enableModalInputsAndButtons();
    $(modalId + ' ' + CASSUI_MODAL_ERROR_TXT).html(errorHtml);
    $(modalId + ' ' + CASSUI_MODAL_ERROR_CTR).show();
}

function hideModalError(modalId) {
    $(modalId + ' ' + CASSUI_MODAL_ERROR_CTR).hide();
    $(CASSUI_MODAL_INPUT).removeClass("invalid");
}

function showModalInputAsInvalid(fieldId) {
    $(fieldId).addClass("invalid");
}

function generateAnchorLink(href, text, target) {
    return "<a href=\"" + href + "\" target=\"" + target + "\">" + escapeSingleQuote(text) + "</a>";
}

function buildFrameworkHyperlink(frameworkId,frameworkName) {
    return generateAnchorLink("https://cassproject.github.io/cass-editor/?frameworkId=" + frameworkId + "&view=true", frameworkName, frameworkName);
}

function buildFrameworkCompetencyHyperlink(frameworkId,competencyId,competencyName) {
    return generateAnchorLink("https://cassproject.github.io/cass-editor/?frameworkId=" + frameworkId + "&competencyId=" +  + "&view=true", competencyName, competencyName);
}

if ( typeof String.prototype.startsWith != 'function' ) {
    String.prototype.startsWith = function( str ) {
        return str.length > 0 && this.substring( 0, str.length ) === str;
    }
};

if ( typeof String.prototype.endsWith != 'function' ) {
    String.prototype.endsWith = function( str ) {
        return str.length > 0 && this.substring( this.length - str.length, this.length ) === str;
    }
};

//**************************************************************************************************
// Gap Analysis Page UI Functions
//**************************************************************************************************


//**************************************************************************************************
// JQuery Functions
//**************************************************************************************************

jQuery.fn.scrollTo = function (elem, speed) {
    $(this).animate({
        scrollTop: $(this).scrollTop() - $(this).offset().top + $(elem).offset().top
    }, speed == undefined ? 1000 : speed);
    return this;
};

//**************************************************************************************************
// Foundation
//**************************************************************************************************

$(document).foundation();
