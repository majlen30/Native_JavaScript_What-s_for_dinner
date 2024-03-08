const queryParameter = window.location.search,
  idKey = new URLSearchParams(queryParameter),
  id = idKey.get('id')

createRecipe(id)

// ======================================================================================================================
// Funktion för att skapa valt recept -----------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------------------------------------
function createRecipe(id) {
  fetch('https://www.themealdb.com/api/json/v1/1/lookup.php?i=' + id)
    .then((response) => response.json())
    .then((result) => {
      const recipe = result.meals[0],
        h2 = document.querySelector('h2'),
        img = document.querySelector('img'),
        ul = document.querySelector('ul'),
        p = document.querySelector('p'),
        title = document.createTextNode(recipe.strMeal),
        instructions = document.createTextNode(recipe.strInstructions)

      h2.appendChild(title)
      p.appendChild(instructions)
      img.setAttribute('src', recipe.strMealThumb)

      // -----------------------------------------------------------------------
      // Loop som tar fram alla nycklar som heter strIngridient & strMeasure
      ingridient = []
      measure = []

      for (let property in recipe) {
        if (property.startsWith('strIngredient')) {
          ingridient.push(property)
        }
        if (property.startsWith('strMeasure')) {
          measure.push(property)
        }
      }

      // -----------------------------------------------------------------------
      // Loop som filtrerar alla aktiva nycklar
      let active = []

      for (let i = 0; i < ingridient.length; i++) {
        if (recipe[ingridient[i]] !== null && recipe[ingridient[i]] !== '') {
          active.push(recipe[measure[i]] + ' ' + recipe[ingridient[i]])
        }
      }

      // -----------------------------------------------------------------------
      // Loop som fördelar alla sammansatta ingredienser i li-element
      for (let j = 0; j < active.length; j++) {
        let completeIngridient = document.createTextNode(active[j]),
          li = document.createElement('li')
        ul.appendChild(li)
        li.appendChild(completeIngridient)
      }
    })
}
