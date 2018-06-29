$(document).ready(function () {

    // delete item jQuery and Ajax
    $('.delete-expense').on('click', function () {
        let id = $(this).data('id');
 //       console.log(id)
        let url = '/deleteExpense/' + id;
        if (confirm('Delete Expense?')) {
            $.ajax({
                url: url,
                type: 'POST',

                success: function (result) {
                    console.log('Deleting item...');
                    window.location.href = '/tracking';
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
    
    
    })
})