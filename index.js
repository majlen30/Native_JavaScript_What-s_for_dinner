const searchText = document.querySelector('#searchInput'),
  clickButton = document.querySelector('#button')

let x = null

checkboxCategories()
generateCategory()
searchHistory()

document.addEventListener('keydown', onEnter)
clickButton.addEventListener('click', onClick)

// ======================================================================================================================
// Funktioner för addEventListener --------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------------------------------------
function onEnter() {
  if (event.key === 'Enter' && searchText.value !== '') {
    document.querySelector('#searchRecipeResult').innerHTML = ''
    searchRecipe(searchText.value)
    statistics()
  }
}

function onClick() {
  if (searchText.value !== '') {
    document.querySelector('#searchRecipeResult').innerHTML = ''
    searchRecipe(searchText.value)
    statistics()
  }
}

// ======================================================================================================================
// Funktion för att generera kategorierna för kryssrutorna i sökfältet --------------------------------------------------
// ----------------------------------------------------------------------------------------------------------------------
function checkboxCategories() {
  fetch('https://www.themealdb.com/api/json/v1/1/list.php?c=list')
    .then((response) => response.json())
    .then((result) => {
      const fieldset = document.querySelector('fieldset'),
        label = document.createElement('label'),
        title = document.createTextNode('Categories: '),
        div = document.createElement('div')

      div.setAttribute('id', 'checkboxes')
      // label.setAttribute('for', 'categories')
      label.appendChild(title)
      fieldset.appendChild(label)
      fieldset.appendChild(div)

      for (let i = 0; i < result.meals.length; i++) {
        let category = result.meals[i].strCategory,
          span = document.createElement('span'),
          input = document.createElement('input'),
          categoryName = document.createTextNode(category)
        div.appendChild(span)
        input.setAttribute('name', 'category')
        input.setAttribute('type', 'checkbox')
        input.setAttribute('value', category)
        span.appendChild(categoryName)
        span.appendChild(input)
      }
    })
}

// ======================================================================================================================
// Funktion för sökresultat ---------------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------------------------------------
function searchRecipe(searchText) {
  fetch('https://www.themealdb.com/api/json/v1/1/search.php?s=' + searchText)
    .then((response) => response.json())
    .then((result) => {
      const searchRecipeResult = document.querySelector('#searchRecipeResult'),
        h2 = document.querySelector('#searchResult')

      h2.style.display = 'block'
      h2.innerHTML = ''

      // -----------------------------------------------------------------------
      // Gör chart synlig ------------------------------------------------------
      let myChart = document.querySelector('#chart')
      myChart.style.display = 'block'

      // -----------------------------------------------------------------------
      // Loop som kontrollerar om någon/några kryssrutor är ibockade och sparar dem i en array
      let checkboxes = document.querySelector('#checkboxes'),
        categoryBoxes = document.querySelectorAll('#checkboxes > span'),
        checkedCategories = []
      for (let i = 0; i < categoryBoxes.length; i++) {
        if (checkboxes.children[i].children[0].checked === true) {
          checkedCategories.push(checkboxes.children[i].children[0].value)
        }
      }

      // -----------------------------------------------------------------------------------------------------------------------
      // Om inga kryssrutor är ibockade körs denna -----------------------------
      if (checkedCategories.length === 0) {
        webStorage(searchText, result.meals)

        // ---------------------------------------------------------------------
        // Behandlar sökresultatet huruvida det finns ett resultat eller inte
        if (result.meals === null) {
          const p = document.createElement('p'),
            title = document.createTextNode(
              'Search result for ' + searchText + ' (0) results'
            ),
            errorText = document.createTextNode(
              'Unfortunately there is no result for your search. Try something else.'
            )

          h2.appendChild(title)
          searchRecipeResult.appendChild(p)
          p.appendChild(errorText)
        } else {
          const ul = document.createElement('ul'),
            title = document.createTextNode(
              'Search result for ' +
                searchText +
                ' (' +
                result.meals.length +
                ' results)'
            )
          h2.appendChild(title)
          searchRecipeResult.appendChild(ul)

          for (let i = 0; i < result.meals.length; i++) {
            let li = document.createElement('li')
            let a = document.createElement('a')
            let img = document.createElement('img')
            ul.appendChild(li)
            let name = document.createTextNode(result.meals[i].strMeal)
            img.setAttribute('src', result.meals[i].strMealThumb)
            a.setAttribute('href', 'recipe.html?id=' + result.meals[i].idMeal)
            li.appendChild(img)
            li.appendChild(a)
            a.appendChild(name)
          }
        }
        // ------------------------------------------------------------------------------------------------------------------------
        // Om kryssrutor är ibockade körs denna ----------------------------------
      } else {
        // ---------------------------------------------------------------------
        // Loop som tar fram sökresultatet för sökordet inom de valda kategorierna
        const checkedSearchResult = []
        for (let i = 0; i < checkedCategories.length; i++) {
          for (let j = 0; j < result.meals.length; j++) {
            if (checkedCategories[i] === result.meals[j].strCategory) {
              checkedSearchResult.push(result.meals[j].strMeal)
            }
          }
        }

        webStorage(
          searchText + ' (' + checkedCategories + ')',
          checkedSearchResult
        )

        // ---------------------------------------------------------------------
        // Behandlar sökresultatet huruvida det finns ett resultat eller inte
        if (checkedSearchResult === null) {
          const p = document.createElement('p'),
            title = document.createTextNode(
              'Search result for ' + searchText + ' (0) results'
            ),
            errorText = document.createTextNode(
              'Unfortunately there is no result for your search. Try something else.'
            )

          h2.appendChild(title)
          searchRecipeResult.appendChild(p)
          p.appendChild(errorText)
        } else {
          const ul = document.createElement('ul'),
            title = document.createTextNode(
              'Search result for ' +
                searchText +
                ' (' +
                checkedSearchResult.length +
                ' results)'
            )
          h2.appendChild(title)
          searchRecipeResult.appendChild(ul)

          for (let i = 0; i < checkedCategories.length; i++) {
            for (let j = 0; j < result.meals.length; j++) {
              if (checkedCategories[i] === result.meals[j].strCategory) {
                let li = document.createElement('li')
                let a = document.createElement('a')
                let img = document.createElement('img')
                ul.appendChild(li)
                let name = document.createTextNode(result.meals[j].strMeal)
                img.setAttribute('src', result.meals[j].strMealThumb)
                a.setAttribute(
                  'href',
                  'recipe.html?id=' + result.meals[j].idMeal
                )
                li.appendChild(img)
                li.appendChild(a)
                a.appendChild(name)
              }
            }
          }
        }
      }
      searchHistory()
      statistics()
    })
}

