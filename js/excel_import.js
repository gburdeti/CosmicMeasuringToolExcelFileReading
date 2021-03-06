var sheets = null;
var selectedSheetIndex = 0;
var selectedLineIndex =  0;
var xlf = null;
var drop = null;

var changeColumn = null;
var dataColumn = null;
var systemColumn = null;
var referenceColumn = null;
var processColumn = null;
var dataGroupColumn = null;
var exitColumn = null;
var enterColumn = null;
var readColumn = null;
var writeColumn = null;
var commentColumn = null;

function fixdata(data) {
	var o = "", l = 0, w = 10240;
	for(; l<data.byteLength/w; ++l) o+=String.fromCharCode.apply(null,new Uint8Array(data.slice(l*w,l*w+w)));
	o+=String.fromCharCode.apply(null, new Uint8Array(data.slice(l*w)));
	return o;
}

function ab2str(data) {
	var o = "", l = 0, w = 10240;
	for(; l<data.byteLength/w; ++l) o+=String.fromCharCode.apply(null,new Uint16Array(data.slice(l*w,l*w+w)));
	o+=String.fromCharCode.apply(null, new Uint16Array(data.slice(l*w)));
	return o;
}

function s2ab(s) {
	var b = new ArrayBuffer(s.length*2), v = new Uint16Array(b);
	for (var i=0; i != s.length; ++i) v[i] = s.charCodeAt(i);
	return [v, b];
}

function handleDrop(e) {
	e.stopPropagation();
	e.preventDefault();
	var files = e.dataTransfer.files;
	processFile(files);
}

function processFile(files){
    var f = files[0];
	{
		var reader = new FileReader();
		reader.onload = function(e) {
			var data = e.target.result;
			var	wb = XLSX.read(data, {type: 'binary'});
			sheets = getSheetData(wb);
            updateSheetOptions(sheets);
            selectSheet(-1);
            sheetDropdownEnabled(true);
            setOutput(out, sheets);
		};
		reader.readAsBinaryString(f);
	}
}

function updateSheetOptions(sheets){
    var sheetOptions = getSheetOptions();
    sheetOptions.html("");
    for(var sheetIndex in sheets){
        sheetOptions.append("<li><a href=\"#\" data-value=\"" + sheetIndex + "\" onclick=\"event.preventDefault(); selectSheet('" + sheetIndex + "');\">" + sheets[sheetIndex].name + "</a></li>");
    }
}

function selectSheet(sheetIndex) {
    if(selectedSheetIndex != sheetIndex)
    {
        selectedSheetIndex = sheetIndex;
        var sheetDropdown = getSheetDropdown();
        sheetDropdown.html("");
        if(selectedSheetIndex >= 0)
            sheetDropdown.append(sheets[sheetIndex].name);
        else
            sheetDropdown.append("Sheet selection");
        sheetDropdown.append("<span class=\"caret\"></span>");
        onSelectedSheetChanged();
    }
}

function onSelectedSheetChanged(){
    updateSheetOutput();
	updateLineOptions();
	// update the line
    selectLine(-1);
    lineDropdownEnabled(selectedSheetIndex >= 0);
}

function updateSheetOutput()
{
    var sheet = null;
    if(selectedSheetIndex >= 0) sheet = sheets[selectedSheetIndex];
    setOutput(out_sheet, sheet);
}

function updateLineOptions(){
	var maxLines = 10;
    var lineOptions = getLineOptions();
    lineOptions.html("");
    if(selectedSheetIndex >= 0){
        var lineCount = 0;
		var selectedSheet = sheets[selectedSheetIndex];
        for(var lineIndex in selectedSheet.lines){
            lineOptions.append("<li><a href=\"#\" data-value=\"" + lineIndex + "\" onclick=\"event.preventDefault(); selectLine('" + lineIndex + "');\">" + lineIndex + "</a></li>");
			if(++lineCount >= maxLines)return false;
        }
    }
}

function selectLine(lineIndex){
    if(selectedLineIndex != lineIndex){
        selectedLineIndex = lineIndex;
        var lineDropdown = getLineDropdown();
        lineDropdown.html("");
        if(selectedLineIndex >= 0)
            lineDropdown.append(selectedLineIndex);
        else
            lineDropdown.append("Line selection");
        lineDropdown.append("<span class=\"caret\"></span>");
        onSelectedLineChanged();
    }
}

function onSelectedLineChanged(){
    updateLineOutput();
	if(selectedLineIndex >= 0)
	{
		updateHeaderMappingDisplay();
		getMesureDetailsControl().show();
	}
	else
	{
		getMesureDetailsControl().hide();
	}
}

function updateLineOutput()
{
	var line = null;
    if(selectedLineIndex >= 0) line = sheets[selectedSheetIndex].lines[selectedLineIndex];
    setOutput(out_line, line);
}

