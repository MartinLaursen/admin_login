// https://stackoverflow.com/questions/901115/how-can-i-get-query-string-values-in-javascript
function getParameterByName(name, url) {
      if (!url) url = window.location.href;
      name = name.replace(/[\[\]]/g, "\\$&");
      var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
            results = regex.exec(url);
      if (!results) return null;
      if (!results[2]) return '';
      return decodeURIComponent(results[2].replace(/\+/g, " "));
}



document.addEventListener("DOMContentLoaded", event => {

      if (getParameterByName('action') == "edit") {
            let productId = (getParameterByName('id') != null ? getParameterByName('id') : 0);

            fetch(`http://188.166.38.75:3030/products/${productId}`)
                  .then((response) => {
                        if (response.ok) {
                              return response.json();
                        }
                  })
                  .then((json) => {

                        let price = json[0].product_price;
                        price = price.replace('.', ',');

                        document.querySelector('#productForm').innerHTML = `
               <h2>Rediger produkt</h2>
               <label>Produkt navn</label>
               <input type="text" name="productName" id="productName" value="${json[0].product_name}">
               <br>
               <label>Produkt beskrivelse</label>
               <input type="text" name="productDescription" id="productDescription" value="${json[0].product_description}">
               <br>
               <label>Produkt pris</label>
               <input type="text" name="productPrice" id="productPrice" value="${price}">
               <br>
               <button>Gem</button>
               <a href="index.html" class="button">Annuller</a> <span id="productsFormError" class="error"></span>
               <hr>`;

                        let productFormButton = document.querySelector("#productForm button");

                        productFormButton.addEventListener('click', function (event) {
                              let name = document.querySelector('#productName').value;
                              let description = document.querySelector('#productDescription').value;
                              let price = document.querySelector('#productPrice').value;
                              let id = (getParameterByName('id') != null ? getParameterByName('id') : 0);
                              console.log(name, description, price, id);
                              if (id != 0 && name != '' && description != '' && price != '') {

                                    document.querySelector('#productsFormError').innerHTML = "";
                                    let url = `http://188.166.38.75:3030/products/${id}`;
                                    let headers = new Headers();
                                    headers.append('Content-Type', 'application/json');
                                    price = price.replace(',', '.');
                                    let init = {
                                          method: 'put',
                                          headers: headers,
                                          body: JSON.stringify({
                                                id: id,
                                                name: name,
                                                description: description,
                                                price: price

                                          }),
                                          cache: 'no-cache'
                                    };
                                    let request = new Request(url, init);

                                    fetch(request)
                                          .then(response => {
                                                console.log(response);
                                                if (response.status == 200) {
                                                      window.location.replace(`index.html`);
                                                }
                                          }).catch(err => {
                                                console.log(err);
                                          });

                              } else {
                                    document.querySelector('#productsFormError').innerHTML = "Udfyld venligst alle felter";
                                    console.log('DATA MISSING');
                              }
                        });
                  })
                  .catch((err) => {
                        console.log(err);
                  });

      } else {
            document.querySelector('#productForm').innerHTML = `

         <h2>Opret nyt produkt</h2>
         <label>Produkt navn</label>
         <input type="text" name="productName" id="productName" value="">
         <br>
         <label>Produkt beskrivelse</label>
         <input type="text" name="productDescription" id="productDescription" value="">
         <br>
         <label>Produkt pris</label>
         <input type="text" name="productPrice" id="productPrice" value="">
         <br>
         <button>Gem</button>
         <a href="index.html" class="button">Annuller</a> <span id="productsFormError" class="error"></span>
         <hr>`;

            let productFormButton = document.querySelector("#productForm button");
            productFormButton.addEventListener('click', function (event) {
                  let name = document.querySelector('#productName').value;
                  let description = document.querySelector('#productDescription').value;
                  let price = document.querySelector('#productPrice').value;
                  let Authorization = localStorage.getItem('token');
                  let userId = localStorage.getItem('userid');

                  if (name != '' && description != '' && price != '') {
                        document.querySelector('#productsFormError').innerHTML = "";
                        let url = `http://188.166.38.75:3030/products/`;
                        price = price.replace(',', '.');
                        let init = {
                              method: 'post',
                              'headers': {
                                    'Authorization': localStorage.getItem('token'),
                                    'userID': localStorage.getItem('userid'),
                                    'Content-Type': 'application/json'
                              },
                              body: JSON.stringify({
                                    name: name,
                                    description: description,
                                    price: price
                              }),
                              cache: 'no-cache'
                        };
                        let request = new Request(url, init);

                        fetch(request)
                              .then(response => {
                                    console.log(response);
                                    if (response.status == 200) {
                                          window.location.replace(`index.html`);
                                    }
                              }).catch(err => {
                                    console.log(err);
                              });

                  } else {
                        document.querySelector('#productsFormError').innerHTML = "Udfyld venligst alle felter";
                  }

            });
      }

      fetch('http://188.166.38.75:3030/products')
            .then((response) => {
                  if (response.ok) {
                        return response.json();
                  }
            })
            .then((json) => {
                  let productsList = document.querySelector('#productsList');
                  let list = `
         <table>
            <tr>
               <th></th>
               <th>id</th>
               <th>navn</th>
               <th>pris</th>
            </tr>
         `;

                  for (let i = 0; i < json.length; i++) {
                        let price = json[i].product_price;
                        price = price.replace('.', ',');
                        list += `
            <tr>
               <td>
                  <a href="?action=edit&id=${json[i].product_id}" class="button edit" data-id="${json[i].product_id}">ret</a>
                  <a href="#" class="button delete" data-id="${json[i].product_id}" onclick="return confirm('Er du sikker på du vil slette?')">slet</a>
               </td>
               <td>${json[i].product_id}</td>
               <td>${json[i].product_name}</td>
               <td style="text-align:right">${price}</td>  
            </tr>`;
                  }

                  list += `</table><hr>`;
                  productsList.innerHTML = list;

                  let deleteButtons = document.querySelectorAll('#productsList a.delete');

                  for (let j = 0; j < deleteButtons.length; j++) {
                        deleteButtons[j].addEventListener('click', (event) => {
                              let id = deleteButtons[j].dataset['id'];
                              let url = `http://188.166.38.75:3030/products/${id}`;
                              let headers = new Headers();
                              headers.append('Content-Type', 'application/json');

                              let init = {
                                    method: 'delete',
                                    headers: headers,
                                    cache: 'no-cache'
                              };
                              let request = new Request(url, init);

                              fetch(request)
                                    .then(response => {
                                          console.log(response);
                                          if (response.status == 200) {
                                                window.location.replace(`index.html`);
                                          }
                                    }).catch(err => {
                                          console.log(err);
                                    });
                        });
                  }

            })
            .catch((err) => {
                  console.log(err);
            })
});