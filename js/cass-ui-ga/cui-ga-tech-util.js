//**************************************************************************************************
// CASS UI Gap Analysis Technical Utility Functions
//**************************************************************************************************

//**************************************************************************************************
// JSON String Utilities
//**************************************************************************************************

//Build ID based circles instead of named based circles
function JSONStringifyIdBasedName(object) {
    var cache = [];
    var str = JSON.stringify(object,
        function (key, value) {
            if (key == "name") return undefined;
            else if (key == "parents") return undefined;
            else if (key == "createdRelationsMap") return undefined;
            else if (key == "hasAssertion") return undefined;
            else if (key == "size" && value == "-1") return undefined;
            else if (typeof value === 'object' && value !== null) {
                if (cache.indexOf(value) !== -1) {
                    return value;
                }
                cache.push(value);
            }
            return value;
        });
    cache = null;
    str = str.replaceAll("\"id\":", "\"name\":");
    return str;
};

//Build ID based circles instead of named based circles
function buildD3JsonString(d3n) {
    return JSONStringifyIdBasedName(d3n);
}

//**************************************************************************************************
// General Utilities
//**************************************************************************************************

function buildIDableString(str) {
    return str.replace(/\W+/g, "_");
}

function escapeSingleQuote(str) {
    return str.replace(/'/g, "\\'");
}