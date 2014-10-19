
window.onload = function () {
  loadOptions();
  dumpAllBookmarks();
}

function loadOptions() {
  if (localStorage.heading) {
      var headingText = document.createTextNode(localStorage.heading);
  } else {
      localStorage.heading = "";
      var headingText = document.createTextNode(localStorage.heading);
  }
  document.getElementById("heading").appendChild(headingText);

  if (localStorage.backgroundColor) {
      document.body.style.backgroundColor = localStorage.backgroundColor;
  }

  if (localStorage.backgroundImage) {
      document.body.style.backgroundImage = "url(" + localStorage.backgroundImage + ")";
  }

  if (!localStorage.numColumns) {
      localStorage.numColumns = 2;
  }

  if (!localStorage.showFavicons) {
      localStorage.showFavicons = true;
  }

  if (!localStorage.alphabetize) {
      localStorage.alphabetize = true;
  }

  if (!localStorage.openInNewTab) {
      localStorage.openInNewTab = false;
  }

  if (!localStorage.autoExpand) {
      localStorage.autoExpand = false;
  }
}

function dumpAllBookmarks() {
  var bookmarkTree = chrome.bookmarks.getTree(
      function (bookmarkTree) {
          // Combine "Bookmarks Bar" and "Other Bookmarks" into a single array
          bookmarkTree = bookmarkTree[0].children[0].children.concat(bookmarkTree[0].children[1].children);

          if (localStorage.alphabetize == "true") {
              alphabetize(bookmarkTree);
          }

          numColumns = localStorage.numColumns;
          columnSize = bookmarkTree.length / numColumns;
          for (var i = 0, start = 0; i < numColumns; i++, start += columnSize) {
              var column = document.createElement("div");
              column.style.float = "left";
              column.style.width = ((100 / numColumns) - 2.5) + "%"; // right-margin on divs is 2.5%
              column.appendChild(dumpTree(bookmarkTree.slice(start, start + columnSize)));

              document.getElementById("bookmarks").appendChild(column);
          }
      });
}

// Refresh the bookmarks div
function refresh() {
  var bookmarks = document.getElementById("bookmarks");

  while (bookmarks.firstChild) {
      bookmarks.removeChild(bookmarks.firstChild);
  }

  dumpAllBookmarks();
}

// TODO: an entire refresh should not be needed
chrome.bookmarks.onChanged.addListener(function (id, changeInfo) { refresh(); });
chrome.bookmarks.onRemoved.addListener(function (id, removeInfo) { refresh(); });
chrome.bookmarks.onCreated.addListener(function (id, bookmark) { refresh(); });

// TODO: use a decent sort algorithm
function alphabetize(treeNodes) {
  for (var i = 0; i < treeNodes.length; i++) {
      for (var j = i + 1; j < treeNodes.length; j++) {
          if (treeNodes[j].title.toLowerCase() < treeNodes[i].title.toLowerCase()) {
              var tmp = treeNodes[i];
              treeNodes[i] = treeNodes[j];
              treeNodes[j] = tmp;
          }
      }
  }

  return treeNodes;
}

function dumpTree(treeNodes) {
  var list = document.createElement("ul");

  if (localStorage.autoExpand == "true") {
      list.style.display = "block";
  }

  var item;
  for (var i in treeNodes) {
      if (treeNodes[i].children) { // if node is a folder, recurse
          list.appendChild(dumpNode(treeNodes[i]));

          if (localStorage.alphabetize == "true") {
              alphabetize(treeNodes[i].children);
          }

          item = dumpTree(treeNodes[i].children);
          item.id = "folder-" + treeNodes[i].id;
          item.className = "folderChildren";
      } else { // otherwise, add it to the list
          item = dumpNode(treeNodes[i]);
      }

      list.appendChild(item);
  }

  return list;
}

