# Blog: DCU Personal Assistant Chat Bot

**Ian Kelly ( 13480138 )**
**Supervisor: Gareth Jones**

## 24th November, 2017

This will be my first blog entry. Yesterday I had a meeting with Gareth Jones to discuss my functional spec. I had sent him a draft of the spec the day before and he seemed pleased with it and had only a few suggestions for changes.

I am pleased with making a chat bot for my project, however I am a little concerned that it will turn out to be too simple to make. After talking with a friend he mentioned that getting data from websites is quite difficult to do so I may be surprised with how much work needs to be done.

## 4th February, 2018

I hadn’t gotten as much work done in the past month and a bit as I had hoped to. I wanted to get a chunk of the project or at least the the basics in place before Christmas however family time, combined with time for study and exams alongside a trip abroad, meant that I did not get into the swing of project work until late January.

I figured the best place to start was creating the language model on LUIS. This will be used to find out what the user is trying to ask the bot. The documentation on the LUIS site has great walk-throughs of how to set the model up. First thing I did was created the intents. These will be sent later to the bot. I then gave all of the intents a bunch of example ‘utterances’. These are basically example sentences that the user will ask. For example, the intent ‘GetBusTimes’ will have an utterance like “Give me the bus times for stop 3452 ”.All of these utterances have a score of 0 to 1 of how likely it is to be for this intent.

## 8th February, 2018

I made a list of all of the intents I might need for my bot. There’s ones for Dublin bus, getting single and all bus times. There’s ones for facebook events for the DCUSU. There’s ones for DCU campus like building locations. And finally there’s ones for the dcu website for FAQs and timetables.

I’ve now also made some entities for intents. Entities will be dynamic variables taken from the utterances. So for example the utterance “Get me the bus times for stop 4339”, 4339 will be an example of the ‘BusStopNum’ entity. This means that the user can say different things in their utterance and I don’t have to make an example for every possible one. I’ve attached an image of the ‘BusStopNum’ entity with the utterances it is used in.

## 15th February, 2018

I had a meeting with Gareth via email today just to get a routine of meeting started but it looks like he will be away from DCU quite a bit for the next few weeks. Since my last blog update I made more progress on LUIS and the first iteration of the model has been tested and publshed to an endpoint. I also found very helpful documentation on the LUIS website and on the Bot Builder website that helped me set up the very basic parts of the bot. The docs give some bits of code to connect everything together and get the bot listening  for intents. I also downloaded an emulator for testing the bot later.

## 23rd February, 2018

Started work on Dublin Bus. Honestly had no clue what to do for a day or two. Found another node program for dublin bus that gave me a helpful idea of what I should be doing. I set up continuous integration on azure so that when I publish to azure it also publishs to my git repo but it doesnt seem to work with gitlab. Work seems to be taking much longer that it should because publishing to azure takes a few minutes and refrshing the emulator takes another few. This makes progress slow. On top of that, the emulator doesn't give me error messages so it's a guessing game.

## 2nd March, 2018

Got the dublin bus functions to return a bus time, still trying to get it to get it to return them all. Still not sure how json parsing and callbacks work yet. I also started making functions for the hardcoded data about the DCU campus like building locations. Some buildings have multiple names so I'm not sure how I handle that yet though.

## 8th March, 2018

Another meeting with Gareth today and I brought in my pc to show him what I have done so far. I mainly showed him LUIS and some of the code because there is limited working functionality at the moment. I also brought up my issue about the different names on the campus building and he suggested making a hashmap for everything. More work on the dublin bus functions too. I managed to get the callbacks to loop so that they loop through each json result and return the bus number and the arrival time.

## 17th March, 2018

Not much work done recently due to continuous assessment exams. I made the hashmap for the campus buildings and it seems to be working well. This brought up and issue though. I can't seem to be able to get entities to pass from LUIS to my bot so that I can use them as variables. Intents work fine so I don't know what's going on.

## 23rd March, 2018

I was supposed to have a meeting with Gareth today but I asked if we could reschedule it for Monday. I'm still stuck on that entity problem. Without the entities I wont be able to use any of the data that is sent in by the user. I'm using hardcoded variables for the moment so I can test that my functions are working.