function updateHeaderMappingDisplay(){
	if(selectedLineIndex >= 0)
	{
		var selectedLine = sheets[selectedSheetIndex].lines[selectedLineIndex];
		updateDropDownOptions(getChangeOptions(), selectedLine, function(e){e.preventDefault(); var value = $(e.target); var data = value.attr("data-value"); setColumnValue(getChangeDropDown(), data, "Changements"); changeColumn = data;});
		updateDropDownOptions(getSystemOptions(), selectedLine, function(e){e.preventDefault(); var value = $(e.target); var data = value.attr("data-value"); setColumnValue(getSystemDropDown(), data, "Systeme"); systemColumn = data;});
		updateDropDownOptions(getReferenceOptions(), selectedLine, function(e){e.preventDefault(); var value = $(e.target); var data = value.attr("data-value"); setColumnValue(getReferenceDropDown(), data, "Reference"); referenceColumn = data;});
		updateDropDownOptions(getProcessOptions(), selectedLine, function(e){e.preventDefault(); var value = $(e.target); var data = value.attr("data-value"); setColumnValue(getProcessDropDown(), data, "Processus Fonctionnel"); processColumn = data;});
		updateDropDownOptions(getDataGroupOptions(), selectedLine, function(e){e.preventDefault(); var value = $(e.target); var data = value.attr("data-value"); setColumnValue(getDataGroupDropDown(), data, "Groupe de donnees"); dataGroupColumn = data;});
		updateDropDownOptions(getEnterOptions(), selectedLine, function(e){e.preventDefault(); var value = $(e.target); var data = value.attr("data-value"); setColumnValue(getEnterDropDown(), data, "Entree"); enterColumn = data; enterColumn = data;});
		updateDropDownOptions(getExitOptions(), selectedLine, function(e){e.preventDefault(); var value = $(e.target); var data = value.attr("data-value"); setColumnValue(getExitDropDown(), data, "Sortie"); exitColumn = data;});
		updateDropDownOptions(getReadOptions(), selectedLine, function(e){e.preventDefault(); var value = $(e.target); var data = value.attr("data-value"); setColumnValue(getReadDropDown(), data, "Lecture"); readColumn = data;});
		updateDropDownOptions(getWriteOptions(), selectedLine, function(e){e.preventDefault(); var value = $(e.target); var data = value.attr("data-value"); setColumnValue(getWriteDropDown(), data, "Ecriture"); writeColumn = data;});
		updateDropDownOptions(getCommentOptions(), selectedLine, function(e){e.preventDefault(); var value = $(e.target); var data = value.attr("data-value"); setColumnValue(getCommentDropDown(), value.attr("data-value"), "Commentaire"); commentColumn = data;});
	}
}

function createMeasures(){
	var measures = new Array();
	var selectedSheet = sheets[selectedSheetIndex];
	
	for(var line in selectedSheet.lines){
		if(line > selectedLineIndex){
			var measure = new Object();
			measure.change = selectedSheet.lines[line][changeColumn];
			measure.system = selectedSheet.lines[line][systemColumn];
			measure.reference = selectedSheet.lines[line][referenceColumn];
			measure.process = selectedSheet.lines[line][processColumn];
			measure.dataGroup = selectedSheet.lines[line][dataGroupColumn];
			measure.enter = selectedSheet.lines[line][enterColumn];
			measure.exit = selectedSheet.lines[line][exitColumn];
			measure.read = selectedSheet.lines[line][readColumn];
			measure.write = selectedSheet.lines[line][writeColumn];
			measure.comment = selectedSheet.lines[line][commentColumn];
			measures.push(measure);
		}
	}
	var output = JSON.stringify(measures, 2, 2);
	if(out_measures.innerText === undefined) out_measures.textContent = output;
	else out_measures.innerText = output;
	//console.log(JSON.stringify(measures, 2, 2));
}

function setColumnValue(control, value, nullValue){
	control.html("");
	if(value == null)
	{
		control.html(nullValue);
	}
	else
	{
		control.html(sheets[selectedSheetIndex].lines[selectedLineIndex][value]);
	}
	control.append("<span class=\"caret\"></span>");
}

function updateDropDownOptions(control, options, update){
	control.html("");
	for(var option in options){
		var opt = $("<li></li>");
		var ref = $("<a href='#' data-value='" + option + "'>" + options[option] + "</a>");
		ref.click(update);
		opt.append(ref);
		control.append(opt);
	}
}

function handleDragover(e) {
	e.stopPropagation();
	e.preventDefault();
	e.dataTransfer.dropEffect = 'copy';
}

function handleFile(e) {
	var files = e.target.files;
	processFile(files);
}