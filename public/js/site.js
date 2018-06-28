

$(document).ready(function(){
   

    // delete expense jQuery and Ajax
    $('.delete-expense').on('click', function(){
        let id = $(this).data('id');
        let url = '/deleteQuickExpense/'+id;
        if(confirm('Delete Expense?')){
             console.log('woo-hoo')
            $.ajax({
                url: url,
                type: 'GET',
                
                success: function(result){
                    console.log('Deleting item...');
                    window.location.href='/';
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