// ======================================================================================================================
// Funktion för sökhistorik ---------------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------------------------------------
function searchHistory() {
  document.querySelector('#searchHistory').innerHTML = ''
  const search = document.querySelector('#searchHistory'),
    h3 = document.createElement('h3'),
    ul = document.createElement('ul'),
    title = document.createTextNode('Previous searches:')

  search.appendChild(h3)
  search.appendChild(ul)
  h3.appendChild(title)

  // ---------------------------------------------------------------------------
  // Hämtar information från session-storage och lägger i lista ----------------
  let savedSearch = JSON.parse(sessionStorage.getItem('search'))
  if (sessionStorage.getItem('search') !== null) {
    search.style.display = 'block'

    for (let i = 0; i < savedSearch.length; i++) {
      let li = document.createElement('li')
      let text = document.createTextNode(savedSearch[i])
      ul.appendChild(li)
      li.appendChild(text)
    }
  }
}

// ======================================================================================================================
// Funktion för webStorage ----------------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------------------------------------
function webStorage(searchText, result) {
  // ---------------------------------------------------------------------------
  // Skapar session-storage om det inte finns ----------------------------------
  if (
    sessionStorage.getItem('search') === null &&
    sessionStorage.getItem('result') === null
  ) {
    sessionStorage.setItem('search', '[]')
    sessionStorage.setItem('result', '[]')
  }
  let savedSearch = JSON.parse(sessionStorage.getItem('search')),
    savedResult = JSON.parse(sessionStorage.getItem('result'))
  savedSearch.push(searchText)

  // ---------------------------------------------------------------------------
  // Placerar antal sökresultat från sökordet i session-storage ----------------
  if (result === null) {
    savedResult.push(0)
  } else {
    savedResult.push(result.length)
  }
  sessionStorage.setItem('search', JSON.stringify(savedSearch))
  sessionStorage.setItem('result', JSON.stringify(savedResult))

  // ---------------------------------------------------------------------------
  // När antalet sökresultat lagrats 5 gånger, ta bort det äldsta värdet -------
  if (
    JSON.parse(sessionStorage.getItem('search')).length > 5 &&
    JSON.parse(sessionStorage.getItem('result')).length > 5
  ) {
    savedSearch.shift()
    savedResult.shift()
    sessionStorage.setItem('search', JSON.stringify(savedSearch))
    sessionStorage.setItem('result', JSON.stringify(savedResult))
  }
}

