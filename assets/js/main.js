const url = "https://api.planfact.io/api/v1/operationcategories";

const headers = {
    "Content-Type": "application/json",
    "X-ApiKey": "SpBudXW_jT7rN6wGTnGBf9vEpFcBlNoDImfl1yUvUhzn0VA3Ye9wa8GamF5jp9DAOOJDzzHwus8wHIR7wBL9HkC0TDQNxSyXKmcLkONvzKd5Lj8HuV4R33bn4Kj4SUCB5xlo-9WuJSOWzKwDYRdKlZSU1Vn_h5lVmZoY7wZKu5EdvsaKTrXe5L0AjFN1ZnND_ksPrlG_TM2IeaLR61o0EfvYkUy0oTYdFEI2B4PA-RQS6fO8cUmW8VeW5D5Y9PyKtfUSHBjXE4dYlbwjhDfNNXPOxsaVhFUwxyfh5QyW6IBTctA_db1LByuO9txnnXUv9gG9ofXz5A-AR2ogCfuWrZbrV1YzSo7rP6B_QgNPaqvxFVxqdh4c_nhYz6u0NiOVkf4przmZxTRQrOSCtFnFNlRYJ0QFZxOCa7RjvfVb-TkinBXjJab36eFfDrkwe_NJ51GQq5GsCDGa5aW2QIXzCvHxa2vhjpkfhq_vBgnEX-YWKcc-7OfmCDhdxmKMfu6SdWPd7Q"
};

let operationChilds = document.getElementById("operationChilds");
let selectArticleCategory_CREATE = document.getElementById("selectArticleCategory_CREATE");
let selectArticleCategory_EDIT = document.getElementById("selectArticleCategory_EDIT");
let activeCategory = null;
let activeCreateArticle = null;
let activeEditArticle = null;

let accountingArticles = null;
let categoryTypes = new Map([
    [4433565, "Income"],
    [4433572, "Outcome"],
    [4433525, "Assets"],
    [4433548, "Liabilities"],
    [4433560, "Capital"]
]);

async function fetchJSON(url, method, data = null) { 
    let response = await fetch(url, {
        method: method,
        headers: headers,
        body: data && JSON.stringify(data)
    });

    if (response.ok) {
        let json = await response.json();
        console.log(json);
        return json;
    } else {
        alert("Ошибка HTTP: " + response.status);
        return null;
    }
}
// MODALS

async function createArticleMenu() {
    let id = parseInt(activeCategory.id.substring("operationCategory".length));
    reloadCreateSelect(id);
    document.getElementById('createArticleModal').style.display = 'flex';
}

async function editArticleMenu(id) {
    let json = await fetchJSON(url + '/' + id, 'GET');
    if (json != null) {
        if (!json.isSuccess) {
            alert("Такой статьи не существует!");
            return;
        }
    }

    let article = json.data;
    document.getElementById('selectArticleTitle_EDIT').value = article.title;

    let category = article.operationCategoryType;
    let parent = "editOption" + article.parentOperationCategoryId;
    let categoryId;
    for (let key of categoryTypes.keys()) {
        let value = categoryTypes.get(key);
        if (value == category)
            categoryId = key;
    }

    let select = document.getElementById('selectArticleCategory_EDIT');
    await reloadEditSelect(categoryId);
    for (let i = 0; i < select.length; i++) {
        if (select.options[i].id == parent) {
            select.value = select.options[i].value;
            break;
        }
    }

    document.getElementById('btnEditArticle').onclick = function () { editArticle(id); };
    document.getElementById('editArticleModal').style.display = 'flex';
}
// EDIT ARTICLE

async function reloadEditSelect(parentId) { 
    let json = await fetchJSON(url, 'GET');
    if (json != null) {
        accountingArticles = json.data.items;
        while (selectArticleCategory_EDIT.options.length > 1) selectArticleCategory_EDIT.remove(1);
        makeActiveEditArticle(parentId);
        makeSelectEditArticleCategory(parentId, accountingArticles);
    }
}

function makeActiveEditArticle(id) { 
    if (activeEditArticle != null) activeEditArticle.classList.remove("active");
    activeEditArticle = document.getElementById("editArticle" + id);
    activeEditArticle.classList.add("active");
}

function makeSelectEditArticleCategory(parentId, articles, nesting = 0) {
    for (let item in articles) {
        let article = articles[item];
        if (article.parentOperationCategoryId == parentId) {
            let newOption = document.createElement('option');
            let html = '';
            for (let i = 0; i < nesting; i++) {
                html += "&#9679;";
            }
            html += article.title;
            newOption.innerHTML = html;
            newOption.id = "editOption" + article.operationCategoryId;
            selectArticleCategory_EDIT.appendChild(newOption);
            makeSelectEditArticleCategory(article.operationCategoryId, articles, nesting + 1);
        }
    }
}

async function editArticle(id) {
    let title = document.getElementById('selectArticleTitle_EDIT').value;
    if (title == '') {
        alert('Укажите название статьи!');
        return;
    }

    let categoryId = parseInt(activeEditArticle.id.substring("editArticle".length));
    let operationCategoryType = categoryTypes.get(categoryId);
    if (operationCategoryType === undefined) {
        alert('Некорректный тип статьи!');
        return;
    }

    let parentOperationCategoryId = parseInt((selectArticleCategory_EDIT.options[selectArticleCategory_EDIT.selectedIndex].id).substring("editOption".length));
    if (parentOperationCategoryId == 0) parentOperationCategoryId = categoryId;

    let parentJson = await fetchJSON(url + '/' + parentOperationCategoryId, 'GET'); 
    if (parentJson != null) {
        if (!parentJson.isSuccess) {
            alert("Не удалось найти родительскую статью!");
            return;
        }
    }

    let activityType = parentJson.data.activityType;

    let data = { "title": title, "operationCategoryType": operationCategoryType, "parentOperationCategoryId": parentOperationCategoryId, "activityType": activityType };
    let json = await fetchJSON(url + '/' + id, 'PUT', data);
    if (json != null) {
        if (json.isSuccess) {
            alert("Статья успешно отредактирована!");
            window.location.reload();
        }
        else {
            alert("Ошибка при редактировании статьи: " + json.errorMessage);
            return;
        }
    }
}

