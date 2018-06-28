if (req.session.user && req.cookies.user_sid) {
    console.log(req.session.user.id)
    let usernum = req.session.user.id
    console.log(usernum)
    Expense.sum('amount',{where:{userid : usernum} }).then(sum => {
     return sum;
    })

    Expense.findAll({where:{userid : usernum} }).then(allItems => {
                   return allItems;
     });
     res.render('tracking',{sum:sum,expenses: allItems});
 } else {
     res.redirect('/login');
 }