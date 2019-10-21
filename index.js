const electron = require('electron')
const url = require('url');
const path = require('path');


const { app, BrowserWindow, Menu, ipcMain } = electron;

// SET ENV
// process.env.NODE_ENV ='production';

let mainWindow;
let addWindow;

// Listen for app to be ready 
app.on('ready', () => {
  // create new window
  mainWindow = new BrowserWindow({
    webPreferences: {
      nodeIntegration: true, // 是否集成 Nodejs,把之前预加载的js去了，发现也可以运行
    }
  });
  // load html into window 
  mainWindow.loadURL(url.format({
    pathname: path.join(__dirname, 'mainWindow.html'),
    protected: 'file:',
    slashes: true,
  }));

  // Quit app when closed
  mainWindow.on('closed', function () {
    app.quit();
  });

  // Build menu from template
  const mainMenu = Menu.buildFromTemplate(mainMenuTemplate);

  // Insert menu 
  Menu.setApplicationMenu(mainMenu);

});

// Hdanlde create add window
function createAddWindow() {
  // create new window
  addWindow = new BrowserWindow({
    width: 300,
    height: 200,
    title: 'Add Shopping List Item',
    webPreferences: {
      nodeIntegration: true, // 是否集成 Nodejs,把之前预加载的js去了，发现也可以运行
    }
  });

  // load html into window 
  addWindow.loadURL(url.format({
    pathname: path.join(__dirname, 'addWindow.html'),
    protected: 'file:',
    slashes: true
  }));

  // Garbage collection handle 
  addWindow.on('close', function () {
    addWindow = null;
  })
}

// Catch item:add 
ipcMain.on('item:add', function (e, item) {
  mainWindow.webContents.send('item:add', item);
  addWindow.close();
});

// Create menu temple
const mainMenuTemplate = [
  {
    label: '操作',
    submenu: [
      {
        label: '添加',
        accelerator: process.platform === 'darwin' ? 'Command+A' :
          'Ctrl+A',
        click() {
          createAddWindow();
        }
      }, {
        label: '退出',
        accelerator: process.platform === 'darwin' ? 'Command+Q' :
          'Ctrl+Q',
        click() {
          app.quit();
        }
      }
    ]
  },
];

// If mac, add empty object to menu 
if (process.platform == 'darwin') {
  mainMenuTemplate.unshift({});
}

// Add developer tools item not in pord
if (process.env.NODE_ENV !== 'production') {
  mainMenuTemplate.push({
    label: 'Developer Tools',
    submenu: [{
      label: 'Toggle Devtools',
      accelerator: process.platform === 'darwin' ? 'Command+I' : 'Ctrl+I',
      click(item, focusedWindow) {
        const devToolsStatus = focusedWindow.toggleDevTools();
      }
    }, {
      role: 'reload'
    }]
  });
}