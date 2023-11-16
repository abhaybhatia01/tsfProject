if(process.env.NODE_ENV !=="production"){
  require('dotenv').config()
 
}


const createError = require('http-errors');
const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
var methodOverride = require('method-override')
const logger = require('morgan');


const cookieParser = require('cookie-parser');

const Customer= require('./models/customer')
const Transaction= require('./models/transaction')

const app = express();


const dbUrl = process.env.DB_URL || 'mongodb://localhost:27017/bankdb' ;
mongoose.connect(dbUrl,{
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('Database Connected'))
.catch(error => console.log(error.message)); 

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(methodOverride('_method'));
app.use(express.urlencoded({extended: true}));
app.use(express.json());
app.use(cookieParser());
app.use(express.static(path.join(__dirname,"public")))

app.get('/', function(req, res) {
  res.render('home');
});

app.get('/customers', async (req, res)=> {
  const customers = await Customer.find({});
  res.render('index',{customers});
});

app.get('/customers/:id',async(req,res)=>{
  const customer = await Customer.findById(req.params.id);
  const customers = await Customer.find({});
  console.log(customer); 
  res.render('to',{customer,customers});
});


app.get("/customers/:id1/:id2", async(req, res) =>{
  const {id1, id2} = req.params;
  const fromCustomer = await Customer.findById(id1);
  const toCustomer = await Customer.findById(id2);
  res.render("selectAmount", {fromCustomer, toCustomer});
});



app.put("/customers/:id1/:id2", async(req, res) =>{
  const {id1, id2} = req.params;
  const sendAmount = parseInt(req.body.sendAmount);
  const fromCustomer = await Customer.findById(id1);
  const toCustomer = await Customer.findById(id2);

  if(sendAmount <= fromCustomer.balance){
      if(sendAmount > 0){
        let frombalanceNew = fromCustomer.balance - sendAmount;
        let tobalanceNew = parseInt(toCustomer.balance + sendAmount);
        await Customer.findByIdAndUpdate(id1, {balance : frombalanceNew}, 
          { runValidators: true, new: true });
        await Customer.findByIdAndUpdate(id2, {balance : tobalanceNew}, 
            {  new: true });
            let newTransaction = new Transaction();
            newTransaction.fromName = fromCustomer.name;
            newTransaction.toName = toCustomer.name;
            newTransaction.transferAmount = sendAmount;
            await newTransaction.save();
            res.redirect("/customers");
          }
          else{
            res.render('error');
        }
    }
  else{
      res.render('error');
  }
});


app.get("/history", async(req, res)=>{
  const transactions = await Transaction.find({});
  res.render("history", {transactions});
});


app.listen(process.env.PORT || 3000,()=>{
	console.log('up and running');
   });

   module.exports = app;