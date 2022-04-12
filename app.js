const express = require("express");
const bodyParser = require("body-parser");
const mongoose=require("mongoose");
const _=require("lodash");

const app = express();
app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb://localhost:27017/whattodoDB",{useNewUrlParser:true})

const itemsSchema={
    name:String,
  };
  
  const listSchema={
    name:String,
    items: []
  }
  const Item=mongoose.model("Item",itemsSchema);
  const List=mongoose.model("List",listSchema);




app.get("/", function(req,res){
    res.render("home");
})


app.get("/:parameter",function(req,res){
    const pageName=req.params.parameter;
    if(pageName==="mylists"){

        List.find({},function(err,results){
            res.render('mylists',{lists:results})
        });
    }
    else{
        res.render(pageName);
    }
    
})

app.get("/mylists/:parameter",function(req,res){
    const listName=req.params.parameter;
    List.findOne({name:listName},function(err,foundList){
    res.render('list',{listTitle:foundList.name , listItems:foundList.items});

    })

})



app.post("/",function(req,res){
    const nextPage=req.body.button
    res.redirect("/"+nextPage);
})

app.post("/newlist",function(req,res){
    const listTitle=req.body.listTitle;
    const listName=_.startCase(listTitle);
    List.findOne({name: listName },function(err,foundList){
        if(!err){
            if(foundList){
                res.render("list",{listTitle:foundList.name,listItems:foundList.items});
            }
            else{

                const itemsarr=[];
                const default1=req.body.default1;
                const default2=req.body.default2;
                const default3=req.body.default3;
                if(default1!=''){
                    itemsarr.push(new Item({name:default1}))
                }
                if(default2!=''){
                    itemsarr.push(new Item({name:default2}))
                }
                if(default3!=''){
                    itemsarr.push(new Item({name:default3}))
                }

                const newList=new List({
                    name:listName,
                    items:itemsarr
                })
                newList.save();
                res.redirect("/mylists/"+listName);

            }
        }

    })
    
   
    
})

app.post("/mylists",function(req,res) {
    const listName=req.body.list;
    res.redirect("/mylists/"+listName);
})

app.post("/list",function(req,res){
    const newItemName = req.body.newItem;
    const newDoc=new Item({
    name:newItemName
  })
  List.findOne({name:req.body.list},function(err,foundlist){
    foundlist.items.push(newDoc);
    foundlist.save();
    res.redirect("/mylists/"+req.body.list);
  })

})

app.post("/delete",function(req,res){
    const itemId=req.body.checkbox;
    const listName=req.body.listName;
    List.findOne({name:listName},function(err,foundList){
        foundList.items.forEach(function(item,index,object){

            if(item._id==itemId){
                object.splice(index,1);
            }    
        });
        foundList.save();
        res.redirect("/mylists/"+listName);
    })
  });

app.listen(3000, function() {
    console.log("Server started on port 3000");
  });
  