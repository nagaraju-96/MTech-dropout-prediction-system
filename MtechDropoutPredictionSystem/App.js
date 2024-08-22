var express =require('express');
var bodyParser = require('body-parser');
var app = express();
const DecisionTree = require('./decision-tree');

app.use(express.urlencoded({extended: true}));
app.use(express.json())


const trainingData = [
        {income:  '>=100000', marks:'<65', completed:'No'},
        {income:  '<100000', marks:'<65', completed:'No'},
        {income:  '>100000', marks:'<65', completed:'No'},
        {income:  '>=100000', marks:'<65',completed:'No'},
        {income:  '<100000', marks:'>=65', completed:'No'},
        {income:  '<100000', marks:'>=65', completed:'No'},
        {income:  '<100000', marks:'>=65',completed:'Yes'},
        {income:  '<100000', marks:'>=65',completed:'Yes'},
        {income:  '<100000', marks:'>=65',completed:'Yes'},
        {income:  '<100000', marks:'>=65',completed:'Yes'},
        {income:  '<100000', marks:'>=65',completed:'No'},
        {income:  '<100000', marks:'>=65',completed:'No'},  
        {income:  '>=100000', marks:'>=65',completed:'Yes'},
        {income:  '>=100000', marks:'>=65',completed:'Yes'},
        {income:  '>=100000', marks:'>=65',completed:'Yes'},
        {income:  '>=100000', marks:'>=65',completed:'Yes'},
        {income:  '>=100000', marks:'>=65',completed:'Yes'},
        {income:  '>=100000', marks:'>=65',completed:'Yes'},
        {income:  '>=100000', marks:'>=65',completed:'Yes'},
        {income:  '>=100000', marks:'>=65',completed:'Yes'},
        {income:  '>=100000', marks:'>=65', completed:'Yes'},
        {income:  '>=100000', marks:'<65', completed:'Yes'},
        {income:  '<100000', marks:'<65', completed:'No'},
        {income:  '>100000', marks:'<65', completed:'Yes'},
        {income:  '>=100000', marks:'<65',completed:'No'},        
        {income:  '<100000', marks:'>=65', completed:'Yes'},
        {income:  '<100000', marks:'>=65', completed:'Yes'},
        {income:  '<100000', marks:'>=65',completed:'Yes'},
        {income:  '<100000', marks:'>=65',completed:'No'},
        {income:  '<100000', marks:'>=65',completed:'No'},
        {income:  '<100000', marks:'>=65',completed:'No'},
        {income:  '<100000', marks:'>=65',completed:'No'},       
        {income:  '>=100000', marks:'>=65',completed:'Yes'},
        {income:  '>=100000', marks:'>=65',completed:'No'},
        {income:  '>=100000', marks:'>=65',completed:'Yes'},
        {income:  '>=100000', marks:'>=65',completed:'Yes'},
        {income:  '>=100000', marks:'>=65',completed:'Yes'},
        {income:  '>=100000', marks:'>=65',completed:'Yes'},
        {income:  '>=100000', marks:'>=65',completed:'Yes'},
        {income:  '>=100000', marks:'>=65',completed:'No'},
        {income:  '>=100000', marks:'>=65', completed:'Yes'},
        {income:  '>=100000', marks:'<65', completed:'No'},
        {income:  '<100000', marks:'<65', completed:'No'},
        {income:  '>100000', marks:'<65', completed:'No'},
        {income:  '>=100000', marks:'<65',completed:'No'},
        {income:  '<100000', marks:'>=65', completed:'No'},
        {income:  '<100000', marks:'>=65', completed:'No'},
        {income:  '<100000', marks:'>=65',completed:'Yes'},
        {income:  '<100000', marks:'>=65',completed:'Yes'},
        {income:  '<100000', marks:'>=65',completed:'Yes'},
        {income:  '<100000', marks:'>=65',completed:'Yes'},
        {income:  '<100000', marks:'>=65',completed:'No'},
        {income:  '<100000', marks:'>=65',completed:'No'},  
        {income:  '>=100000', marks:'>=65',completed:'Yes'},
        {income:  '>=100000', marks:'>=65',completed:'Yes'},
        {income:  '>=100000', marks:'>=65',completed:'Yes'},
        {income:  '>=100000', marks:'>=65',completed:'Yes'},
        {income:  '>=100000', marks:'>=65',completed:'Yes'},
        {income:  '>=100000', marks:'>=65',completed:'Yes'},
        {income:  '>=100000', marks:'>=65',completed:'Yes'},
        {income:  '>=100000', marks:'>=65',completed:'Yes'},
        {income:  '>=100000', marks:'>=65', completed:'Yes'},
        {income:  '>=100000', marks:'<65', completed:'Yes'},
        {income:  '<100000', marks:'<65', completed:'No'},
        {income:  '>100000', marks:'<65', completed:'Yes'},
        {income:  '>=100000', marks:'<65',completed:'No'},        
        {income:  '<100000', marks:'>=65', completed:'Yes'},
        {income:  '<100000', marks:'>=65', completed:'Yes'},
        {income:  '<100000', marks:'>=65',completed:'Yes'},
        {income:  '<100000', marks:'>=65',completed:'No'},
        {income:  '<100000', marks:'>=65',completed:'No'},
        {income:  '<100000', marks:'>=65',completed:'No'},
        {income:  '<100000', marks:'>=65',completed:'No'},       
        {income:  '>=100000', marks:'>=65',completed:'Yes'},
        {income:  '>=100000', marks:'>=65',completed:'No'},
        {income:  '>=100000', marks:'>=65',completed:'Yes'},
        {income:  '>=100000', marks:'>=65',completed:'Yes'},
        {income:  '>=100000', marks:'>=65',completed:'Yes'},
        {income:  '>=100000', marks:'>=65',completed:'Yes'},
        {income:  '>=100000', marks:'>=65',completed:'Yes'},
        {income:  '>=100000', marks:'>=65',completed:'No'},
        {income:  '>=100000', marks:'>=65', completed:'Yes'}
        ]

        const model = new DecisionTree('completed', ['marks', 'income'], trainingData);
        console.log('Generated decision tree:')
        // prints the generated tree
        model.printTree()

        app.set('view engine','ejs'); 

        app.get('/', function(req,res){
        res.render('home');
}); 

        app.post('/home', function(req,res){
        var res1;
        var reason;
         // make a new prediction
         if(parseInt(req.body.marks)>=65){
                if(parseInt(req.body.income)>=100000){
                        res1=model.classify({marks: '>=65', income:'>=100000'});
                        reason="N/A";
                }
                else{
                        res1=model.classify({marks: '>=65', income:'<100000'});
                        reason="You have low mount of Income. If you joins the college with this income, then it is very much difficult for you to complete your course.";
                }
         }
         else{
                if(parseInt(req.body.income)>=100000){
                        res1=model.classify({marks: '<65', income:'>=100000'});
                        reason="Low B.Tech marks in that domain,It is difficult for you to get success in that domain.";
                        
                }
                else{
                        res1=model.classify({marks: '<65', income:'<100000'});
                        reason="Low B.Tech marks as well as low income. So, it is difficult for you to get success in that domain.";
                }
                
         }

         var v=JSON. stringify(res1);
         var v1;
         var accuracy;
         var drop;
         if(v.includes("Yes")){
                v1=v.slice(2,4);
                if(v1==="No"){
                        var accuracy=v.slice(7,9);
                        drop="You have "+accuracy+"% chance for dropout."
                }
                else{
                       var  v2=(parseInt(v.slice(8,10)))
                        accuracy=String(100-v2);
                        drop="You have "+accuracy+"% chance for dropout."
                }
        }
        else{
                v1=v.slice(2,4);
                accuracy=v.slice(7,10);
                drop="You have "+accuracy+"% chance for dropout."
        }

        console.log("given Domain:"+req.body.domain+", with BTech marks: "+req.body.marks+", with the income of "+req.body.income)
        console.log(drop+"\n")
        res.render('dahsboard',{name1:req.body.name, marks:req.body.marks, domain:req.body.domain, income: req.body.income,drop:drop, reason:reason});
}); 
      
     
app.listen(3000);
console.log('Server Started listening on 3000');