/* GET ARTICLES */

async function reloadArticles(parentId) { 
    let json = await fetchJSON(url, 'GET');
    if (json != null) {
        accountingArticles = json.data.items;
        operationChilds.innerHTML = "";
        makeActiveCategory(parentId);
        makeArticlesTree(parentId, accountingArticles);
    }
}

function makeActiveCategory(id) { 
    if (activeCategory != null) activeCategory.classList.remove("active");
    activeCategory = document.getElementById("operationCategory" + id);
    activeCategory.classList.add("active");
}

function makeArticlesTree(parentId, articles, nesting = 0, parentNode = operationChilds) { 
    for (let item in articles) {
        let article = articles[item];
        if (article.parentOperationCategoryId == parentId) {
            let id = article.operationCategoryId;
            let operationNode = document.createElement("div");
            operationNode.classList.add("operationWrap");
            let html = '<div class="d-flex align-items-start"><h5 class="me-auto">';
            for (let i = 0; i < nesting; i++) {
                html += "&#9679;";
            }
            html += article.title + "</h5>";
            html += '<button id="edit' + id + '" onclick="editArticleMenu(' + id + ')">Редактировать</button><button id="delete' + id + '" onclick="deleteArticle(' + id + ')">Удалить</button></div>';
            operationNode.innerHTML = html;
            operationNode = parentNode.appendChild(operationNode);

            makeArticlesTree(id, articles, nesting + 1, operationNode);
        }
    }
}



async function reloadCreateSelect(parentId) { 
    let json = await fetchJSON(url, 'GET');
    if (json != null) {
        accountingArticles = json.data.items;
        while (selectArticleCategory_CREATE.options.length > 1) selectArticleCategory_CREATE.remove(1); 
        makeActiveCreateArticle(parentId);
        makeSelectCreateArticleCategory(parentId, accountingArticles);
    }
}

function makeActiveCreateArticle(id) {  
    if (activeCreateArticle != null) activeCreateArticle.classList.remove("active");
    activeCreateArticle = document.getElementById("createArticle" + id);
    activeCreateArticle.classList.add("active");
}

function makeSelectCreateArticleCategory(parentId, articles, nesting = 0) { 
    for (let item in articles) {
        let article = articles[item];
        if (article.parentOperationCategoryId == parentId) {
            let newOption = document.createElement('option');
            let html = '';
            for (let i = 0; i < nesting; i++) {
                html += "&#9679;";
            }
            html += article.title;
            newOption.innerHTML = html;
            newOption.id = "createOption" + article.operationCategoryId;
            selectArticleCategory_CREATE.appendChild(newOption);
            makeSelectCreateArticleCategory(article.operationCategoryId, articles, nesting + 1);
        }
    }
}

async function createArticle() {
    let title = document.getElementById('selectArticleTitle_CREATE').value;
    if (title == '') {
        alert('Укажите название статьи!');
        return;
    }

    let categoryId = parseInt(activeCreateArticle.id.substring("createArticle".length));
    let operationCategoryType = categoryTypes.get(categoryId);
    if (operationCategoryType === undefined) {
        alert('Некорректный тип статьи!');
        return;
    }

    let parentOperationCategoryId = parseInt((selectArticleCategory_CREATE.options[selectArticleCategory_CREATE.selectedIndex].id).substring("createOption".length));
    if (parentOperationCategoryId == 0) parentOperationCategoryId = categoryId;

    let parentJson = await fetchJSON(url + '/' + parentOperationCategoryId, 'GET'); 
    if (parentJson != null) {
        if (!parentJson.isSuccess) {
            alert("Не удалось найти родительскую статью!");
            return;
        }
    }

    let activityType = parentJson.data.activityType;

    let data = { "title": title, "operationCategoryType": operationCategoryType, "parentOperationCategoryId": parentOperationCategoryId, "activityType": activityType };
    let json = await fetchJSON(url, 'POST', data);
    if (json != null) {
        if (json.isSuccess) {
            alert("Статья успешно добавлена!");
            window.location.reload();
        }
        else {
            alert("Ошибка при добавлении статьи: " + json.errorMessage);
            return;
        }
    }
}
// DELETE ARTICLE

async function deleteArticle(id) {
    let isConfirm = confirm("Вы уверены?");
    if (isConfirm) {
        let json = await fetchJSON(url + '/' + id, 'DELETE');
        if (json != null) {
            if (json.isSuccess) {
                alert("Статья успешно удалена!");
                window.location.reload();
            }
            else {
                alert("Ошибка при удалении статьи: " + json.errorMessage);
                return;
            }
        }
    }
}

window.onload = function () {
    window.reloadArticles = reloadArticles;
    window.reloadCreateSelect = reloadCreateSelect;
    window.reloadEditSelect = reloadEditSelect;
    window.createArticleMenu = createArticleMenu;
    window.editArticleMenu = editArticleMenu;
    window.createArticle = createArticle;
    window.editArticle = editArticle;
    window.deleteArticle = deleteArticle;
    reloadArticles(4433565);
};