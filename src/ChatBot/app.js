
var restify = require('restify');
var builder = require('botbuilder');
var botbuilder_azure = require("botbuilder-azure");
var dcupachatbot = require('dcupachatbot');

// Restify Server
var server = restify.createServer();
server.listen(process.env.port || process.env.PORT || 3978, function () {
   console.log('%s listening to %s', server.name, server.url); 
});
  
// Chat connector to bot service
var connector = new builder.ChatConnector({
    appId: process.env.MicrosoftAppId,
    appPassword: process.env.MicrosoftAppPassword,
    openIdMetadata: process.env.BotOpenIdMetadata 
});

// Listener for user messages
server.post('/api/messages', connector.listen());

//Data storage
var tableName = 'botdata';
var azureTableClient = new botbuilder_azure.AzureTableClient(tableName, process.env['AzureWebJobsStorage']);
var tableStorage = new botbuilder_azure.AzureBotStorage({ gzipData: false }, azureTableClient);

// Recieve user messages
var bot = new builder.UniversalBot(connector, function (session)
{
    session.send('Sorry, I did not understand. I can help you get the bus and give you info on DCU such as student union events, building names/IDs, building locations and more!.', session.message.text);
});
bot.set('storage', tableStorage);

// Luis setup
var luisAppId = process.env.LuisAppId;
var luisAPIKey = process.env.LuisAPIKey;
var luisAPIHostName = process.env.LuisAPIHostName || 'westus.api.cognitive.microsoft.com';

const LuisModelUrl = 'https://' + luisAPIHostName + '/luis/v1/application?id=' + luisAppId + '&subscription-key=' + luisAPIKey;

// Recognizer for Luis intents/entities
var recognizer = new builder.LuisRecognizer(LuisModelUrl);
bot.recognizer(recognizer);

//Intent functions

bot.dialog('Greeting', [
    function(session) {
       // session.send('You reached Greeting intent, you said \'%s\'.', session.message.text);
        session.send('Hello!');
        session.send('Welcome to the DCU PA Chat Bot.');
        session.send('You can ask this bot questions about DCU (Building names and locations, FAQs, Student union events and more!');
        session.send('You can ask this bot about your timetable.');
        session.send('You can also ask this bot to get you bus times.');
}]).triggerAction({
    matches: 'Greeting'
});


//Dublin Bus
bot.dialog('GetStopInfo', [
    function(session, args) {

        var stopEnt = builder.EntityRecognizer.findEntity(args.intent.entities, 'BusStopNum');
        var stopNum = stopEnt.entity;

        dcupachatbot.getBusStopInfo(stopNum, function (reply) {
            if (stopNum != null) {
                 session.send(reply, session.message.text);
            }
        });

}]).triggerAction({
    matches: 'GetStopInfo'
});


bot.dialog('GetBusTime', [
    function(session, args) {

        var routeEnt = builder.EntityRecognizer.findEntity(args.intent.entities, 'BusRouteNum');
        var stopEnt = builder.EntityRecognizer.findEntity(args.intent.entities, 'BusStopNum');
        var routeNum = routeEnt.entity;
        var stopNum = stopEnt.entity;

        dcupachatbot.getBusTimesSingle(stopNum, routeNum, function (err, reply) {
            if (routeNum != null) {
                 session.send(reply, session.message.text);
            }
        });

}]).triggerAction({
    matches: 'GetBusTime'
});

bot.dialog('GetAllBusTimes', [
    function(session, args) {

        var stopEnt = builder.EntityRecognizer.findEntity(args.intent.entities, 'BusStopNum');
        var stopNum = stopEnt.entity;

        dcupachatbot.getBusTimesAll(stopNum, function (err, reply) {
            if (stopNum != null) {
                 session.send(reply, session.message.text);
            }
        });

}]).triggerAction({
    matches: 'GetAllBusTimes'
});

bot.dialog('GetMeHome', [
    function (session, args, next) {

        if (!session.userData.prefBusStop) {
            session.userData.prefBusStop = {};
        }
        if (!session.userData.prefBusRoute) {
            session.userData.prefBusRoute = {};
        }

        var stopNum = session.userData.prefBusStop;
        var routeNum = session.userData.prefBusRoute;

        if(typeof stopNum == "number")
        {
                dcupachatbot.getBusTimesSingle(stopNum, routeNum, function (err, reply) {
                if (routeNum != null) {
                     session.send(reply, session.message.text);
                }
                });
                session.endDialog();
        }
        else{
            builder.Prompts.number(session, 'What number bus stop do you use?');
        }
    },
    function (session, results, next) {
        if (results.response) {
            session.userData.prefBusStop = results.response;
        }

        builder.Prompts.number(session, 'What number bus do you take?');
    },
    function (session, results) {
        if (results.response) {
            session.userData.prefBusRoute = results.response;
        }

        var stopNum = session.userData.prefBusStop;
        var routeNum = session.userData.prefBusRoute;

        dcupachatbot.getBusTimesSingle(stopNum, routeNum, function (err, reply) {
            if (routeNum != null) {
                 session.send(reply, session.message.text);
            }
        });

        session.endDialog('Setting your route home to stop "%s" using the number "%s" bus. You can change this later.',
            session.userData.prefBusStop, session.userData.prefBusRoute);

}]).triggerAction({
    matches: 'GetMeHome'
});


