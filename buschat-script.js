import ajax from 'superagent';
import ajaxJsonp from 'superagent-jsonp';
import md5 from 'js-md5';

class Nuntius {
    constructor() {
        this.state  =   {
            chatWindowOpened: false,
            chatWindowCreated: false,
            serverConnectionMethod: 'ajax',
            serverUrl: 'http://192.168.0.102:800',
            ajaxCallsInterval: false,
            brand: false,
            userId: false,
            sessionId: false,
            sessionHash: false,
            lastMessageTimestampConverted: `0000-00-00 00:00:00.000000`,
            lastMessageTimestamp: 0,
            lastBannerView: 0,
            bannerCurrentShow: false
        };

        this.data   =   {
            hash: md5(new Date().getTime()),
            translation: {
                messageAddedSuccessfully: `Message Added Successfully`,
                errorOccurred: `Error Occurred`,
            },
            getMessagesRunning: false,
            userLocation: {}
        };
    }

    showBanner(banners) {
        if(!banners) return;
        if(banners.length && !this.state.bannerCurrentShow) {
            let banner      =   banners.shift(),
                $body       =   document.getElementsByTagName('body')[0],
                $mainDiv    =   document.createElement('div'),
                that        =   this,
                $lastBanner =   document.getElementById("nuntius-banner"),
                $cancelButton,
                cancelButton    =   '<svg version="1.1" id="Capa_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" width="25px" height="25px" viewBox="0 0 305.002 305.002" style="enable-background:new 0 0 305.002 305.002;" xml:space="preserve"> <g> <g> <path d="M152.502,0.001C68.412,0.001,0,68.412,0,152.501s68.412,152.5,152.502,152.5c84.089,0,152.5-68.411,152.5-152.5 S236.591,0.001,152.502,0.001z M152.502,280.001C82.197,280.001,25,222.806,25,152.501c0-70.304,57.197-127.5,127.502-127.5 c70.304,0,127.5,57.196,127.5,127.5C280.002,222.806,222.806,280.001,152.502,280.001z"/> <path d="M170.18,152.5l43.13-43.129c4.882-4.882,4.882-12.796,0-17.678c-4.881-4.882-12.796-4.881-17.678,0l-43.13,43.13 l-43.131-43.131c-4.882-4.881-12.796-4.881-17.678,0c-4.881,4.882-4.881,12.796,0,17.678l43.13,43.13l-43.131,43.131 c-4.881,4.882-4.881,12.796,0,17.679c2.441,2.44,5.64,3.66,8.839,3.66c3.199,0,6.398-1.221,8.839-3.66l43.131-43.132 l43.131,43.132c2.441,2.439,5.64,3.66,8.839,3.66s6.398-1.221,8.839-3.66c4.882-4.883,4.882-12.797,0-17.679L170.18,152.5z"/> </g> </g> <g> </g> <g> </g> <g> </g> <g> </g> <g> </g> <g> </g> <g> </g> <g> </g> <g> </g> <g> </g> <g> </g> <g> </g> <g> </g> <g> </g> <g> </g> </svg>'

            if($lastBanner) {
                $lastBanner.remove();
            }

            $mainDiv.innerHTML  =   `<div id="nuntius-banner">
                                        <div id="nuntius-banner-cancel">${cancelButton}</div>
                                        ${banner.banner_data}
                                     </div>`;
            $mainDiv.style      =   `position: fixed`;

            $body.appendChild($mainDiv);
            $cancelButton   =   document.getElementById('nuntius-banner-cancel');
            $cancelButton.style     =   `float: right;
                                        margin-left: 4px;
                                        margin-bottom: 4px;`;
            $cancelButton.addEventListener('click', () => {that.closeBanner()});
            this.state.lastBannerView   =   banner.datetime;
            this.state.bannerCurrentShow    =   true;
        }
    }

    closeBanner() {
        let $banner =   document.getElementById('nuntius-banner');
        $banner.style.display   =   'none';
        this.state.bannerCurrentShow    =   false;
    }

    getUserDetails() {
        let getUserDetailsPromise   =   new Promise((resolve, reject) => {
            let url =   `http://ip-api.com/json`;
            return ajax.get(url)
                        .end((err, data) => {
                            resolve(data)
                        })
            })
        return getUserDetailsPromise;
    }

