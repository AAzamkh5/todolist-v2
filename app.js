//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ =require("lodash");
const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect('mongodb+srv://admin-khan:azam-123@cluster0-w39ap.mongodb.net/todolistDB', { useUnifiedTopology: true });

const itemsSchema = {
  name : String
};

const Item =mongoose.model ("Item",itemsSchema);

const item1 = new Item ({ name : "welcome to your todolist" });
const item2 = new Item ({ name : "hit this button to delete" });
const item3 = new Item ({ name : "hit this + button to add in item" });

const defaultItems =[item1,item2,item3];


const listSchema ={
  name:String,
  items:[itemsSchema]
};

const List =mongoose.model("List",listSchema);

//home get ..............>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>

app.get("/", function(req, res) {

  Item.find({},function(err,foundItems){

      if(foundItems.length=== 0){
        Item.insertMany(defaultItems,function(err){
          if(err){
            console.log(err);
          } else {console.log("successfully added items");
          }
        });
        res.redirect("/");
        } else {
      res.render("list", {listTitle: "today", newListItems: foundItems});

  }
});
});

//dynamic get ....................>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>


app.get("/:dynamicListTitle", function(req,res) {

  const dynamicListTitle=_.capitalize(req.params.dynamicListTitle);

List.findOne({name:dynamicListTitle},function(err,foundList){

  if(!err){
    if(!foundList){
      // creat new list page where we can add new item.
      const list = new List ({
        name:dynamicListTitle,
        items:defaultItems
      });
    list.save();
    res.redirect("/" + dynamicListTitle);
    } else{
        //existing list which already has made by user
        res.render("list", {listTitle:foundList.name, newListItems: foundList.items});
      }
   }
});
});
// post............>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>

app.post("/delete",function(req,res){
  const checkedItemId=req.body.checkbox;
  const listName = req.body.listName;

  if(listName==="today"){
    Item.findByIdAndRemove(checkedItemId,function(err){
      if(!err){console.log("successfully deleted");}
      res.redirect("/");

    });
  } else {
    List.findOneAndUpdate({name:listName},{$pull:{items:{_id:checkedItemId}}},function(err,foundList){
if(!err){
  res.redirect("/"+listName);
        }
});
}
});

//post route for everyother page that user type localhost:3000/<----> here
app.post("/", function(req, res){

  const itemName = _.startCase(req.body.newItem);
  const listName = req.body.list;
  const item = new Item ({
    name:itemName
  });

  if(listName==="today"){
    item.save();
    res.redirect("/");
  } else {

    List.findOne({name:listName},function(err,foundList){
      foundList.items.push(item);
      foundList.save();
      res.redirect("/" + listName);
    });
  }




});




app.listen(3000, function() {
  console.log("Server started on port 3000");
});
