function autocomplete(input, latInput, lngInput) {
    if(!input) return; // skip line if there is no input on the page 
    const dropdown = new google.maps.places.Autocomplete(input);

    dropdown.addListener('place_changed', () =>{
        const place = dropdown.getPlace();
        latInput.value = place.geometry.location.lat();
        lngInput.value = place.geometry.location.lng();
    })
    // prevents submission of form when clicking 'enter' while on address input 
    input.on('keydown', (e) => {
        if (e.keyCode === 13) e.preventDefault();
    })
}

export default autocomplete;