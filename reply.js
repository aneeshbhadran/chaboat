module.exports = Reply;

// default replies
const REPLY_ERROR = "An error has occured. Please try again.";
const REPLY_DID_NOT_UNDERSTAND = "I didn't understand that. Can you rephrase?";
const REPLY_SUCCESSFUL = "I understood your message. You can tailor my responses to your messages by analysing the metadata attached with this message.";

function Reply(message, intent, entities) {
    this.message = message;
    this.reply = this.getReply(intent);
    this.intent = intent;
    this.entities = entities;
    this.context = "global";
}

Reply.prototype.toJson = function() {
    var json = {};
    json['intent'] = this.intent;
    json['entities'] = this.entities;
    json['reply'] = this.reply;
    json['message'] = this.message;
    return json;
};

 Reply.prototype.getReply = function(intent){
    if(!intent){
      return REPLY_DID_NOT_UNDERSTAND;
    }
    else{
      switch(intent.name){
        case "init1": return "Hello there!";
        case "init2": return "I am a chatbot! I am still in development and I don't know much... But feel free to ask me something (please don't insult me!)";
        case "affirm": return "Ook :)";
        case "greet":  return  "Hello there!";
        case "restaurant_search":  return  "There are some nice restaurants around here!";
        case "goodbye": return "Pleasure talking to you. Goodbye!";
        case "variable_search":{
          if(entities["search_term"] === "accrued interest"){
            return "";
          }
        }
        default: return "Sorry, I did not understand your input. Please try again.";
      }
    }  
  };
