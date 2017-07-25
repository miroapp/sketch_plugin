/*
The MIT License (MIT)

Copyright (c) 2017 RealtimeBoard Inc.

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/

@import "core/MochaJSDelegate.js";
@import "core/api.js";

var ui = new UI();

function createLabel(value, fontSize, hidden, frame) {
  var label = [[NSTextField alloc] initWithFrame:frame];
  [label setEditable:false];
  [label setBordered:false];
  [label setDrawsBackground:false];
  [label setFont:[NSFont systemFontOfSize:fontSize]];
  [label setStringValue:value];
  [label setHidden: hidden];
  return label;
}

function createInput(placeholder, secure, frame) {
  var input = (secure == true) ? [[NSSecureTextField alloc] initWithFrame:frame] : [[NSTextField alloc] initWithFrame:frame];
  [[input cell] setPlaceholderString:placeholder];
  return input;
}

function createButton(title, enabled, frame) {
  var button = [[NSButton alloc] initWithFrame:frame];
  [button setEnabled: enabled];
  [button setTitle:title];
  [button setBezelStyle:NSRoundedBezelStyle];
  return button;
}

function createRadioButtons(items, numRows, numCols, frame, cellWidth, cellHeight, title, defaultSelection) {
  if (typeof items === "undefined" || items.length == 0) {
    return;
  }

  var buttonCell = [NSButtonCell new],
    title = (typeof title !== "undefined") ? title : "Radio Buttons",
    numRows = (typeof numRows !== "undefined") ? numRows : 1,
    numCols = (typeof numCols !== "undefined") ? numCols : items.length,
    defaultSelection = (typeof defaultSelection !== "undefined") ? defaultSelection : 0,
    matrixRect = frame,
    numItems = items.length,
    itemName;

  [buttonCell setTitle:title];
  [buttonCell setButtonType:NSRadioButton];

  var buttonMatrix = [[NSMatrix alloc] initWithFrame:matrixRect mode:NSRadioModeMatrix prototype:buttonCell numberOfRows:numRows numberOfColumns:numCols],
    cells = [buttonMatrix cells];

  [buttonMatrix setAutorecalculatesCellSize:true];
  [buttonMatrix setIntercellSpacing:NSMakeSize(10,10)];
  [buttonMatrix setCellSize:NSMakeSize(cellWidth, cellHeight)]

  for (var i = 0; i<numItems; i++) {
    itemName = items[i];
    [[cells objectAtIndex:i] setTitle:itemName];
    [[cells objectAtIndex:i] setTag:(i+100)];
  }

  [buttonMatrix selectCellWithTag:(defaultSelection+100)];

  return buttonMatrix;
}

function createCheckbox(title, checked, frame) {
  checked = (checked == false)? NSOffState: NSOnState;
  var checkbox = [[NSButton alloc] initWithFrame: frame];
  [checkbox setButtonType: NSSwitchButton];
  [checkbox setBezelStyle: 0];
  [checkbox setTitle: title];
  [checkbox setState: checked];
  return checkbox;
}

function getLogoImage(context) {
  var imagePath = context.scriptPath.stringByDeletingLastPathComponent().stringByDeletingLastPathComponent() + "/Resources/icon.png";
  icon = [[NSImage alloc] initByReferencingFile:imagePath];
  return icon;
}

function showAlert(title, message, context) {
  var alert = [[NSAlert alloc] init];
  var icon = getLogoImage(context);

  [alert setIcon:icon];
  [alert setMessageText:title];
  [alert setInformativeText:message];
  [alert addButtonWithTitle:"OK"];
  [alert runModal];
}

function UI() {
  UI.prototype.showLoginWindow = function(context) {
    var app = [NSApplication sharedApplication];

    var loginWindow = [[NSWindow alloc] init];
    [loginWindow setFrame:NSMakeRect(0, 0, 410, 320) display: false];

    var headerView = [[NSView alloc] initWithFrame:NSMakeRect(0, 240, 410, 60)];
    [headerView setWantsLayer:true];
    [headerView setBackgroundColor:[NSColor whiteColor]];
    [[loginWindow contentView] addSubview:headerView];

    var titleField = createLabel("Log into RealtimeBoard", 15, false, NSMakeRect(45, 15, 250, 25));
    [titleField setFont:[NSFont boldSystemFontOfSize:14]];
    [headerView addSubview:titleField];

    var imageView = [[NSImageView alloc] initWithFrame:NSMakeRect(305, 5, 60, 60)],
    icon = getLogoImage(context);
    [imageView setImage: icon];
    [headerView addSubview:imageView];

    [[loginWindow contentView] addSubview:headerView];

    var errorMessageLabel = createLabel("The username or password you entered is incorrect.", 13, true, NSMakeRect(45, 200, 320, 25));
    [errorMessageLabel setTextColor:[NSColor redColor]];
    [[loginWindow contentView] addSubview:errorMessageLabel];

    var emailLabel = createLabel("Email", 13, false, NSMakeRect(45, 175, 260, 25));
    [[loginWindow contentView] addSubview:emailLabel];

    var emailField = createInput("Email", false, NSMakeRect(47, 155, 315, 25));
    [[loginWindow contentView] addSubview:emailField];

    var passwordLabel = createLabel("Password", 13, false, NSMakeRect(45, 115, 260, 25));
    [[loginWindow contentView] addSubview:passwordLabel];

    var passwordField = createInput("Password", true, NSMakeRect(47, 95, 315, 25));
    [[loginWindow contentView] addSubview:passwordField];

    COScript.currentCOScript().setShouldKeepAround_(true);

    var emailDelegate = new MochaJSDelegate({
      "controlTextDidChange:": (function(){
        [errorMessageLabel setHidden:true];
        if ([[emailField stringValue]length] > 0 && [[passwordField stringValue]length] > 0 ){
          [loginButton setEnabled:true];
        } else {
          [loginButton setEnabled:false];
        }
      })
    });

    emailField.setDelegate(emailDelegate.getClassInstance());

    var passwordDelegate = new MochaJSDelegate({
      "controlTextDidChange:": (function(){
        [errorMessageLabel setHidden:true];
        if ([[emailField stringValue]length] > 0 && [[passwordField stringValue]length] > 0 ){
          [loginButton setEnabled:true];
        } else{
          [loginButton setEnabled:false];
        }
      })
    });

    passwordField.setDelegate(passwordDelegate.getClassInstance());

    function endSheet() {
      [loginWindow orderOut:nil];
      [[app mainWindow] endSheet: loginWindow];
      [cancelButton setCOSJSTargetFunction:undefined];
      [loginButton setCOSJSTargetFunction:undefined];
      [ssoButton setCOSJSTargetFunction:undefined]
      COScript.currentCOScript().setShouldKeepAround_(false);
    }

    var title = "Use Company credentials (SSO)";
    var ssoButton = createButton(title, true, NSMakeRect(45, 45, 190, 40));
    var color = [NSColor colorWithCalibratedRed:99.0/255.0 green:150.0/255.0 blue:1.0 alpha:1.0]
    var colorTitle = [[ssoButton attributedTitle] mutableCopy];

    [colorTitle addAttribute:NSForegroundColorAttributeName value:color range:NSMakeRange(0, title.length)];
    [colorTitle addAttribute:NSUnderlineStyleAttributeName value:NSUnderlineStyleSingle range:NSMakeRange(0, title.length)];
    [ssoButton setAttributedTitle:colorTitle];
    [ssoButton setBordered:false];

    [ssoButton setCOSJSTargetFunction:function(sender) {
      endSheet();
      _this.showSSOWebView(context);
    }]

    var _this = this;

    var loginButton = createButton("Login", false, NSMakeRect(268, 8, 100, 30));
    [loginButton setKeyEquivalent:"\r"];
    [loginButton setCOSJSTargetFunction:function(sender) {

      var email = emailField.stringValue(),
        password = passwordField.stringValue();

      var data = [[NSDictionary alloc] initWithObjectsAndKeys:
                         email, @"email",
                         password, @"password",
                         nil];

      var response = api.authRequest(context, data);

      if (response) {
        if (response.error) {
          [errorMessageLabel setHidden: false];
        } else {
          var token = response.token;
          api.setToken(token);
          endSheet();
          _this.showExportWindow(context);
        }
      }
    }];

    var cancelButton = createButton("Cancel", true, NSMakeRect(167, 8, 100, 30));
    [cancelButton setKeyEquivalent:@"\033"]
    [cancelButton setCOSJSTargetFunction:function(sender) {
      endSheet();
    }];

    var bottomActionsView = [[NSView alloc] initWithFrame:NSMakeRect(0, 0, 450, 80)];
    [bottomActionsView setWantsLayer:true];

    [[loginWindow contentView] addSubview:bottomActionsView];

    [bottomActionsView addSubview:ssoButton];
    [bottomActionsView addSubview:cancelButton];
    [bottomActionsView addSubview:loginButton];

    [[app mainWindow] beginSheet:loginWindow completionHandler:nil];
  }

  UI.prototype.showLogoutWindow = function(context) {
    var app = [NSApplication sharedApplication];

    COScript.currentCOScript().setShouldKeepAround_(true);

    var logoutWindow = [[NSWindow alloc] init];
    [logoutWindow setFrame:NSMakeRect(0, 0, 400, 200) display: false];

    var headerView = [[NSView alloc] initWithFrame:NSMakeRect(0, 120, 400, 60)];
    [headerView setWantsLayer:true];
    [headerView setBackgroundColor:[NSColor whiteColor]];
    [[logoutWindow contentView] addSubview:headerView];

    var titleField = createLabel("Log out of RealtimeBoard", 15, false, NSMakeRect(45, 15, 250, 25));
    [titleField setFont:[NSFont boldSystemFontOfSize:14]];
    [headerView addSubview:titleField];

    var imageView = [[NSImageView alloc] initWithFrame:NSMakeRect(295, 5, 60, 60)],
    icon = getLogoImage(context);
    [imageView setImage: icon];
    [headerView addSubview:imageView];

    [[logoutWindow contentView] addSubview:headerView];

    var logoutButton = createButton("Logout", true, NSMakeRect(255, 8, 100, 30));
    [logoutButton setKeyEquivalent:"\r"]
    [logoutButton setCOSJSTargetFunction:function(sender) {
      var errorHandlingInfo = {};
      api.logoutRequest(context, errorHandlingInfo);

      if (!errorHandlingInfo.connectionError) {
        api.setToken(nil);
      }

      [logoutWindow orderOut:nil];
      [[app mainWindow] endSheet: logoutWindow];
      [cancelButton setCOSJSTargetFunction:undefined];
      [logoutButton setCOSJSTargetFunction:undefined];
      COScript.currentCOScript().setShouldKeepAround_(false);
    }];

    var cancelButton = createButton("Cancel", true, NSMakeRect(152, 8, 100, 30));
    [cancelButton setKeyEquivalent:@"\033"]
    [cancelButton setCOSJSTargetFunction:function(sender) {
      [logoutWindow orderOut:nil];
      [[app mainWindow] endSheet: logoutWindow];
      [cancelButton setCOSJSTargetFunction:undefined];
      [logoutButton setCOSJSTargetFunction:undefined];
      COScript.currentCOScript().setShouldKeepAround_(false);
    }];

    var bottomActionsView = [[NSView alloc] initWithFrame:NSMakeRect(0, 0, 450, 50)];
    [bottomActionsView setWantsLayer:true];

    [[logoutWindow contentView] addSubview:bottomActionsView];

    [bottomActionsView addSubview:logoutButton];
    [bottomActionsView addSubview:cancelButton];

    [[app mainWindow] beginSheet:logoutWindow completionHandler:nil];
  }

  UI.prototype.showSSOWebView = function(context) {
    COScript.currentCOScript().setShouldKeepAround_(true);

    var delegate = new MochaJSDelegate();
    var cookies = [[NSHTTPCookieStorage sharedHTTPCookieStorage] cookies];
    var _this = this;

    for (var i = 0; i < cookies.length; i++) {
      var cookie = cookies[i];

      if ([cookie domain] == 'realtimeboard.com') {
        [[NSHTTPCookieStorage sharedHTTPCookieStorage] deleteCookie:cookie];
      }
    }

    var webviewWindow = [[NSWindow alloc] init];
  	[webviewWindow setFrame:NSMakeRect(0, 0, 500, 420) display:false];

    var frame = NSMakeRect(0,60,500,340);
    var stringURL = [NSString stringWithFormat:ssoURL];
    var webStringURL = [stringURL stringByAddingPercentEscapesUsingEncoding:NSUTF8StringEncoding];
    var url = [NSURL URLWithString:webStringURL];
    var webView = [[WebView alloc] initWithFrame:frame];

    [[webView mainFrame] loadRequest:[NSURLRequest requestWithURL:url]];
    [[webviewWindow contentView] addSubview:webView];
    [webviewWindow center];

    delegate.setHandlerForSelector("webView:resource:didReceiveResponse:fromDataSource:", function(webView, resource, didReceiveResponse, fromDataSource) {
      var isApp = appURL == [webView mainFrameURL]

      if (isApp) {
        COScript.currentCOScript().setShouldKeepAround_(false);

        var cookies = [[NSHTTPCookieStorage sharedHTTPCookieStorage] cookies];

        for (var i = 0; i < cookies.length; i++) {
          var cookie = cookies[i];

          if ([cookie domain] == 'realtimeboard.com') {
            if ([cookie name] == 'token') {
              api.setToken([cookie value]);
              break;
            }
          }
        }

        webView.stopLoading(nil);
        [webView close];
        [webviewWindow orderOut:nil];
    		[NSApp stopModal];

        _this.showExportWindow(context, false);
      }
    });

    webView.setFrameLoadDelegate_(delegate.getClassInstance());
    webView.setResourceLoadDelegate_(delegate.getClassInstance());

  	var cancelButton = [[NSButton alloc] initWithFrame:NSMakeRect(0, 0, 0, 0)];
  	[cancelButton setTitle:"Cancel"]
  	[cancelButton setBezelStyle:NSRoundedBezelStyle]
  	[cancelButton sizeToFit]
  	[cancelButton setFrame:NSMakeRect(380, 14, 100, 30)]
  	[cancelButton setKeyEquivalent:@"\033"]
  	[cancelButton setCOSJSTargetFunction:function(sender) {
      [webView close];
  		[webviewWindow orderOut:nil];
  		[NSApp stopModal];
  	}]

    [[webviewWindow contentView] addSubview:cancelButton];

  	[NSApp runModalForWindow:webviewWindow];

    webviewWindow = nil;
    cancelButton = nil;
  }

  UI.prototype.showExportWindow = function(context, syncSelected) {
    var app = [NSApplication sharedApplication];

    COScript.currentCOScript().setShouldKeepAround_(true);

    var exportWindow = [[NSWindow alloc] init];
    [exportWindow setFrame:NSMakeRect(0, 0, 470, 315) display: false];

    var headerView = [[NSView alloc] initWithFrame:NSMakeRect(0, 235, 470, 60)];
    [headerView setWantsLayer:true];
    [headerView setBackgroundColor:[NSColor whiteColor]];
    [[exportWindow contentView] addSubview:headerView];

    var titleField = createLabel("Sync artboards with RealtimeBoard", 15, false, NSMakeRect(45, 15, 365, 25));
    [titleField setFont:[NSFont boldSystemFontOfSize:14]];
    [headerView addSubview:titleField];

    var imageView = [[NSImageView alloc] initWithFrame:NSMakeRect(365, 5, 60, 60)],
    icon = getLogoImage(context);
    [imageView setImage: icon];
    [headerView addSubview:imageView];

    var errorHandlingInfo = {
      message: "Sorry, the board list cannot be received."
    }
    var boards = api.getBoards(context, errorHandlingInfo);

    if (!boards) {
      [exportWindow orderOut:nil];
      [app stopModal];
    }

    var boardsList = boards.map(function(item) {
      return item["title"];
    });

    var boardsLabel = createLabel("Select a board for syncing", 12, false, NSMakeRect(45, 195, 385, 25));
    [[exportWindow contentView] addSubview:boardsLabel];

    var boardsField = [[NSComboBox alloc] initWithFrame: NSMakeRect(45, 175, 250, 25)];
    [[exportWindow contentView] addSubview:boardsField];

    [boardsField setCompletes:true];
    [boardsField addItemsWithObjectValues:boardsList];

    var lastBoardId = api.getLastBoardId();

    if (lastBoardId) {
      var boardIds = boards.map(function(item) {
        return item["boardId"];
      });

      for (var i = 0; i < boardIds.length; i++) {
        var boardId = boardIds[i];
        if ([lastBoardId isEqualToString:boardId]) {
          [boardsField selectItemAtIndex:i];
          break;
        }
      }
    }

    var radioGroupItems = ["All the artboards on this page", "Only selected artboards on this page"];
    var radioGroup = createRadioButtons(radioGroupItems, 2, 1, NSMakeRect(45, 110, 300, 50), 300, 20);
    [[exportWindow contentView] addSubview:radioGroup];

    if (syncSelected) {
      [radioGroup selectCellWithTag:101];
    }

    var checked = api.getOpenBoard() == 1 ? true : false;

    var openBoard = createCheckbox("Open RealtimeBoard after sync", checked, NSMakeRect(45, 70, 300, 22));
    [[exportWindow contentView] addSubview:openBoard];

    [openBoard setCOSJSTargetFunction:function(sender) {
      api.setOpenBoard(openBoard.state());
    }];

    var cancelButton = createButton("Cancel", true, NSMakeRect(220, 20, 100, 30));
    [cancelButton setCOSJSTargetFunction:function(sender) {
      [syncButton setCOSJSTargetFunction:undefined];
      [cancelButton setCOSJSTargetFunction:undefined];
      [exportWindow orderOut:nil];
      [app stopModal];
      COScript.currentCOScript().setShouldKeepAround_(false);
    }];
    [cancelButton setKeyEquivalent:@"\033"]
    [cancelButton setAction:"callAction:"];

    var syncButton = createButton("Sync", true, NSMakeRect(330, 20, 100, 30));
    [syncButton setCOSJSTargetFunction:function(sender) {
      [indicator setHidden: false];
      [indicator startAnimation:indicator];

      var selectedTag = [[radioGroup selectedCell] tag];
      var boardIndex = [boardsField indexOfSelectedItem];

      if (boardIndex == -1) {
        [indicator setHidden: true];
        [indicator stopAnimation:indicator];
        [exportWindow orderOut:self];
        showAlert("No board is chosen", "Please choose a board that you wish to sync with your artboards.", context);
        [exportWindow makeKeyAndOrderFront:self];
      } else {
        var boardId =  boards[boardIndex]["boardId"];
        var exportAll = selectedTag == 100;
        var uploadResult = api.uploadArtboardsToRTB(context, boardId, exportAll);

        [indicator setHidden: true];
        [indicator stopAnimation:indicator];

        [exportWindow orderOut:nil];
        [app stopModal];
        [syncButton setCOSJSTargetFunction:undefined];
        COScript.currentCOScript().setShouldKeepAround_(false);

        if (uploadResult == api.UploadEnum.SUCCESS) {
          api.setLastBoardId(boardId);

          if (openBoard.state() == 1) {
            var fullBoardURL = boardURL + boardId;
            var url = [NSURL URLWithString:fullBoardURL];

            [[NSWorkspace sharedWorkspace] openURL:url];
          }
        } else if (uploadResult == api.UploadEnum.NO_ARTBOARDS) {
          showAlert("No artboards on the page?", "Please create an artboard or open another file.", context);
        } else if (uploadResult == api.UploadEnum.NO_ARTBOARDS_SELECTED) {
          showAlert("No artboards selected?", "Please choose an artboard and retry.", context);
        } else if (uploadResult == api.UploadEnum.UPLOAD_FAILED) {
          showAlert("An error occurred", "There was an error during syncing. Please retry.", context);
        }
      }
    }];

    [syncButton setKeyEquivalent:"\r"];
    [syncButton setAction:"callAction:"];

    var indicator = [[[NSProgressIndicator alloc] initWithFrame:NSMakeRect(45, 30, 20, 20)] autorelease];
    [indicator setStyle:NSProgressIndicatorSpinningStyle];
    [indicator setHidden: true];

    var bottomActionsView = [[NSView alloc] initWithFrame:NSMakeRect(0, 0, 450, 50)];
    [bottomActionsView setWantsLayer:true]
    [[exportWindow contentView] addSubview:bottomActionsView];

    [bottomActionsView addSubview:cancelButton];
    [bottomActionsView addSubview:syncButton];
    [bottomActionsView addSubview:indicator];

    [exportWindow setDefaultButtonCell:[syncButton cell]];
    [app runModalForWindow:exportWindow];
  }
}
