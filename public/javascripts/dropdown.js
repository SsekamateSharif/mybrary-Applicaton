// we implement our dropdown menu for our borrowers action from here
// we get our buttons from there HTML files and store them in a variable in js 
const dropdownbtn = document.querySelector('.dropdown-btn');
const menulist = document.querySelector('.menu');

// we add an event listener to our dropdown button when clicked 
dropdownbtn.addEventListener('click', () =>{
    // we create the function that runs when that button is clicked 
    if(menulist.style.display === 'none'){
        menulist.style.display = 'flex';
    }else{
        menulist.style.display = 'none';
    }
});