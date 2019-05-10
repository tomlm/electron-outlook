const { BrowserWindow, shell, ipcMain, Menu } = require('electron')
const settings = require('electron-settings')
const CssInjector = require('../js/css-injector')
const path = require('path')

const outlookUrl = 'https://outlook.live.com'
const deeplinkUrls = ['outlook.live.com/mail/deeplink', 'outlook.office365.com/mail/deeplink', 'outlook.office.com/mail/deeplink']
const outlookUrls = ['outlook.live.com', 'outlook.office365.com', 'outlook.office.com']

class MailWindowController {
    constructor() {
        this.init()
    }

    init() {
        // Get configurations.
        const showWindowFrame = settings.get('showWindowFrame', true)
        this.mail = this.createWindow(outlookUrl + '/mail');
        this.calendar = this.createWindow(outlookUrl + '/calendar');
        this.people = this.createWindow(outlookUrl + '/people');
        this.files = this.createWindow(outlookUrl + '/files');
        //this.todos = this.createWindow('https://to-do.microsoft.com/?fromOwa=true');

        // Show window handler
        ipcMain.on('show', (event) => {
            this.show()
        })

        // Create the Application's main menu
        var template = [{
            label: "Application",
            submenu: [
                { label: "About Application", selector: "orderFrontStandardAboutPanel:" },
                { type: "separator" },
                { label: "Quit", accelerator: "Command+Q", click: function () { app.quit(); } }
            ]
        }, {
            label: "Edit",
            submenu: [
                { label: "Undo", accelerator: "CmdOrCtrl+Z", selector: "undo:" },
                { label: "Redo", accelerator: "Shift+CmdOrCtrl+Y", selector: "redo:" },
                { type: "separator" },
                { label: "Cut", accelerator: "CmdOrCtrl+X", selector: "cut:" },
                { label: "Copy", accelerator: "CmdOrCtrl+C", selector: "copy:" },
                { label: "Paste", accelerator: "CmdOrCtrl+V", selector: "paste:" },
                { label: "Select All", accelerator: "CmdOrCtrl+A", selector: "selectAll:" }
            ]
        }
        ];

        Menu.setApplicationMenu(Menu.buildFromTemplate(template));

        this.activeWindow = this.mail;
        this.show();
    }

    createWindow(target) {
        // Create the browser window.
        var window = new BrowserWindow({
            x: 100,
            y: 100,
            width: 1400,
            height: 900,
            frame: true,
            autoHideMenuBar: true,
            show: false,
            icon: path.join(__dirname, '../../assets/outlook_linux_black.png')
        })

        // and load the index.html of the app.
        window.loadURL(target)

        // insert styles
        window.webContents.on('dom-ready', () => {
            window.webContents.insertCSS(CssInjector.main)
            //if (!showWindowFrame) window.webContents.insertCSS(CssInjector.noFrame)

            // this.addUnreadNumberObserver()
        })

        // prevent the app quit, hide the window instead.
        window.on('close', (e) => {
            if (window.isVisible()) {
                e.preventDefault()
                window.hide();
            }
        })

        // on navigate events
        window.webContents.on('will-navigate', (e, url) => this.openInBrowser(e, url))
        window.webContents.on('new-window', (e, url) => this.openInBrowser(e, url));
        //window.webContents.openDevTools();
        return window;
    }

    toggleWindow() {
        if (this.activeWindow.isFocused())
            this.activeWindow.hide();
        else 
            this.activeWindow.show();
    }

    setActiveWindow(targetWindow) {
        if (this.activeWindow == targetWindow) {
            return;
        }

        let position = this.activeWindow.getPosition();
        targetWindow.hide();
        targetWindow.setPosition(position[0], position[1]);
        targetWindow.setBounds(this.activeWindow.getBounds());

        targetWindow.setFullScreen(this.activeWindow.isFullScreen());

        if (this.activeWindow.isMaximized())
            targetWindow.maximize();
        else if (this.activeWindow.isMinimized())
            targetWindow.minimize();
        else
            targetWindow.unmaximize();

        this.activeWindow.hide();
        this.activeWindow = targetWindow;
        this.activeWindow.show();
        this.activeWindow.focus();
    }

    openInBrowser(e, url) {
        console.log(`openInBrowser:${url}`);
        console.log(`activeWindow: ${this.activeWindow.getTitle()}`);
        if (url.indexOf('/mail') > 0) {
            if (this.activeWindow == this.mail) {
                e.preventDefault()
                return;
            }
            e.preventDefault()
            console.log('show mail');
            this.setActiveWindow(this.mail);
            return;
        } else if (url.indexOf('/calendar') > 0) {
            if (this.activeWindow == this.calendar) {
                e.preventDefault()
                return;
            }
            e.preventDefault()
            console.log('show calendar');
            this.setActiveWindow(this.calendar);
            return;
        } else if (url.indexOf('/people') > 0) {
            if (this.activeWindow == this.people) {
                e.preventDefault()
                return;
            }
            e.preventDefault()
            console.log('show people');
            this.setActiveWindow(this.people);
            return;
        } else if (url.indexOf('/files') > 0) {
            if (this.activeWindow == this.files) {
                e.preventDefault()
                return;
            }
            e.preventDefault()
            console.log('show files');
            this.setActiveWindow(this.files);
            return;
            // } else if (url.indexOf('/to-do') > 0) {
            //     if (this.active == this.todos) {
            //         return;
            //     }
            //     e.preventDefault()
            //     console.log('show todos');
            //     this.setActiveWindow(this.todos);
            //     return;
        }

        // load external urls outside of app
        e.preventDefault()
        shell.openExternal(url)
    }

    show() {
        this.calendar.hide();
        this.people.hide();
        this.files.hide();
        //this.todos.hide();
        this.mail.show();
        this.mail.focus();
        this.activeWindow = this.mail;
    }
}

module.exports = MailWindowController

