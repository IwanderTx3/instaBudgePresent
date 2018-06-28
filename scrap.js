let expenseCatList =[]

class ExpenseCat{
    constructor(title){
        this.title =title
        this.expenseitems =[]
    }
}

class ExpenseItem{

    constructor(title,amount,userid,islogged,category){
        this.title=title
        this.amount=amount
        this.userid=userid
        this.islogged=islogged
        this.category=category
    }
}

function fetchData(usernum) {
    let expenseCatList =[]
    let i = 0
//Expense.findAll({where:{userid : usernum} }).then(function(response){return response.json()}).then(function(json){
//    db.any('SELECT expenses.title, expenses.amount, expenses.userid, expenses.islogged, expenses.category, budgets.name FROM expenses join ON budgets.id=expenses.category  WHERE userid = $1',[usernum]) .then(function(results){
    Expense.findAll({where:{userid : usernum} }).then((results) =>{
		results.forEach(function (item) {
            i = i+1
            let existingstatment = item.category
//            console.log(existingstatment)
			if (expenseCatList.includes(existingstatment)) {
				let boom = new ExpenseItem(item.title,item.amount,item.userid,item.islogged,item.category)
                console.log(boom.title+' category '+boom.category+' is Existing')
//                console.log(existingstatment)
                existingstatment.expenseitems.push(boom)
//                console.log(existingstatment)
//                console.log(expenseCatList)
			} else {
                expenseCatList.push(existingstatment)
                let boom = new ExpenseItem(item.title,item.amount,item.userid,item.islogged,item.category)
                console.log(boom.title+' category '+boom.category+' is New')
                let newList = new ExpenseCat(item.category)
  //              console.log(boom.title,boom.category)
//                newList.push(boom)
//                expenseCatList.push(newList)
            }
        })
        console.log(expenseCatList)
		//callback(expenseCatList)
	})
}