// ======================================================================================================================
// Funktion för chart, statistik över hur många sökresultat man fick på sitt sökord -------------------------------------
// ----------------------------------------------------------------------------------------------------------------------
function statistics() {
  const ctx = document.getElementById('myChart')

  let savedSearch = JSON.parse(sessionStorage.getItem('search'))
  let savedResult = JSON.parse(sessionStorage.getItem('result'))

  if (x === null) {
    x = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: savedSearch,
        datasets: [
          {
            label: 'Number of Search results',
            data: savedResult,
            backgroundColor: ['#7fb069'],
            borderWidth: 1,
          },
        ],
      },
      options: {
        scales: {
          y: {
            beginAtZero: true,
          },
        },
      },
    })
  } else {
    for (let i = 0; i < savedResult.length; i++) {
      removeData(x)
    }
    for (let i = 0; i < savedResult.length; i++) {
      addData(x, savedSearch[i], savedResult[i])
    }
  }
}

function addData(chart, label, newData) {
  chart.data.labels.push(label)
  chart.data.datasets.forEach((dataset) => {
    dataset.data.push(newData)
  })
  chart.update()
}

function removeData(chart) {
  chart.data.labels.pop()
  chart.data.datasets.forEach((dataset) => {
    dataset.data.pop()
  })
  chart.update()
}

// ======================================================================================================================
// Funktion för att generera receptförslag inom vald kategori -----------------------------------------------------------
// ----------------------------------------------------------------------------------------------------------------------
function createRecipeSuggestions(category) {
  fetch('https://www.themealdb.com/api/json/v1/1/filter.php?c=' + category)
    .then((response) => response.json())
    .then((result) => {
      const recipeSuggestions = document.querySelector('#recipeSuggestions'),
        section = document.createElement('section'),
        h3 = document.createElement('h3'),
        ul = document.createElement('ul'),
        title = document.createTextNode(category)

      section.setAttribute('class', 'recipeList')
      recipeSuggestions.appendChild(section)
      section.appendChild(h3)
      h3.appendChild(title)
      section.appendChild(ul)

      // -----------------------------------------------------------------------
      // Loop som genererar 5 recept (om 5 recept finns tillgängliga) inom kategori
      for (let i = 0; i < 5 && result.meals[i] !== undefined; i++) {
        if (
          result.meals[i] !== undefined &&
          result.meals[i].strMeal !== undefined
        ) {
          let li = document.createElement('li')
          let a = document.createElement('a')
          let img = document.createElement('img')
          ul.appendChild(li)
          let name = document.createTextNode(result.meals[i].strMeal)
          img.setAttribute('src', result.meals[i].strMealThumb)
          a.setAttribute('href', 'recipe.html?id=' + result.meals[i].idMeal)
          li.appendChild(img)
          li.appendChild(a)
          a.appendChild(name)
        }
      }
    })
}

// ======================================================================================================================
// Funktion för att slumpa fram kategori och kallar på createRecipeSuggestions 3 gånger ---------------------------------
// ----------------------------------------------------------------------------------------------------------------------
function generateCategory() {
  fetch('https://www.themealdb.com/api/json/v1/1/list.php?c=list')
    .then((response) => response.json())
    .then((result) => {
      // -----------------------------------------------------------------------
      // Loop som tar fram 3 slumpade kategorier och kontrollerar att inte
      // samma kategori kan väljas flera gånger --------------------------------
      let categories = []
      let generatedNumber = []

      while (categories.length < 3) {
        let randomNumber = Math.floor(Math.random() * result.meals.length)
        if (generatedNumber.includes(randomNumber) !== true) {
          generatedNumber.push(randomNumber)
          categories.push(result.meals[randomNumber].strCategory)
        }
      }

      // -----------------------------------------------------------------------
      // Loop som kallar på funktion 3 gånger och skickar med det slumpade värdet
      for (let i = 0; i < 3; i++) {
        createRecipeSuggestions(categories[i])
      }
    })
}
