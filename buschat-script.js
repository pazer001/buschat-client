import ajax from 'superagent';
import md5 from 'js-md5';

class Buschat {
    constructor() {
        this.state  =   {
            chatWindowCreated: false,
            serverConnectionMethod: 'ajax',
            serverUrl: 'http://localhost:3000',
            ajaxCallsInterval: false,
            brand: false,
            userId: false,
            chatId: false,
            lastMessageTimestamp: false
        };

        this.data   =   {
            hash: md5(new Date().getTime())
        };
    }

    initChatWindow(options = {}) {
        if(options.serverConnectionMethod) this.state.serverConnectionMethod;
        if(!options.brand || !options.userId) return;
        this.state.brand    =   options.brand;
        this.state.userId    =   options.userId;

        if(!this.state.chatWindowCreated) {
            let hash                =   options.hash ? options.hash : this.data.hash;
            this.data.hash          =   hash;
            let $body               =   document.getElementsByTagName('body')[0];
            let $mainDiv            =   document.createElement('div');
            let mainDivId           =   `buschat-wrapper-${hash}`;
            let mainDivClass        =   `buschat-main-wrapper`;
            let mainDivStyle        =   `position: fixed;
                                        display: none;
                                        resize: both;
                                        bottom: 1em;
                                        left: 1em;
                                        border-radius: 0.25em;
                                        padding: 0.25em;
                                        background: rgba(0, 0, 0, 0.74902);
                                        height: 33%;
                                        width: 10%;`;
            let messagesId          =   `buschat-messages-${hash}`;
            let messagesStyle       =   `width: 100%;
                                        height: 80%;
                                        background: rgba(0,0,255, 0.25);
                                        margin-bottom: 1em;
                                        border-radius: 0.25em;`;
            let addMessageTextId    =   `buschat-add-message-text-${hash}`;
            let addMessageTextStyle =   `padding: .5em .6em;
                                        display: inline-block;
                                        border: 1px solid #ccc;
                                        box-shadow: inset 0 1px 3px #ddd;
                                        border-radius: 4px;
                                        vertical-align: middle;
                                        -webkit-box-sizing: border-box;
                                        -moz-box-sizing: border-box;
                                        box-sizing: border-box;
                                        font-family: sans-serif;
                                        font-weight: 100;
                                        letter-spacing: 0.01em;
                                        line-height: normal;
                                        height: 45px;
                                        width: 80%;`;
            let addMessageButtonId      =   `buschat-add-message-button-${hash}`;
            let addMessageButtonStyle   =   `width: 19%;
                                            height: 45px;
                                            float: right;
                                            background-color: #0078e7;
                                            font-family: inherit;
                                            font-size: 100%;
                                            color: #444;
                                            color: rgba(0,0,0,.8);
                                            border: 1px solid #999;
                                            border: 0 rgba(0,0,0,0);
                                            background-color: #E6E6E6;
                                            text-decoration: none;
                                            border-radius: 4px;
                                            display: inline-block;
                                            zoom: 1;
                                            line-height: normal;
                                            white-space: nowrap;
                                            vertical-align: middle;
                                            text-align: center;
                                            cursor: pointer;
                                            -webkit-user-drag: none;
                                            -webkit-user-select: none;
                                            -moz-user-select: none;
                                            -ms-user-select: none;
                                            user-select: none;
                                            -webkit-box-sizing: border-box;
                                            -moz-box-sizing: border-box;
                                            box-sizing: border-box;`;
            let addMessageButtonSVG  =   `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" x="0px" y="0px" viewBox="0 0 14 14" style="enable-background:new 0 0 14 14;" xml:space="preserve" width="100%" height="100%"> <g> <path d="M7,0.935c-3.866,0-7,2.463-7,5.5c0,1.438,0.703,2.749,1.854,3.729 c-0.044,0.955-0.242,2.239-0.942,2.901c1.337,0,2.706-0.88,3.518-1.514c0.796,0.248,1.663,0.384,2.57,0.384c3.866,0,7-2.463,7-5.5 S10.866,0.935,7,0.935z" fill="#006DF0"/> </g> <g> </g> <g> </g> <g> </g> <g> </g> <g> </g> <g> </g> <g> </g> <g> </g> <g> </g> <g> </g> <g> </g> <g> </g> <g> </g> <g> </g> <g> </g> </svg>`;
            $mainDiv.id             =   mainDivId;
            $mainDiv.className      =   mainDivClass;
            $mainDiv.style          =   mainDivStyle;


            $body.appendChild($mainDiv);

            let mainDivHtml =   `
                <div id="${messagesId}" class="buschat-messages" style="${messagesStyle}"></div>
                <textarea type="text" id="${addMessageTextId}" class="buschat-add-message" style="${addMessageTextStyle}"></textarea>
                <button id="${addMessageButtonId}" class="buschat-add-message-button" style="${addMessageButtonStyle}">${addMessageButtonSVG}</button>
            `;
            $mainDiv.innerHTML              =   mainDivHtml;
            this.state.chatWindowCreated    =   true;
            this.askForChat(this.state.brand, this.state.userId)
            this.openChatWindow(this.state.brand, this.state.chatId);
            this.serverInteraction()
        } else {
            this.askForChat(this.state.brand, this.state.userId)
            this.openChatWindow(this.state.brand, this.state.chatId);
            this.serverInteraction()
        }
    }

    openChatWindow() {
        let $mainDiv    =   document.getElementById(`buschat-wrapper-${this.data.hash}`);
        $mainDiv.style.display  =   'block';
    }

    closeChatWindow() {

    }

    askForChat(brand, userId) {
        var that    =   this;
        ajax.post(this.state.serverUrl + '/chat/askForChat/' + brand)
            .send({userId: userId})
            .set('Content-Type', 'application/json')
            .end((resp, data) => {
                that.state.chatId   =   data.body.chatId;
            })
    }

    serverInteraction(lastTimestamp) {
        if(!lastTimestamp) lastTimestamp = `0000-00-00 00:00:00.000000`;
        var that    =   this;
        if(this.state.serverConnectionMethod === 'ajax') {
            this.state.ajaxCallsInterval    =   setInterval(() => {
                ajax.get(this.state.serverUrl + '/chat/message/' + this.state.chatId)
                    .send({lastTimestamp: lastTimestamp})
                    .end(function(resp, data) {
                        that.printMessages(data.body)
                    })
            }, 5000)
        }
    }

    printMessages(messages) {
        let messageId = 0, messagesLength = messages.length, messagesText, $messagesSelector = document.getElementById(`buschat-messages-${this.data.hash}`);
        for(messageId; messageId < messagesLength; messageId++) {
            if(!this.state.lastMessageTimestamp || this.state.lastMessageTimestamp < new Date(messages[messageId].timestamp).getTime()) {
                let $messageElement =   document.createElement('div');
                $messageElement.id  =   `message-id-${messageId}`;
                $messageElement.innerText   =   messages[messageId].message;
                $messagesSelector.appendChild($messageElement)
                this.state.lastMessageTimestamp =   messages[messageId].timestamp;
            }
        }
    }
}

window.buschat   =   new Buschat();
export default Buschat;