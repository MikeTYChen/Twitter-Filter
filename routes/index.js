var express = require('express');
var Twit = require('twit')
var mongoose = require('mongoose');
var collection = require('../models/tweets-model');

var T = new Twit({
    consumer_key:         'fwhE8JLonlV8nrwaPNAI5SWkq'
  , consumer_secret:      '1f3oGrByXOQndvI9yXzwJBs3Cmt2pCHSYypQmmVH7usac5cxrZ'
  , access_token:         '2287629186-ADeaPjzMsltSFeacMJsx3XaMxpi3JshbZ50PFti'
  , access_token_secret:  'JTnMKHNw2L2X58uMD20hTmO9d5fKW6kXrxaQFafV7jxeE'
})



//
//  search twitter for all tweets containing the word 'banana' since Nov. 11, 2011
//



/* GET Userlist page. */

exports.home= function(req, res) {
        
    collection.find({},{},function(e,docs){
        if (docs!= ""){
        sortedDoc=new Array();        
        var smallest=docs[0]['_id'];
        var smallestInd=0;
        var count=0;
        var length=docs.length-1;
        while(count<length){

            count+=1;
            var smallest=docs[0]['_id'];
            var smallestInd=0;
            for (z=1;z<docs.length;z++){
                if(docs[z]['_id']<smallest){
                    smallest=docs[z]['_id'];
                    smallestInd=z;
                }
            }
            sortedDoc.push(docs[smallestInd]);
            //console.log(docs[smallestInd]['date']);
            if (smallestInd > -1) {
                 docs.splice(smallestInd, 1);
            }
        };
        sortedDoc.push(docs[0]);
            res.render('userlist', {
            "userlist" : sortedDoc
        });
        }else{
            res.render('userlist', {
            "userlist" : docs
        });
        }
        
    });
};


