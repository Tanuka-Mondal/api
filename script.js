$(document).ready(function () {

    // Denotes total number of rows 
    var rowIdx = 0;

    // jQuery button click event to add a row 
    $('#addBtn').on('click', function () {

        // Adding a row inside the tbody. 
        $('#tbody').append(`<tr id="R${++rowIdx}"> 
    <td class="row-index text-center"> 
    <p>${rowIdx}</p> 
    </td> 
    <td><input type="text" class="form-control" placeholder="Item"></td>
    <td><input type="number" class="form-control qty" placeholder="Qty" oninput="calculateAmount(this)"></td>
    <td><input type="number" class="form-control rate" placeholder="Rate" oninput="calculateAmount(this)"></td>
    <td><input type="text" class="form-control amt" readonly></td>
    <td class="text-center"> 
        <button class="btn btn-danger remove"
        type="button">x</button> 
        </td> 
    </tr>`);
    });

    // jQuery button click event to remove a row. 
    $('#tbody').on('click', '.remove', function () {

        // Getting all the rows next to the row 
        // containing the clicked button 
        var child = $(this).closest('tr').nextAll();

        // Iterating across all the rows 
        // obtained to change the index 
        child.each(function () {

            // Getting <tr> id. 
            var id = $(this).attr('id');

            // Getting the <p> inside the .row-index class. 
            var idx = $(this).children('.row-index').children('p');

            // Gets the row number from <tr> id. 
            var dig = parseInt(id.substring(1));

            // Modifying row index. 
            idx.html(`${dig - 1}`);

            // Modifying row id. 
            $(this).attr('id', `R${dig - 1}`);
        });

        // Removing the current row. 
        $(this).closest('tr').remove();

        // Decreasing total number of rows by 1. 
        rowIdx--;

        updateTotalAmount();
        updateGST();
        updateNetAmount();
    });

    // Add event listener to GST percentage input field
    $('#gst-field').on('input', function () {
        // Update the GST and Net Amount fields
        updateGST();
        updateNetAmount();
    });

    // Function to calculate the amount based on qty and rate
    window.calculateAmount = function (element) {
        var row = element.closest('tr');
        var qty = row.querySelector('.qty').value;
        var rate = row.querySelector('.rate').value;
        var amt = qty * rate;

        // Set the calculated amount in the corresponding field
        row.querySelector('.amt').value = isNaN(amt) ? '' : amt.toFixed(2);

        // Update the total amount
        updateTotalAmount();
        updateGST();
        updateNetAmount();
    };

    // Function to update the total amount
    function updateTotalAmount() {
        var totalAmt = 0;

        // Loop through each row and sum the amounts
        $('#tbody tr').each(function () {
            var amt = parseFloat($(this).find('.amt').val()) || 0;
            totalAmt += amt;
        });

        // Update the total field
        $('.total-field').val(totalAmt.toFixed(2));
    }

    // Function to update the GST amount
    function updateGST() {
        var totalAmt = parseFloat($('.total-field').val()) || 0;
        var gstPercentage = parseFloat($('#gst-field').val()) || 0;

        // Calculate the GST amount
        var gstAmt = (gstPercentage / 100) * totalAmt;

        // Update the GST field
        $('.gst-field').val(gstAmt.toFixed(2));

        updateNetAmount();
    }

    // Function to update the Net Amount
    function updateNetAmount() {
        var totalAmt = parseFloat($('.total-field').val()) || 0;
        var gstAmt = parseFloat($('.gst-field').val()) || 0;

        // Calculate the Net Amount
        var netAmt = totalAmt + gstAmt;

        // Update the Net Amount field
        $('.vertical-fields .net-amt-field').val(netAmt.toFixed(2));
    }

    // Function to handle form submission
    $('#bt-submit').on('click', function () {
        // Prepare form data
        var formData = {
            // Add all form fields here
            Customer: $('#customer').val(),
            InvoiceNo: $('#invoiceNo').val(),
            Address: $('#address').val(),
            Date: $('#date').val(),
            City: $('#city').val(),
            GST: $('#gst-field').val(),
            Items: getItemsData() // Implement this function to get item data
        };

        // Send data to Google Apps Script web app
        $.ajax({
            url: 'https://script.google.com/macros/s/AKfycby0GvCdDqdYqxlcOedQm2wSaFduHZs0vwtr1Q-D8NnuTMw59QiCCyAQTs47jQeD4OYrvA/exec',
            method: 'POST',
            contentType: 'application/json',
            data: JSON.stringify(formData),
            success: function (response) {
                console.log(response);
                // Optionally, you can redirect or show a success message
            },
            error: function (error) {
                console.error(error);
                // Handle error
            }
        });
    });

    function getItemsData() {
        var itemsData = [];
        $('#items-table tbody tr').each(function (index, row) {
            var itemData = {
                Item: $(row).find('td:nth-child(2) input').val(),
                Qty: $(row).find('td:nth-child(3) input').val(),
                Rate: $(row).find('td:nth-child(4) input').val(),
                Amt: $(row).find('td:nth-child(5) input').val()
            };
            itemsData.push(itemData);
        });
        return itemsData;
    }

}); 