function dumpNode(node) {
  var item = document.createElement("li");
  item.id = node.id;

  if (node.children) { // node is a folder
      var folderTitle = document.createElement("span");
      folderTitle.className = "folderTitle";
      folderTitle.appendChild(document.createTextNode(node.title));

      var collapseButton = getCollapseButton(node);

      folderTitle.onclick = function () { collapse(node, collapseButton); };
      collapseButton.onclick = function () { collapse(node, collapseButton); };

      item.appendChild(folderTitle);
      item.appendChild(collapseButton);
      item.className = "folder";
  } else { // node is a bookmark
      if (localStorage.showFavicons == "true") {
          item.appendChild(getFavicon(node));
      }

      item.appendChild(getLink(node));
      item.className = "bookmark";
  }

  item.appendChild(getButtonContainer(node));

  // Show/hide buttons when user hovers over node
  item.onmouseover = function () { this.lastChild.style.display = "inline"; };
  item.onmouseout = function () { this.lastChild.style.display = "none"; };

  return item;
}

function collapse(folder, collapseButton) {
  var children = document.getElementById("folder-" + folder.id);

  if (children.style.display == "block") {
      children.style.display = "none";
      collapseButton.src = "arrow_hide_icon.png";
      collapseButton.title = "Show";
  } else {
      children.style.display = "block";
      collapseButton.src = "arrow_show_icon.png";
      collapseButton.title = "Hide";
  }
}

function getCollapseButton(folder) {
  var collapseButton = document.createElement("img");
  collapseButton.className = "collapseButton";

  if (localStorage.autoExpand == "true") {
      collapseButton.title = "Hide";
      collapseButton.src = "arrow_show_icon.png";
  } else {
      collapseButton.title = "Show";
      collapseButton.src = "arrow_hide_icon.png";
  }

  return collapseButton;
}

function getFavicon(bookmark) {
  var favicon = document.createElement("img");
  favicon.src = "http://getfavicon.appspot.com/" + bookmark.url;
  favicon.alt = bookmark.title
  favicon.className = "favicon";

  return favicon;
}

function getLink(bookmark) {
  var link = document.createElement("a");
  link.href = bookmark.url;
  link.title = bookmark.url;

  if (localStorage.openInNewTab == "true") {
      link.target = "_blank";
  }

  link.appendChild(document.createTextNode(bookmark.title));

  return link;
}

function getButtonContainer(node) {
  var buttonContainer = document.createElement("span");
  buttonContainer.className = "buttonContainer";

  buttonContainer.appendChild(getRemoveButton(node));
  buttonContainer.appendChild(getEditButton(node));

  return buttonContainer;
}

function getButton(image, altText) {
  var button = document.createElement("img");
  button.src = image;
  button.alt = altText;
  button.title = altText;
  button.className = "button";

  return button;
}

function getRemoveButton(node) {
  var button = getButton("remove_icon.png", "Remove");

  button.onclick = function () {
      if (node.children) {
          if (confirm("Delete folder?")) {
              chrome.bookmarks.removeTree(node.id);
          }
      } else {
          chrome.bookmarks.remove(node.id);
      }
      };

  return button;
}

function getEditButton(node) {
  var button = getButton("edit_icon.png", "Edit");

  button.onclick = function () {
      document.getElementById("editBookmarkId").value = node.id;
      document.getElementById("editForm").style.display = "block";
      document.getElementById("editTitle").value = node.title;

      if (node.children) {
          document.getElementById("urlForm").style.display = "none";
      } else {
          document.getElementById("editUrl").value = node.url;
      }

      document.getElementById("editTitle").focus();
      };

  return button;
}

function editBookmark(bookmarkId) {
  chrome.bookmarks.get(bookmarkId,
      function (bookmarks) {
          var bookmark = bookmarks[0];
          newTitle = document.getElementById("editTitle").value;
          newUrl = document.getElementById("editUrl").value;

          changes = new Object();

          if (newTitle) {
              changes.title = newTitle;
          }

          if (newUrl) {
              changes.url = "";

              if (!newUrl.match(/^https?:\/\//)) {
                  changes.url += "http://";
              }

              changes.url += newUrl;
          }

          chrome.bookmarks.update(bookmark.id, changes);
      });

  document.getElementById("urlForm").style.display = "inline"; //accommodate folder editing
  document.getElementById("editForm").style.display = "none";
}

function cancelEditForm() {
  document.getElementById("editBookmarkId").value = "";
  document.getElementById("editTitle").value = "";
  document.getElementById("editUrl").value = "";
  document.getElementById("urlForm").style.display = "inline"; //accommodate folder editing
  document.getElementById("editForm").style.display = "none";
}