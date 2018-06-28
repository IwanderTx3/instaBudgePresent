

$(document).ready(function(){
   

    // delete item jQuery and Ajax
    $('.delete-expense').on('click', function(){
        let id = $(this).data('id');
        console.log(id)
        let url = '/deleteQuickExpense/'+id;
        if(confirm('Delete Expense?')){
            $.ajax({
                url: url,
                type: 'POST',
                
                success: function(result){
                    console.log('Deleting item...');
                    window.location.href='/quickexpense';
                },
                error: function(err){
                    console.log(err);
                }
            })
        }
    })
    // log item jQuery
    $('.log-expense').on('click', function(){
        $('#edit-form-listname').val($(this).data('shoppingListName'));
        $('#edit-form-itemname').val($(this).data('name'));
        $('#edit-form-qty').val($(this).data('qty'));
        $('#edit-form-id').val($(this).data('id'));
    })
})