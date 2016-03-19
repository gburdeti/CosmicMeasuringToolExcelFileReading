var sheets = null;
var selectedSheetIndex = -1;
var selectedLineIndex = -1;
var xlf = null;
var drop = null;

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

function hideOutputs(){
	$('#sheet_output').hide();
	$('#line_output').hide();
	$('#file_output').hide();
}

function displayOutput(checkbox){
	switch(checkbox.name){
		case "chk_sheet_output":
		if(checkbox.checked)
			$('#sheet_output').show();
		else
			$('#sheet_output').hide();
		break;
		case "chk_line_output":
		if(checkbox.checked)
			$('#line_output').show();
		else
			$('#line_output').hide();
		break;
		case "chk_file_output":
		if(checkbox.checked)
			$('#file_output').show();
		else
			$('#file_output').hide();
		break;
	}
}

function getSheetDropdown(){
	return $('#sheet_dropdown');
}

function sheetDropdownEnabled(enable){
	getSheetDropdown().prop('disabled', !enable);
}

function getLineDropdown(){
	return $('#line_dropdown');
}

function lineDropdownEnabled(enable){
	getLineDropdown().prop('disabled', !enable);
}

function xw(data, cb) {
	transferable = document.getElementsByName("xferable")[0].checked;
	if(transferable) xw_xfer(data, cb);
	else xw_noxfer(data, cb);
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
		var name = f.name;
		reader.onload = function(e) {
			var data = e.target.result;
			var	wb = XLSX.read(data, {type: 'binary'});
			sheets = getSheetData(wb);
            updateSheetOptions(sheets);
            selectSheet(-1);
            sheetDropdownEnabled(true);
            setOutput(sheets);
		};
		reader.readAsBinaryString(f);
	}
}

function updateSheetOptions(sheets){
    var sheetOptions = $('#sheet_options');
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
    selectLine(-1);
    lineDropdownEnabled(selectedSheetIndex >= 0);
}

function updateSheetOutput()
{
    var output = "";
    if(selectedSheetIndex >= 0) output = JSON.stringify(sheets[selectedSheetIndex], 2, 2);
        
    if(out_sheet.innerText === undefined)
        out_sheet.textContent = output;
	else
        out_sheet.innerText = output;
}

function updateLineOptions(){
     var lineOptions = $('#line_options');
     lineOptions.html("");
    if(selectedSheetIndex >= 0){
        var selectedSheet = sheets[selectedSheetIndex];
        for(var lineIndex in selectedSheet.lines){
            lineOptions.append("<li><a href=\"#\" data-value=\"" + lineIndex + "\" onclick=\"event.preventDefault(); selectLine('" + lineIndex + "');\">" + lineIndex + "</a></li>");
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
	// 
}

function updateLineOutput()
{
    var output = "";
    if(selectedLineIndex >= 0) output = JSON.stringify(sheets[selectedSheetIndex].lines[selectedLineIndex], 2, 2);
        
    if(out_line.innerText === undefined)
        out_line.textContent = output;
	else
        out_line.innerText = output;
}

function setOutput(data){
    // fill output with a json of the data
    var output = JSON.stringify(data, 2, 2);
	if(out.innerText === undefined) out.textContent = output;
	else out.innerText = output;
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