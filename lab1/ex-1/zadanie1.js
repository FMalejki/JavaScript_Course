for(i = 0; i < 3; i++){
    txt = window.prompt("Text1","Text2");
    console.log("text: ",txt, "type of text: ", typeof(txt))
}

function funkcja_zwrotna(){
    const form = document.forms.form
    const pole_tekstowe = form.elements.pole_tekstowe.value
    const pole_liczbowe = form.elements.pole_liczbowe.value
    console.log("text: ", pole_tekstowe, "type: ", typeof(pole_tekstowe), "number: ", pole_liczbowe, "type: ", typeof(pole_liczbowe))
  }