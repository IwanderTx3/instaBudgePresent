$(document).ready(function () {

    // delete item jQuery and Ajax
    $('.delete-expense').on('click', function () {
        alert("It works")
        let id = $(this).data('id');
        console.log(id)
        let url = '/deleteQuickExpense/' + id;
        if (confirm('Delete Expense?')) {
            $.ajax({
                url: url,
                type: 'POST',

                success: function (result) {
                    console.log('Deleting item...');
                    window.location.href = '/quickexpense';
                },
                error: function (err) {
                    console.log(err);
                }
            })
        }
    })
    // log item jQuery
    $('.log-expense').on('click', function () {
        $('#quickExpenseTitle').val($(this).data('title'));
        $('#quickExpenseAmount').val($(this).data('amount'));
        $('#expenseid').val($(this).data('id'));
        $('#budgetCategory').val($(this).data('id'));
    
    })
})