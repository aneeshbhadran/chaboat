(function () {
    //This is the message object, which has some text, and a "side"
    var Message;
    var messageId = 0;
    var replyId = 0;
    var userPicId = (Math.round(Math.random()) + 1);
    var showHelpTooltip = true;
    Message = function (arg) {
        this.text = arg.text;
        this.message_side = arg.message_side;
        this.intent = arg.intent;
        this.sender = arg.sender;
        this.originalMessage = arg.originalMessage;
        this.draw = function (_this) {
            return function () {
                var $message = $($('.message_template').clone().html()); //Create the new message starting from the template

                if (_this.sender === "bot") {
                    if (_this.originalMessage === "init") {
                        $message.find("#wrapper.feedback").text("");
                        $message.find("#wrapper.feedback").addClass("empty");   
                        //$message.prepend("<div id='dummy'> </div>");
                    } else if(_this.originalMessage == "writing"){
                        //$message.find("#wrapper.feedback").remove();
                        //$message.prepend("<div id='dummy'> </div>");
                        $message.find("#wrapper.feedback").text("");
                        $message.find("#wrapper.feedback").addClass("empty");
                        $message.addClass("writing");
                        $message.find(".message-time").hide();
                    }
                    else {
                        //Looking for the last element in the messages container with class left and writing
                        $lastWritingMessage =  $('.message.left.writing');
                        $message.attr("replyId", replyId++);
                        $message.find(".intent-info").find(".intent").text(_this.intent);
                        $message.find(".intent-info").find("#question p").text("Did I understand correctly?");
                        //console.log("It is not an init message");
                        if(!$(".js-help-switch").is(":visible") && showHelpTooltip) {
                            $("#help-toggle").fadeIn(200, function(){
                                $("#help-toggle .toggle-tooltip").fadeIn(200);
                            });
                        }
                    }
                } else {
                    
                    $message.attr("messageId", messageId++);
                }

                $message.addClass(_this.message_side).find('.text').html(_this.text);
                $message.find(".avatar").attr('class', 'transparent avatar'); 
                $lastMessage = $('.messages li:last-child').last();
                if (!$lastMessage.hasClass(_this.message_side)) {
                    var userPicString = _this.message_side == "left" ? "bot_pic.png" :  "user" + userPicId + ".svg";
                    $message.find(".avatar").append("<img class='avatarPic' src='" +userPicString +"'>");
                } else {
                    if($lastMessage.hasClass("writing")){
                        $lastMessage.removeClass("writing");
                    }
                    else{
                        //if we are still on the same side I want to remove the tick and I also avoid appending the user or bot pic
                        $message.find(".text_wrapper").addClass("no-tick");
                        $message.find("#wrapper.feedback").addClass("no-tick");
                    }
                }
                var date = new Date();
                $message.find(".message-time").text(moment().format('HH:mm'));
                $('.messages').append($message);
                return setTimeout(function () {
                    return $message.addClass('appeared');
                }, 0);
            };
        }(this);
        return this;
    };

    $(function () {
        var getMessageText, message_side, sendMessage;
        var message_side = 'right';
        const messageChannel = 'message';
        const replyChannel = 'reply';
        var socket = io();

        socket.on(replyChannel, function (jsonObj) {
            console.log("Received a reply from bot: ");
            console.log(jsonObj);
            appendMessage(jsonObj.reply, "bot", jsonObj.intent.name, jsonObj.message);
        });

        socket.on(messageChannel, function (msg, isUser) {
            console.log("Received a message: " + msg);
            appendMessage(text, "user", "");
        });


        sendMessage = function (text) {
            var message_input = $('.message_input');
            var messageText = message_input.val().trim();
            if (messageText === '') {
                return;
            }
            $('.message_input').val('');
           
            socket.emit(messageChannel, messageText, true, function(message){
                console.log("Error: " +message);
            });
            appendMessage(messageText, "user", "");
        };

        appendMessage = function (text, from, intentTxt, originalMessage) {
            //IF the message is empty, do nothing
            if (text.trim() === '') {
                return;
            }

            var $messages, message;

            $messages = $('.messages');
            message_side = from === 'bot' ? 'left' : 'right';

            
            message = new Message({
                text: text,
                message_side: message_side,
                intent: intentTxt,
                sender: from,
                originalMessage: originalMessage
            });
            message.draw();

            
            return $messages.animate({
                scrollTop: $messages.prop('scrollHeight')
            }, 100);
        }

        $('.send_message').click(function (e) {
            return sendMessage();
        });

        $('.message_input').keyup(function (e) {
            if (e.which === 13) {
                return sendMessage();
            }
        });
        var helpSwitch = document.querySelector('.js-help-switch');
        var init = new Switchery(helpSwitch);
        init.setPosition(true);

        var themeSwitch = document.querySelector('.js-theme-switch');
        var init2 = new Switchery(themeSwitch,  {jackSecondaryColor: '#b1e0f9', secondaryColor: '#fdd5a9', jackColor: '#ded9d9', color: '#5773ff'});
        init2.setPosition(true);

        helpSwitch.addEventListener('click',function () {
            console.log("Feedback toggle");
            $('#help-toggle .toggle-tooltip').fadeOut();
            showHelpTooltip = false;
            $(".feedback").each(function () {
                var feedbackMessage = $(this);
                if(!helpSwitch.checked){
                    
                    feedbackMessage.not(".empty").not("#sent").animate({opacity: 0}, 50, function(){
                        feedbackMessage.find(".intent-info").hide(0);
                        //feedbackMessage.find(".intent").hide(0);
                        feedbackMessage.animate({width: 0}, 150);  
                    });  

                    feedbackMessage.not(".empty").filter("#sent").animate({opacity: 0}, 50, function(){
                        feedbackMessage.find(".intent-info").hide(0);
                        feedbackMessage.find(".intent").hide(0);
                        feedbackMessage.animate({width: 15}, 150);  
                    });  

                    
                    setTimeout(function(){
                        feedbackMessage.filter(".empty").find(".intent-info").hide(0);
                        feedbackMessage.filter(".empty").animate({width: 0}, 150);  
                    }, 50);
                }
                else{
                    
                    feedbackMessage.not("#sent").animate({width: 250}, 150, function(){
                        feedbackMessage.find(".intent-info").show(0);
                        feedbackMessage.not(".empty").animate({opacity: 1}, 200);
                    });

                    feedbackMessage.filter("#sent").animate({width: 250}, 150, function(){
                        feedbackMessage.find(".intent").show(0);
                        feedbackMessage.not(".empty").animate({opacity: 1}, 200);
                    });
                }
            });
        });

        themeSwitch.addEventListener('click', function () {
            var messagesContainer = $(".messages");
            if(messagesContainer.hasClass("theme1")){
                console.log("Has theme1, switching to theme2");
                messagesContainer.removeClass("theme1").addClass("theme2");
            }
            else if(messagesContainer.hasClass("theme2")){
                console.log("Has theme2, switching to theme1");
                messagesContainer.removeClass("theme2").addClass("theme1");
            }
        });

        
        $('.messages').on('click', "span.feedback_yes", function () {
            var intent = $(this).parent().parent().find(".intent").text(); 
            var $message = $(this).parent().parent().parent().parent().parent();
            var replyId = $message.attr("replyId"); 
            var message = $(this).parent().parent().parent().parent().parent().parent().find(".message[messageId='" + replyId + "']").find(".text").text();
            console.log("YES! ID: " + replyId + " | message: " + message + " | intent: " + intent);
            var wrapper = $(this).parent().parent().parent().parent();
            var wrapperParent = $(this).parent().parent().parent().parent().parent();
            var check = $('#checkTemplate #checkYes').clone().html();
            var $messages = $message.parent();
            
            wrapper.animate({ opacity: 0  }, 200, function () {
                $(this).remove();
                var newEl = $("<div class='feedback' id='sent'> <a class='intent'>" + intent + "</a> " + check + "</div>");
                newEl.css('opacity', 0);
                newEl.css('width', 250);
                newEl.prependTo(wrapperParent).animate({opacity: 1}, 500);
            });
            socket.emit(replyChannel, message, intent, true);
        });

        $('.messages').on('click', "span.feedback_no", function () {
            var intent = $(this).parent().parent().find(".intent").text(); 
            var $message = $(this).parent().parent().parent().parent().parent();
            var replyId = $message.attr("replyId"); 
            var message = $(this).parent().parent().parent().parent().parent().parent().find(".message[messageId='" + replyId + "']").find(".text").text();
            console.log("NO! ID: " + replyId + " | message: " + message + " | intent: " + intent);
            var wrapper = $(this).parent().parent().parent().parent();
            var wrapperParent = $(this).parent().parent().parent().parent().parent();
            var check = $('#checkTemplate #checkNo').clone().html();
            var $messages = $message.parent();
            
            wrapper.animate({  opacity: 0 }, 200, function () {
                $(this).remove();
                var newEl = $("<div class='feedback' id='sent'> <a class='intent'>" + intent + "</a> " + check + "</div>");
                newEl.css('opacity', 0);
                newEl.css('width', 250);
                newEl.prependTo(wrapperParent).animate({opacity: 1}, 500);
            });
            socket.emit(replyChannel, message, intent, false);
        });

        $('#help-toggle .toggle-tooltip .close').on('click', function() {
            $('#help-toggle .toggle-tooltip').fadeOut(150);
            showHelpTooltip = false;
            event.preventDefault();
        })

        $('#help-toggle .toggle-tooltip').on('click', function() {
            event.preventDefault();
        })
    });

}.call(this));