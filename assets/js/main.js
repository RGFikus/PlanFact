
document.querySelector("#load").onclick = function(){

  let title;
  let operationCategoryType ;
  let parentOperationCategoryId ;
  let activityType ;
  $.ajax({
                
    
    method: "GET",
    dataType : 'json',
    url: "https://api.planfact.io/api/v1/operationcategories",  
    data: { "title": title, "operationCategoryType": operationCategoryType, "activityType": activityType, "parentOperationCategoryId": parentOperationCategoryId },   
    headers: {
     "Accept":" application/json",
     "X-ApiKey": 'SpBudXW_jT7rN6wGTnGBf9vEpFcBlNoDImfl1yUvUhzn0VA3Ye9wa8GamF5jp9DAOOJDzzHwus8wHIR7wBL9HkC0TDQNxSyXKmcLkONvzKd5Lj8HuV4R33bn4Kj4SUCB5xlo-9WuJSOWzKwDYRdKlZSU1Vn_h5lVmZoY7wZKu5EdvsaKTrXe5L0AjFN1ZnND_ksPrlG_TM2IeaLR61o0EfvYkUy0oTYdFEI2B4PA-RQS6fO8cUmW8VeW5D5Y9PyKtfUSHBjXE4dYlbwjhDfNNXPOxsaVhFUwxyfh5QyW6IBTctA_db1LByuO9txnnXUv9gG9ofXz5A-AR2ogCfuWrZbrV1YzSo7rP6B_QgNPaqvxFVxqdh4c_nhYz6u0NiOVkf4przmZxTRQrOSCtFnFNlRYJ0QFZxOCa7RjvfVb-TkinBXjJab36eFfDrkwe_NJ51GQq5GsCDGa5aW2QIXzCvHxa2vhjpkfhq_vBgnEX-YWKcc-7OfmCDhdxmKMfu6SdWPd7Q'
             }})
  .success(function( msg ) {
  $('#errs').html('');
  console.log(msg)
  });
  alert("Статьи загружены");
  }