## 26nd March, 2018

Meeting with Gareth today. I could not fix the entity issue so I moved on to other parts of the chat bot. I switch the intent recognizers in the bot from '.matches()' to 'bot.dialog'. This si specifically to allow for more conversation flow for the bot and will let the bot ask the user a question to tget additional information. I also took some time to improve the LUIS model. Before my language model was too shallow and didn't catch certain ways to ask questions. I have also started looking at the Facebook Graph API for getting DCU SU events.

## 5th April, 2018

Decided to start scraping the FAQs from the DCU website. After doing some research on scraping I come across something called Cheerio for Nodejs. It is a subset of jQuery that I can use to extract data from the HTML on web pages. I have it set up as a a loop the goes through every instance of the title of a question. I managed to get results back, however, it looks like I am getting the first answer back and then all of the questions after it but none of the other answers.

## 10th April, 2018

I have the FAQs for the freedom of information working now. I turns out that the HTML element s that I was using to loop as not unique for question titles so the data returns were out of sync so it would return the question and skip the answers. I decided against doing the other FAQ page becuase they would simply take too long to make. Each page has over 20 questions and each answer contains a completely seperate format of tables, bullet points and paragraphs. Now I need to figure out how to give the right user the right answers.

## 15th April, 2018

So I managed to make a hashmap of keywords for each question. I then have it set up so the hashmap is searched through and if that key word is in the user's input it will return the corresponding answer. I'll be moving on to Facebook events next.

## 18th April, 2018

It looks like at the start of this month the Facebook API had an update and now any app that wants to get data from events has to apply for an app review. This means I would have to prepare a submission and then wait up to two weeks to get approval. I don't have this time so I've decided to now attach my bot to Kik Messenger instead. I will also be scraping events off of the DCU SU website now instead.

## 23rd April, 2018

DCUSU events function done. Set it to scrape from Novemeber for demonstration purposes in case the upcoming events are removed. Moving on to timetables.

## 28th April, 2018

I've been having horrendous trouble with scraping from the DCU website. It seems like https://www101.dcu.ie is missing a first certificate and/or has an incomplete certificate chain. I also managed to fix the entity problem finally and have implemented the solution across my project. It appeared that the Bot Builder documentation was outdated and was recently updated with a solution. I have also made a json file to batch test the LUIS model in bulk.

I also realized today that I was so busy publishing to Azure that I forgot to push to git for weeks, however below is some proof that I have been publishing to Azure in that time. Also, these blogs were supposed to be done in markdown on git itself. It's going to be fun explaining this to my examiners.

## 2nd May, 2018

I sent the ISS an email regarding accessing the timetable website but they assured me that nothing is wrong with their certificates. I ran an SSL test and it does look like there is a problem with there certificates after all.

I found out today that Gareth has not been filling in the meeting forms for my visits. I didn't realize I was supposed to be getting an email notification when he does it and I had not thought to check the dashboard becuase he said he was doing them. I have set up a meeting with him for tomorrow to update him on my project progress and sort the meeting forms out.

## 3rd May, 2018

Met with Gareth today and showed him my project progress. I also connected my bot to Kik messenger so now I can use it on my phone. I Also found a solution to the  timetable site issue, I can set 'strictSSL' to false so it ignores the certificate error.

## 11th May, 2018

Got the timetables to correctly scrape. It took me forever to figure out. The times for the lectures are on a separate table, so it then needs to count how many time slots there are before the lecture and checks that it has reached the top of the table, then moves up to the time table, and then counts that many across.

A major issue with scraping timetables is that days with 2 lectures at the same time, the second row has no identifiable indicator as to when the timeslot count has reached the top of the table (Usually the day element is located there but is not present here). This means the count doesn’t know when to stop and as such the times cannot be obtained. 

I have also spent the last few days working through my project documentation. My user guide and user manual are almost complete.

## 18th May, 2018
Final exam is over. Now to spend the remainder of my time polishing up my bot and making sure everything is working and completing the documentation and testing.