    initChatWindow(options = {}) {
        if(!options.userId) options.userId = 0;
        if(options.serverConnectionMethod) this.state.serverConnectionMethod;
        if(!options.brand) return;
        this.state.brand    =   options.brand;
        this.state.userId    =   options.userId;

        if(options.translation && options.translation.messageAddedSuccessfully) this.data.translation.messageAddedSuccessfully;
        if(options.translation && options.translation.errorOccurred) this.data.translation.errorOccurred;

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
                                        width: 200px;`;
            let messagesId          =   `buschat-messages-${hash}`;
            let messagesStyle       =   `width: 100%;
                                        height: 100%;
                                        background: rgba(0,0,255, 0.25);
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
                                        width: 80%;
                                        outline: none`;
            let addMessageButtonId      =   `buschat-add-message-button-${hash}`;
            let addMessageButtonStyle   =   `width: 19%;
                                            height: 45px;
                                            float: right;
                                            background-color: #0078e7;
                                            font-family: inherit;
                                            font-size: 100%;
                                            color: rgba(0,0,0,.8);
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
                                            box-sizing: border-box;
                                            outline: none`;
            let messagesWrapperStyle =  `
                                        overflow-x: auto;
                                        height: 75%;
                                        margin-bottom: 0.5em;`;

            let systemMessageStyle       =   `
                                                background-color: #5bc0de;
                                                padding: .2em .6em .3em;
                                                font-size: 75%;
                                                font-weight: 700;
                                                line-height: 1;
                                                color: #fff;
                                                text-align: center;
                                                white-space: nowrap;
                                                vertical-align: baseline;
                                                border-radius: .25em;
                                                font-family: Helvetica,Arial,sans-serif;
                                                margin-bottom: 0.25em;
                                                width: 82%;
                                                height: 1em;
                                                float: left;
                                                transition: all 2s;
                                                -webkit-transition: all 2s;
            `;

            let cancelIconStyle         =   `
                                            float: right;
                                            width: 10%;
                                            cursor: pointer;
            `;

            let addMessageButtonSVG  =   `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" x="0px" y="0px" viewBox="0 0 14 14" style="enable-background:new 0 0 14 14;" xml:space="preserve" width="100%" height="100%"> <g> <path d="M7,0.935c-3.866,0-7,2.463-7,5.5c0,1.438,0.703,2.749,1.854,3.729 c-0.044,0.955-0.242,2.239-0.942,2.901c1.337,0,2.706-0.88,3.518-1.514c0.796,0.248,1.663,0.384,2.57,0.384c3.866,0,7-2.463,7-5.5 S10.866,0.935,7,0.935z" fill="#006DF0"/> </g> <g> </g> <g> </g> <g> </g> <g> </g> <g> </g> <g> </g> <g> </g> <g> </g> <g> </g> <g> </g> <g> </g> <g> </g> <g> </g> <g> </g> <g> </g> </svg>`;
            let cancelIconSVG        =  `<?xml version="1.0" encoding="iso-8859-1"?> <!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd"> <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" viewBox="0 0 512 512" enable-background="new 0 0 512 512" width="95%" height="95%"> <path d="M256,0C114.844,0,0,114.844,0,256s114.844,256,256,256s256-114.844,256-256S397.156,0,256,0z M358.625,313.375 c12.5,12.492,12.5,32.758,0,45.25C352.383,364.875,344.188,368,336,368s-16.383-3.125-22.625-9.375L256,301.25l-57.375,57.375 C192.383,364.875,184.188,368,176,368s-16.383-3.125-22.625-9.375c-12.5-12.492-12.5-32.758,0-45.25L210.75,256l-57.375-57.375 c-12.5-12.492-12.5-32.758,0-45.25c12.484-12.5,32.766-12.5,45.25,0L256,210.75l57.375-57.375c12.484-12.5,32.766-12.5,45.25,0 c12.5,12.492,12.5,32.758,0,45.25L301.25,256L358.625,313.375z" fill="#FFDA44"/> </svg>`;
            $mainDiv.id             =   mainDivId;
            $mainDiv.className      =   mainDivClass;
            $mainDiv.style          =   mainDivStyle;


            $body.appendChild($mainDiv);

            let mainDivHtml =   `
                                <div style="${systemMessageStyle}" id="buschat-system-message" class="buschat-system-message"></div>
                                <div id="buschat-cancel-icon-${this.data.hash}" class="buschat-cancel-icon" style="${cancelIconStyle}">${cancelIconSVG}</div>
                                <div style="clear: both"></div>
                                <div style="${messagesWrapperStyle}" class="buschat-message-wrapper" id="buschat-message-wrapper">
                                    <div id="${messagesId}" class="buschat-messages" style="${messagesStyle}"></div>
                                </div>
                                <textarea type="text" id="${addMessageTextId}" class="buschat-add-message" style="${addMessageTextStyle}"></textarea>
                                <button id="${addMessageButtonId}" class="buschat-add-message-button" style="${addMessageButtonStyle}">${addMessageButtonSVG}</button>

            `;
            $mainDiv.innerHTML              =   mainDivHtml;

            let $cancelIcon =   document.getElementById(`buschat-cancel-icon-${this.data.hash}`);

            let $buschatAddMessageButton    =   document.getElementById(`buschat-add-message-button-${this.data.hash}`);
            $buschatAddMessageButton.addEventListener('click', this.sendMessage.bind(this));

            this.state.chatWindowCreated    =   true;
            this.askForSession(this.state.brand, this.state.userId);
            // this.openChatWindow(this.state.brand, this.state.sessionId);
            this.serverInteraction()
        } else {
            this.askForSession(this.state.brand, this.state.userId);
            this.serverInteraction()
        }