bot.dialog('ChangeBusRoute', [
    function (session, args, next) {
        if (!session.userData.prefBusStop) {
            session.userData.prefBusStop = {};
        }
        if (!session.userData.prefBusRoute) {
            session.userData.prefBusRoute = {};
        }

        session.userData.prefBusRoute = {};
        session.userData.prefBusStop = {};

        if (!session.userData.prefBusStop) {
            builder.Prompts.number(session, 'What bus stop do you use?');
        } else {
            next();
        }
    },
    function (session, results, next) {
        if (results.response) {
            session.userData.prefBusStop = results.response;
        }

        if (!session.userData.prefBusRoute) {
            builder.Prompts.number(session, 'What number bus do you take?');
        } else {
            next();
        }
    },
    function (session, results) {
        if (results.response) {
            session.userData.prefBusRoute = results.response;
        }

        session.endDialog('Setting your route home to stop "%s" using the number "%s" bus. You can change this later.',
            session.userData.prefBusStop, session.userData.prefBusRoute);

}]).triggerAction({
    matches: 'ChangeBusRoute'
});

bot.dialog('GetAllClasses', [
    function (session, args, next) {

        if (!session.userData.courseID) {
            session.userData.courseID = {};
        }
        if (!session.userData.year) {
            session.userData.year = {};
        }
        if (!session.userData.semester) {
            session.userData.semester = {};
        }

        var courseID = session.userData.courseID;
        var year = session.userData.year;
        var semester = session.userData.semester;
        if(typeof year == "number")
        {

            dcupachatbot.getTimetableDay(courseID, year, semester, function (reply) {
                session.send(reply, session.message);
            });
            session.endDialog();
        }
        else{
           builder.Prompts.text(session, 'What is the ID of your course?');
        }
    },

    function (session, results, next) {
        if (results.response) {
            session.userData.courseID = results.response;
        }

        builder.Prompts.number(session, 'What year are you in?');
    },
    function (session, results, next) {
        if (results.response) {
            session.userData.year = results.response;
        }

        builder.Prompts.number(session, 'What semester are you in?');
    },
    function (session, results) {
        if (results.response) {
            session.userData.semester = results.response;
        }
        var courseID = session.userData.courseID;
        var year = session.userData.year;
        var semester = session.userData.semester;   
        dcupachatbot.getTimetableDay(courseID, year, semester, function (reply) {

            session.send(reply, session.message);
        });
        session.endDialog('Setting your timetable to course "%s" in year "%s" in semester "%s". You can change/delete this later.',
            session.userData.courseID, session.userData.year, session.userData.semester);

}]).triggerAction({
    matches: 'GetAllClasses'
});


bot.dialog('GetNextClass', [
    function (session, args, next) {

        if (!session.userData.courseID) {
            session.userData.courseID = {};
        }
        if (!session.userData.year) {
            session.userData.year = {};
        }
        if (!session.userData.semester) {
            session.userData.semester = {};
        }

        var courseID = session.userData.courseID;
        var year = session.userData.year;
        var semester = session.userData.semester;

        if(typeof year == "number")
        {
            dcupachatbot.getTimetableNext(courseID, year, semester, function (err, value) {
                session.send(value, session.message);
            });
            session.endDialog();
        }
        else{
            builder.Prompts.text(session, 'What is the ID of your course?');
        }
    },

    function (session, results, next) {
        if (results.response) {
            session.userData.courseID = results.response;
        }

        builder.Prompts.number(session, 'What year are you in?');
    },
    function (session, results, next) {
        if (results.response) {
            session.userData.year = results.response;
        }

        builder.Prompts.number(session, 'What semester are you in?');
    },
    function (session, results) {
        if (results.response) {
            session.userData.semester = results.response;
        }
        var courseID = session.userData.courseID;
        var year = session.userData.year;
        var semester = session.userData.semester;   

        dcupachatbot.getTimetableNext(courseID, year, semester, function (err, value) {
            session.send(value, session.message);
        });
        session.endDialog('Setting your timetable to course "%s" in year "%s" in semester "%s". You can change/delete this later.',
            session.userData.courseID, session.userData.year, session.userData.semester);

}]).triggerAction({
    matches: 'GetNextClass'
});

