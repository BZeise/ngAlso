$(document).ready(function() {
  $('#register').on('click', registerOwner);
  $('#addPet').on('click', petDetails);

  updateDropdown();
});

var petInfo = {};
var fullName = '';

function updateDropdown() {
  $.ajax({
    url: '/dropdown',
    type: 'GET',
    success: function(response){
      $('#ownerName').children().remove();
      console.log( 'got some DUROPODOWNOOOO: ', response);
      for (var i = 0; i < response.length; i++) {
        var ownFirst = response[i].owner_first;
        var ownLast = response[i].owner_last;
        var underscoreName = ownFirst + ownLast;
        fullName = ownFirst + ' ' + ownLast;
        console.log('full names are: ' + underscoreName + ', ' + fullName);
        var toAppend = "<option>" + fullName + "</option>";
        $('#ownerName').append(toAppend);
        petInfo.owner_fullname = fullName;
      } // end for loop
    } // end success
  }); //end ajax
};

function registerOwner() {
  console.log( 'in registerOwner on click' );
  var ownerName = {
    firstName: $('#firstName').val(),
    lastName: $('#lastName').val()
  };
  $.ajax({
    url: '/register',
    type: 'POST',
    data: ownerName,
    success: function( data ){
      console.log( 'got some koalas: ', data );
      updateDropdown();
    } // end success
  }); //end ajax
};

function addPetDB() {
  $.ajax({
    url: '/petStuff',
    type: 'POST',
    data: petInfo,
    success: function( data ) {
      console.log( 'succeded at addPetDB: ', data );
    } // end success
  }); //end ajax
}

function petDetails() {
  console.log( 'in petInfo on click' );
  console.log($('#ownerName').val());
  petInfo = {
    petName: $('#petName').val(),
    breed: $('#breed').val(),
    color: $('#color').val()
  };
  console.log(petInfo);
  addPetDB();
  $.ajax({
    url: '/details',
    type: 'POST',
    data: petInfo,
    success: function( data ){
      console.log( 'got some pets: ', data );
      //$('#pt').children().remove();
      for (var i = 0; i < data.length; i++) {
        var petsToPost = '<tr><td>' + data[i].owner_fullname + '</td>';
        petsToPost += '<td>' + data[i].pet_name + '</td>';
        petsToPost += '<td>' + data[i].pet_breed + '</td>';
        petsToPost += '<td>' + data[i].pet_color + '</td></tr>';
        $('#pt').append(petsToPost);
        console.log(petsToPost);
      }
    } // end success
  }); //end ajax
};

// current issues:
// "add pet" button and function removes entire pet info div
// "got some pets" returns empty object, problem maybe in SQL query?
