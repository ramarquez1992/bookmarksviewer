var headingTextbox;
var backgroundColorTextbox;
var backgroundImageTextbox;
var numColumnsTextbox;
var faviconForm;
var alphabetizeForm;
var newTabForm;
var autoExpandForm;
var saveButton;

init();

function init() {
   headingTextbox = document.getElementById("heading");
   backgroundColorTextbox = document.getElementById("backgroundColor");
   backgroundImageTextbox = document.getElementById("backgroundImage");
   numColumnsTextbox = document.getElementById("numColumns");
   faviconForm = document.miscellaneous.showFavicons;
   alphabetizeForm = document.miscellaneous.alphabetize;
   newTabForm = document.miscellaneous.openInNewTab;
   autoExpandForm = document.miscellaneous.autoExpand;
   saveButton = document.getElementById("save-button");

   headingTextbox.value = localStorage.heading || "";
   backgroundColorTextbox.value = localStorage.backgroundColor || "";
   backgroundImageTextbox.value = localStorage.backgroundImage || "";
   numColumnsTextbox.value = localStorage.numColumns || "2";
   
   if (!localStorage.showFavicons || localStorage.showFavicons == "true") {
       faviconForm.checked = true;
   }

   if (!localStorage.alphabetize || localStorage.alphabetize == "true") {
       alphabetizeForm.checked = true;
   }

   if (localStorage.openInNewTab == "true") {
       newTabForm.checked = true;
   }

   if (localStorage.autoExpand == "true") {
       autoExpandForm.checked = true;
   }

   markClean();
}

function save() {
   localStorage.heading = headingTextbox.value;
   localStorage.backgroundColor = backgroundColorTextbox.value;
   localStorage.backgroundImage = backgroundImageTextbox.value;
   localStorage.numColumns = numColumnsTextbox.value;

   // TODO: loop/function?
   if (faviconForm.checked) {
       localStorage.showFavicons = true;
   } else {
       localStorage.showFavicons = false;
   }

   if (alphabetizeForm.checked) {
       localStorage.alphabetize = true;
   } else {
       localStorage.alphabetize = false;
   }

   if (newTabForm.checked) {
       localStorage.openInNewTab = true;
   } else {
       localStorage.openInNewTab = false;
   }

   if (autoExpandForm.checked) {
       localStorage.autoExpand = true;
   } else {
       localStorage.autoExpand = false;
   }

   markClean();
}

function markDirty() {
   saveButton.disabled = false;
}

function markClean() {
   saveButton.disabled = true;
}