        //Callback Function
        if(options.chatWindowOpened) options.chatWindowOpened()
    }

    openChatWindow(callback) {
        if(!this.state.sessionHash) {
            this.askForSession(this.state.brand, this.state.userId);
        }

        if(!this.state.chatWindowOpened) {
            let $mainDiv = document.getElementById(`buschat-wrapper-${this.data.hash}`);
            $mainDiv.style.display = 'block';
            if(callback) callback();
        }
    }

    closeChatWindow(callback) {
        clearInterval(this.state.ajaxCallsInterval);
        this.state.chatWindowCreated    =   false;
        let $mainDiv    =   document.getElementById(`buschat-wrapper-${this.data.hash}`);
        $mainDiv.style.display  =   'none';
        this.state.chatWindowOpened =   false;

        //Callback Function
        if(callback) callback();
    }

    askForSession(brand, userId) {
        var that    =   this;
        this.getUserDetails().then((data) => {
            that.data.userLocation = data.body;
            ajax.get(this.state.serverUrl + '/chat/askForSession/' + brand)
                // .use(ajaxJsonp)
                .query({
                    userId,
                    countryCode: that.data.userLocation.countryCode
                })
                .end(function(resp, data) {
                    if(data.body) {
                        that.state.sessionHash  =   data.body.sessionHash;
                        that.state.companyId    =   data.body.companyId;
                        that.chatAndBannerLastMessages()
                    }
                })

        })
    }

    serverInteraction(lastTimestamp) {
        var that    =   this;
        this.chatAndBannerLastMessages();
        if(this.state.serverConnectionMethod === 'ajax') {
                clearInterval(this.state.ajaxCallsInterval);
                this.state.ajaxCallsInterval = setInterval(() => {
                    if(that.state.sessionHash) {
                        if (this.data.getMessagesRunning) return;
                        this.chatAndBannerLastMessages();
                    }
                }, 2000)

        }
    }

    chatAndBannerLastMessages() {
        this.data.getMessagesRunning    =   true;
        var that    =   this;
        ajax.get(this.state.serverUrl + '/client/chatAndBannerLastMessages')
            .query({lastTimestamp: that.state.lastMessageTimestamp, sessionHash: that.state.sessionHash, lastBannerView: this.state.lastBannerView, companyId: that.state.companyId})
            .end(function(resp, data) {
                that.data.getMessagesRunning    =   false;
                if(data && data.body && data.body.code === 200) {
                    that.printMessages(data.body.dataChat);
                    that.showBanner(data.body.dataBanner);

                } else if(data && data.body && data.body.code === 400) {
                    that.state.sessionHash  =   false;
                    that.state.sessionId    =   false;
                }
            })
    }

    printMessages(messages) {
        if(!messages || !messages.length) return;
        let messageId           =   0,
            messagesLength      =   messages.length,
            messagesText,
            $messagesSelector   =   document.getElementById(`buschat-messages-${this.data.hash}`),
            that                =   this;
        let agentStyle  =   `
                                    padding: 1%;
                                    font-family: "Helvetica Neue",Helvetica,Arial,sans-serif;
                                    font-size: 14px;
                                    border-radius: 4px;
                                    background-color: #337ab7;
                                    padding: .2em .6em .3em;
                                    font-size: 75%;
                                    line-height: 1;
                                    color: #fff;
                                    vertical-align: baseline;
                                    border-radius: .25em;
                                    margin-bottom: 2px;
        `;

        let clientStyle  =   `
                                padding: 1%;
                                font-family: "Helvetica Neue",Helvetica,Arial,sans-serif;
                                font-size: 14px;
                                border-radius: 4px;
                                background-color: #f0ad4e;
                                padding: .2em .6em .3em;
                                font-size: 75%;
                                line-height: 1;
                                color: #fff;
                                vertical-align: baseline;
                                border-radius: .25em;
                                margin-bottom: 2px;
        `;

        let datetimeStyle   =   `
                                font-size: 70%;
                                font-weight: 700;
        `;

        for(messageId; messageId < messagesLength; messageId++) {
            let $messageElement =   document.createElement('div');
            $messageElement.id  =   `message-id-${messageId}`;
            let datetime        =   this.convertDatetime(messages[messageId].datetime);
            $messageElement.innerHTML   =   `<span style="${datetimeStyle}" class="buschat-datetime">${datetime}: </span> ${messages[messageId].message}`;
            $messageElement.style       =   messages[messageId].source == 'agent' ? agentStyle : clientStyle;
            $messageElement.className   =   messages[messageId].source == 'agent' ? `buschat-message-agent` : `buschat-message-client`;
            $messagesSelector.appendChild($messageElement)

            this.state.lastMessageTimestampConverted    =   new Date(messages[messageId].datetime).getTime();
            this.state.lastMessageTimestamp             =   messages[messageId].datetime;
        }
        let $messageWrapper  =   document.getElementById('buschat-message-wrapper')
        $messageWrapper.scrollTop = $messageWrapper.scrollHeight;
        that.openChatWindow()
    }

    sendMessage() {
        let $messageText    =   document.getElementById(`buschat-add-message-text-${this.data.hash}`),
            message         =   $messageText.value,
            source          =   'client',
            that            =   this;
        ajax.post(that.state.serverUrl + `/chat/message/${this.state.sessionHash}`)
            .query({message: message, userId: this.state.userId, source: source, companyId: that.state.companyId})
            // .use(ajaxJsonp)
            .end((resp, data) => {
                if(data && data.body.code == 200) {
                    let $buschatSystemMessage   =   document.getElementById('buschat-system-message');
                    $buschatSystemMessage.innerText =   that.data.translation.messageAddedSuccessfully;
                    that.chatAndBannerLastMessages()
                    setTimeout(() => {
                        $buschatSystemMessage.innerText =   ``;
                    }, 2000)
                } else {
                    let $buschatSystemMessage   =   document.getElementById('buschat-system-message');
                    $buschatSystemMessage.innerText =   that.data.translation.errorOccurred;
                    setTimeout(() => {
                        $buschatSystemMessage.innerText =   ``;
                    }, 2000)
                }
            })
    }

    convertDatetime(datetime) {
        let date    =   new Date(datetime);
        let year    =   date.getFullYear();
        let month   =   date.getMonth() > 9 ? date.getMonth() : `0${date.getMonth()}`;
        let day     =   date.getDate() > 9 ? date.getDate() : `0${date.getDate()}`;
        let hour    =   date.getHours() > 9 ? date.getHours() : `0${date.getHours()}`;
        let minutes =   date.getMinutes() > 9 ? date.getMinutes() : `0${date.getMinutes()}`;
        let seconds =   date.getSeconds() > 9 ? date.getSeconds() : `0${date.getSeconds()}`;

        return `${year}-${month}-${day} ${hour}:${minutes}:${seconds}`;

    }

    deleteSession() {
        let sessionHash    =   this.state.sessionHash;
        ajax.post(this.state.serverUrl + '/chat/deleteSession/')
            .send({sessionHash})
            .end()
    }

    postAction(options) {
        if(!options || !this.state.sessionHash) return;
        let that    =   this;
        ajax.post(`${that.state.serverUrl}/action/${that.state.sessionHash}`)
            .query({
                actionName: options.actionName,
                extraData: options.extraData || '',
                amount: options.amount,
                companyId: that.state.companyId
            })
            .end()
    }
}

window.Nuntius   =   new Nuntius();
export default Nuntius;