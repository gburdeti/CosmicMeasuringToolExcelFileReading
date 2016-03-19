/* SHEET DROPDOWN */
function getSheetDropdown(){
	return $('#dd_sheet');
}

function getSheetOptions(){
	return $('#opt_sheet');
}

function sheetDropdownEnabled(enable){
	getSheetDropdown().prop('disabled', !enable);
}

/* LINE DROP DOWN */
function getLineDropdown(){
	return $('#dd_line');
}

function getLineOptions(){
	return $('#opt_line');
}

function lineDropdownEnabled(enable){
	getLineDropdown().prop('disabled', !enable);
}

/* COLUMN GROUPS */
function getMesureDetailsControl(){
	return $("#frm_details");
}

/* COLUMN DROP DOWNS */
function getChangeDropDown(){
	return $("#dd_changements");
}

function getChangeOptions(){
	return $("#opt_changements");
}

// SYSTEME
function getSystemDropDown(){
	return $("dd_systeme");
}

function getSystemOptions(){
	return $("opt_systeme");
}

// REFERENCE
function getReferenceDropDown(){
	return $("dd_reference");
}

// PROCESSUS
var processColumn = null;
function getReferenceOptions(){
	return $("opt_reference");
}

function getProcessDropDown(){
	return $("dd_processus");
}