bot.dialog('ChangeCoursePrefs', [
    function (session, args, next) {

        if (!session.userData.courseID) {
            session.userData.courseID = {};
        }
        if (!session.userData.year) {
            session.userData.year = {};
        }
        if (!session.userData.semester) {
            session.userData.semester = {};
        }

        session.userData.semester = {};
        session.userData.year = {};
        session.userData.courseID = {};

        builder.Prompts.text(session, 'What is the ID of your course?');
    },
    function (session, results, next) {
        if (results.response) {
            session.userData.courseID = results.response;
        }

        builder.Prompts.number(session, 'What year are you in?');
    },
    function (session, results, next) {
        if (results.response) {
            session.userData.year = results.response;
        }

        builder.Prompts.number(session, 'What semester are you in?');
    },
    function (session, results) {
        if (results.response) {
            session.userData.semester = results.response;
        }

        session.endDialog('Setting your timetable to course "%s" in year "%s" in semester "%s". You can change/delete this later.',
            session.userData.courseID, session.userData.year, session.userData.semester);

}]).triggerAction({
    matches: 'ChangeCoursePrefs'
});

//DCU Campus
bot.dialog('GetBuildingID', [
    function(session, args) {

    var buildingEnt = builder.EntityRecognizer.findEntity(args.intent.entities, 'CampusLocation::BuildingID');
    if(!buildingEnt)
        buildingEnt = builder.EntityRecognizer.findEntity(args.intent.entities, 'CampusLocation');
    var building = buildingEnt.entity;

    dcupachatbot.getBuildingID(building, function(reply)
    {
        session.send(reply, session.message.text);
    });

}]).triggerAction({
    matches: 'GetBuildingID'
});

bot.dialog('DeleteUserInfo', [
    function (session) {
        session.userData = {};
        session.send('Your preferences have been deleted.', session.message.text);

}]).triggerAction({
    matches: 'DeleteUserInfo'
});

bot.dialog('FindCampusLocation', [
    function(session, args) {

    var buildingEnt = builder.EntityRecognizer.findEntity(args.intent.entities, 'CampusLocation');
    var building = buildingEnt.entity;

    dcupachatbot.getBuildingLocation(building, function(value)
    {
        session.send(value, session.message.text);
    });

    var buildingEnt = builder.EntityRecognizer.findEntity(args.intent.entities, 'CampusLocation');
    var building = buildingEnt.entity;

    dublinBus.getBuildingLocation(building, function(reply)
    {
        session.send(reply, session.message.text);
    });

}]).triggerAction({
    matches: 'FindCampusLocation'
});

bot.dialog('GetDCUEvents', [
    function(session) {

        dcupachatbot.getDCUSUEvents(function (err, result) {
                session.send(result, session.message);
        });

}]).triggerAction({
    matches: 'GetDCUEvents'
});


//DCU Website
bot.dialog('GetFAQ', [
    function(session, args, next) {

    builder.Prompts.text(session, 'What question would you like to ask?');
    },   
    function (session, results) {
        if (results.response) {
            var intent = results.response;

            dcupachatbot.getFOIFAQ(intent, function(err, qReply, answer)
            {
                session.send(qReply, session.message.text);
                session.send(answer, session.message.text);
            });
        }
        session.endDialog();

}]).triggerAction({
    matches: 'GetFAQ'
});

bot.dialog('TestFunc', [
    function(session, args) {

        var intent = "What about sub judice?";
            dcupachatbot.getFOIFAQ(intent, function(err, qReply, answer)
            {
                session.send(qReply, session.message.text);
                session.send(answer, session.message.text);
            });

            dcupachatbot.getDCUSUEvents(function (err, result) {
                    session.send(result, session.message);
            });
            
        var building1 = "nursing";
            dcupachatbot.getBuildingLocation(building1, function(value)
            {
                session.send(value, session.message.text);
            });

        var building2 = "x";
            dcupachatbot.getBuildingLocation(building2, function(value)
            {
                session.send(value, session.message.text);
            });

        var courseID = 'case';
        var year = 4;
        var semester = 2; 
            dcupachatbot.getTimetableDay(courseID, year, semester, function (reply) {
                session.send(reply, session.message);
            });
            dcupachatbot.getTimetableNext(courseID, year, semester, function (err, value) {
                session.send(value, session.message);
            });

        var stopNum = 4339;
        var routeNum = 42;
        dcupachatbot.getBusTimesSingle(stopNum, routeNum, function (err, reply) {
            if (routeNum != null) {
                 session.send(reply, session.message.text);
            }
        });

}]).triggerAction({
    matches: 'TestFunc'
});