/* POST to Add User Service */
exports.adduser= function(req, res) {
    var twit_screenName=req.body.screenName;
    if (twit_screenName=="" ||twit_screenName==undefined){
        twit_screenName="epicatnu";
    }
    console.log(twit_screenName);
    // Set our internal DB variable
    collection.remove({}, function(err) { 
       console.log('collection removed') 
    });
    var message='';
    var message='';
    var date='';           
    var retweet=0;
    var favorite=0;

    // Set our collection
    var data='';
    var tweetsAdded=0;
    var check=0;
    T.get('statuses/user_timeline', { screen_name:twit_screenName, count:500 }, function(err, data, response) {
        var check=0;
        var creator="";
        for(var i=0;i<data.length;i++){
            creator="@"+data[i]['user']['screen_name'];
            if(data[i].hasOwnProperty('retweeted_status')){
                message='RT '+data[i]['retweeted_status']['text'];
                RTmessage=data[i]['text'];
                date=data[i]['retweeted_status']['created_at'];
                creator+=" ";
                creator+=RTmessage.split(":")[0]
            }else{
                message=data[i]['text'];
                date=data[i]['created_at'];
            }
            console.log(date);
            dateObj=new Date(Date.parse(date.replace(/( +)/, ' UTC$1')));
            upperMessage=message.split('&amp;');
            messageM='';
                for (z=0;z<upperMessage.length;z++){
                    if(z>0){
                        messageM+="&";
                        messageM+=upperMessage[z];
                    }
                    messageM+=upperMessage[z];
                }
            message=messageM;  
            retweet=data[i]['retweet_count'];  
            favorite=data[i]['favorite_count'];
            var filterS="";
            var filterL="";
            var filterD="";
            dateFilter=dateObj.toString().split(" ");
            date=dateFilter[0];
            for (z=1;z<5;z++){
                if(z==4){
                    AMPM=dateFilter[z].split(":");
                    time='';
                    zone=" AM";
                    hourInt=parseInt(AMPM[0]);
                    if(hourInt>=12){
                        hourInt-=12;
                        if (hourInt==0){
                            hourInt=12;
                        }
                        time+=hourInt.toString();
                        zone=" PM";
                    }else{
                        hourInt=parseInt(AMPM[0]);
                        if (hourInt==0){
                            hourInt=12;
                        }
                        time+=AMPM[0];
                    }
                    for (yy=1;yy<3;yy++){
                        time+=":";
                        time+=AMPM[yy];
                    }
                    time+=zone;
                    date+=" ";
                    date+=time;
                }
                else{
                    date+=" ";
                    date+=dateFilter[z];  
                }
                
            }
            //FILTERS
            var textFilter=req.body.filterString;
            if(textFilter==""){
                textFilter=" ";
                filterS+="Text: N/A";
            }else{
                filterS+="Text: "+textFilter.toLowerCase()+"";
            }
            textFilter=textFilter.toLowerCase();
            var linkFilter=req.body.filterLink;
            if(linkFilter==undefined){
                linkFilter="";
                filterL+=" Link: N/A"
            }else{
                filterL+=" Link: Links Only"
            }
            var startFilter=req.body.startDate;
            var endFilter=req.body.endDate;

            lowerMessage=message.toLowerCase();
            if (startFilter==" "){
                filterD+=" Date: N/A";
                console.log('no date filter');
                if(lowerMessage.indexOf(textFilter)>-1 && lowerMessage.indexOf(linkFilter)>-1){
                tweetsAdded++;
                console.log("ADDING");
                console.log(date);
                console.log(twit_screenName);
                var newTweet = new collection({
                    screenName:twit_screenName,
                    filterS:filterS,
                    filterL:filterL,
                    filterD:filterD,
                    message : message,
                    creator:creator,
                    date : date,
                    retweet:retweet,
                    favorite:favorite
                });
                newTweet.save(function(err, doc){
                if(err){
                    console.log('Problem adding contact')
                    res.send('fail');
                    console.log(err);
                }
                else{
                    console.log('Added new contact successfully');
                    res.send('success');
                    console.log(doc);
                }
            });
            };
            }else{
                startFilter=new Date(Date.parse(startFilter.replace(/( +)/, ' UTC$1')));
                endFilter=new Date(Date.parse(endFilter.replace(/( +)/, ' UTC$1')));
                startMonth=parseInt(startFilter.getMonth())+1;
                endMonth=parseInt(endFilter.getMonth())+1;
                filterD+=" Date: "+startMonth.toString()+"/"+startFilter.getDate()+"/"+startFilter.getFullYear()+" - "+startMonth.toString()+"/"+endFilter.getDate()+"/"+endFilter.getFullYear();
                if(dateObj>=startFilter&&dateObj<=endFilter){
                    console.log('Date Filtering');
                    if(lowerMessage.indexOf(textFilter)>-1 && lowerMessage.indexOf(linkFilter)>-1){
                    console.log("WITHIN");
                tweetsAdded++;
                console.log("ADDING");
                console.log(date);
             
                var newTweet = new collection({
                    screenName:twit_screenName,
                    filterS:filterS,
                    filterL:filterL,
                    filterD:filterD,
                    message : message,
                    creator:creator,
                    date : date,
                    retweet:retweet,
                    favorite:favorite
                });
                newTweet.save(function(err, doc){
                if(err){
                    console.log('Problem adding contact')
                    res.send('fail');
                    console.log(doc);
                }
                else{
                    console.log('Added new contact successfully');
                    res.send('success');
                    console.log(doc);
                }
            });


             };
                }else{
                    console.log("OUTSIDE");
                }
            }
            check=1;
            //console.log(message+"\n"+date+"\n"+creator+"\n\n")
        };
        if (tweetsAdded==0 && check==1){
            console.log("NONE");

            var newTweet = new collection({
                    screenName:twit_screenName,
                    filterS:filterS,
                    filterL:filterL,
                    filterD:filterD,
                    message : "NO TWEETS APPLY TO THIS FILTER",
                    creator:twit_screenName,
                    date : " ",
                    retweet:retweet,
                    favorite:favorite
                });
                newTweet.save(function(err, doc){
                if(err){
                    console.log('Problem adding contact')
                    res.send('fail');
                    console.log(doc);
                }
                else{
                    console.log('Added new contact successfully');
                    res.send('success');
                    console.log(doc);
                }
            });
                
             }
             console.log("SDF");
             console.log(twit_screenName);
        // If it worked, set the header so the address bar doesn't still say /adduser
            res.location("/");
            // And forward to success page
            res.redirect("/");
    })
};