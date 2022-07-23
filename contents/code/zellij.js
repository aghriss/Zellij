// Adjust for gaps
function adjustGap(startPos, tileLength) {
    var gap = readConfig("gap", 0)
    var halfgap = Math.floor(gap / 2)

    return {start: startPos + halfgap, length: tileLength - gap}
}

function getBox(index, maxLength, numTiles) {
    var validIndex = Math.max(1, Math.min(index, numTiles)) - 1; // 0 <= valid_index < numSplits
    var tileLength = Math.floor(maxLength / numTiles)
    var remainder = maxLength % numTiles;
    var validStart = validIndex * tileLength;
    validStart = validStart + Math.min(index, remainder);
    if (validIndex < remainder)
        tileLength = tileLength + 1;
    return {start: validStart, length: tileLength};
}


function getIndex(startPos, maxLength, numTiles) {
    var tileLength = Math.floor(maxLength / numTiles);
    return Math.floor(startPos / tileLength);

}

function getMaxArea(workspace) {
    var client = workspace.activeClient;
    var maxArea = workspace.clientArea(KWin.MaximizeArea, client)
    if (client.fullScreen)
        maxArea = workspace.clientArea(KWin.FullScreenArea, client);
    return maxArea;
}

function changeWidth(workspace, numTiles) {
    var client = workspace.activeClient;
    if (client.specialWindow) return;
    var maxArea = getMaxArea(workspace)
    var currentIndex = getIndex(client.geometry.x, maxArea.width, numTiles);
    var box = getBox(currentIndex, maxArea.width, numTiles);
    box = adjustGap(box.start, box.length);
    client.geometry.x = box.start;
    client.geometry.width = box.length;
}


function changeHeight(workspace, numTiles) {
    var client = workspace.activeClient
    if (client.specialWindow) return;

    var maxArea = getMaxArea(workspace)
    var currentIndex = getIndex(client.geometry.y, maxArea.height, numTiles);
    var box = getBox(currentIndex, maxArea.height, numTiles);
    box = adjustGap(box.start, box.length);
    client.geometry.y = box.start;
    client.geometry.height = box.length;
}

function changeFullscreen(workspace) {
    var client = workspace.activeClient;
    if (client.specialWindow) return;
    var geometry = {
        x: client.geometry.x,
        y: client.geometry.y,
        width: client.geometry.width,
        height: client.geometry.height
    };
    client.fullScreen = !client.fullScreen;
    client.geometry = geometry;
}

function getNumTiles(length, maxLength) {
    return Math.round(maxLength / length);
}

function nextStep(startPos, length, maxLength, step) {
    var numTiles = getNumTiles(length, maxLength);
    var currentIndex = getIndex(startPos, maxLength, numTiles);
    var nextIndex = Math.max(0, Math.min(currentIndex + step, numTiles));
    var box = getBox(nextIndex + 1, maxLength, numTiles);
    box = adjustGap(box.start, box.length)
    return box;
}

function moveHorizontal(workspace, step) {
    var client = workspace.activeClient;
    if (client.specialWindow) return;
    var maxArea = getMaxArea(workspace);
    var box = nextStep(client.geometry.x, client.geometry.width, maxArea.width, step);
    client.geometry.x = box.start;
    //client.geometry.width = box.length;
}

function moveVertical(workspace, step) {
    var client = workspace.activeClient;
    if (client.specialWindow) return;
    var maxArea = getMaxArea(workspace);
    var box = nextStep(client.geometry.y, client.geometry.height, maxArea.height, step);
    client.geometry.y = box.start;
    //client.geometry.height = box.length;
}

function addDesktops(n, addindex) {
    /* n is number of desktops to add */
    workspace.desktops = workspace.desktops + n;                /* Increase number of desktops by n */

    workspace.clientList().forEach(                             /* Loop over all windows */
        function (w, i) {
            if (w.desktop > addindex) {                        /* If window desktop has index addindex or higher */
                w.desktop = w.desktop + n;                      /* Move window n desktops further */
            }
        }
    );
}

var prefix = "Zellij";

// Must pass 'workspace' since it would be out of scope otherwise

// Next 4 Shortcuts will be deprecated
registerShortcut(prefix + "Change Fullscreen", prefix + ": Fullscreen change", "", function () {
    changeFullscreen(workspace);
});

for (let i = 1; i < 7; i++) {
    var text = "Split horizontally by " + i;
    var shortcut = "Ctrl+Alt+Num+" + i;
    registerShortcut(prefix + " " + text, prefix + ": " + text, shortcut, function () {
        changeWidth(workspace, i)
    });
}


var shifts = {1: "End", 2: "Down", 3: "PgDown", 4: "Left", 5: "Clear", 6: "Right"}
for (let i = 1; i < 5; i++) {
    text = "Split vertically by " + i;
    shortcut = "";//"Ctrl+Alt+Num+" + shifts[i];
    registerShortcut(prefix + " " + text, prefix + ": " + text, shortcut, function () {
        changeHeight(workspace, i)
    });
}

text = "Move Left";
registerShortcut(prefix + " " + text, prefix + ": " + text, "", function () {
    moveHorizontal(workspace, -1)
});
text = "Move Right";
registerShortcut(prefix + " " + text, prefix + ": " + text, "", function () {
    moveHorizontal(workspace, 1)
})
text = "Move Up"
registerShortcut(prefix + " " + text, prefix + ": " + text, "", function () {
    moveVertical(workspace, -1)
});
text = "Move Down";
registerShortcut(prefix + " " + text, prefix + ": " + text, "", function () {
    moveVertical(workspace, 1)
});

text = "Add Desktop"
registerShortcut(prefix + " " + text, prefix + ": " + text, "Ctrl+Shift+N", function () {
    addDesktops(1, workspace.currentDesktop)
});


text = "Remove current Desktop"
registerShortcut(prefix + " " + text, prefix + ": " + text, "Ctrl+Shift+X", function () {
    addDesktops(-1, workspace.currentDesktop)
});
